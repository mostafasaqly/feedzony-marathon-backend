import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LemonSqueezyService } from './lemon-squeezy.service';
import { LemonWebhookPayload } from './lemon-squeezy.types';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly lemon: LemonSqueezyService,
    private readonly notifications: NotificationsService,
  ) {}

  getPlans() {
    return this.prisma.plan.findMany({ orderBy: { price: 'asc' } });
  }

  async getMyPlan(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });
    if (!subscription) throw new NotFoundException('No active subscription found');
    return subscription;
  }

  async getMyUsage(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });
    if (!subscription) throw new NotFoundException('No active subscription found');

    const services = await this.prisma.service.findMany({ where: { userId } });
    const serviceIds = services.map((s) => s.id);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const feedbackThisMonth = await this.prisma.feedback.count({
      where: {
        serviceId: { in: serviceIds },
        createdAt: { gte: monthStart },
      },
    });

    const { plan } = subscription;
    return {
      plan: {
        name: plan.name,
        price: plan.price,
        maxServices: plan.maxServices,
        maxFeedback: plan.maxFeedback,
        hasAnalytics: plan.hasAnalytics,
        hasNotifications: plan.hasNotifications,
      },
      subscription: {
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
        createdAt: subscription.createdAt.toISOString(),
      },
      usage: {
        servicesUsed: services.length,
        servicesLimit: plan.maxServices,
        feedbackThisMonth,
        feedbackLimit: plan.maxFeedback,
      },
    };
  }

  /**
   * Creates a Lemon Squeezy hosted checkout for the requested paid plan and
   * returns the checkout URL the frontend should redirect the user to.
   */
  async createCheckout(userId: string, planName: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.prisma.plan.findUnique({ where: { name: planName } });
    if (!plan) throw new NotFoundException(`Plan "${planName}" not found`);
    if (plan.price <= 0) {
      throw new BadRequestException('The Free plan does not require checkout');
    }
    if (!plan.lemonVariantId) {
      throw new BadRequestException(
        `Plan "${planName}" is not linked to a Lemon Squeezy variant`,
      );
    }

    const url = await this.lemon.createCheckout({
      variantId: plan.lemonVariantId,
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return { checkoutUrl: url };
  }

  /**
   * Cancels the user's paid subscription in Lemon Squeezy. Access remains until
   * the end of the paid period; the `subscription_cancelled` webhook flips the
   * local status.
   */
  async cancelSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    if (!subscription) throw new NotFoundException('No active subscription found');
    if (!subscription.lemonSubscriptionId) {
      throw new BadRequestException('Subscription is not managed by Lemon Squeezy');
    }

    await this.lemon.cancelSubscription(subscription.lemonSubscriptionId);

    const updated = await this.prisma.subscription.update({
      where: { userId },
      data: { cancelAtPeriodEnd: true },
      include: { plan: true },
    });
    return updated;
  }

  /**
   * Processes a verified Lemon Squeezy webhook. Signature verification is
   * performed by the controller before this is called.
   */
  async handleWebhook(payload: LemonWebhookPayload) {
    const event = payload.meta.event_name;
    const attrs = payload.data.attributes;
    this.logger.log(`Lemon Squeezy webhook: ${event}`);

    switch (event) {
      case 'subscription_created':
        return this.onSubscriptionCreated(payload);
      case 'subscription_updated':
      case 'subscription_resumed':
      case 'subscription_unpaused':
        return this.onSubscriptionActive(payload);
      case 'subscription_cancelled':
      case 'subscription_paused':
        return this.onSubscriptionCancelled(payload);
      case 'subscription_expired':
        return this.onSubscriptionExpired(payload);
      default:
        this.logger.debug(`Ignoring unhandled event "${event}" (${attrs.status})`);
        return { handled: false };
    }
  }

  /** Resolves the FeedZony user a webhook belongs to. */
  private async resolveUserId(
    payload: LemonWebhookPayload,
  ): Promise<string | null> {
    const customUserId = payload.meta.custom_data?.user_id;
    if (customUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: customUserId },
      });
      if (user) return user.id;
    }

    // Fall back to matching by email or an existing lemon subscription id.
    const lemonSubscriptionId = String(payload.data.id);
    const existing = await this.prisma.subscription.findUnique({
      where: { lemonSubscriptionId },
    });
    if (existing) return existing.userId;

    const email = payload.data.attributes.user_email;
    if (email) {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (user) return user.id;
    }

    this.logger.warn(
      `Could not resolve user for Lemon Squeezy subscription ${lemonSubscriptionId}`,
    );
    return null;
  }

  private async onSubscriptionCreated(payload: LemonWebhookPayload) {
    const userId = await this.resolveUserId(payload);
    if (!userId) return { handled: false };

    const attrs = payload.data.attributes;
    const proPlan = await this.prisma.plan.findFirst({
      where: { lemonVariantId: String(attrs.variant_id) },
    });
    if (!proPlan) {
      this.logger.warn(`No plan mapped to variant ${attrs.variant_id}`);
      return { handled: false };
    }

    await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        planId: proPlan.id,
        status: attrs.status,
        cancelAtPeriodEnd: attrs.cancelled,
        lemonCustomerId: String(attrs.customer_id),
        lemonSubscriptionId: String(payload.data.id),
        lemonOrderId: String(attrs.order_id),
        lemonVariantId: String(attrs.variant_id),
        currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : null,
      },
      create: {
        userId,
        planId: proPlan.id,
        status: attrs.status,
        cancelAtPeriodEnd: attrs.cancelled,
        lemonCustomerId: String(attrs.customer_id),
        lemonSubscriptionId: String(payload.data.id),
        lemonOrderId: String(attrs.order_id),
        lemonVariantId: String(attrs.variant_id),
        currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : null,
      },
    });

    await this.notify(
      userId,
      'Subscription activated',
      `Your ${proPlan.name} plan is now active. Enjoy the upgrade!`,
    );
    return { handled: true };
  }

  private async onSubscriptionActive(payload: LemonWebhookPayload) {
    const attrs = payload.data.attributes;
    const subscription = await this.findByLemonId(payload);
    if (!subscription) return { handled: false };

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: attrs.status,
        cancelAtPeriodEnd: attrs.cancelled,
        currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : null,
      },
    });
    return { handled: true };
  }

  private async onSubscriptionCancelled(payload: LemonWebhookPayload) {
    const attrs = payload.data.attributes;
    const subscription = await this.findByLemonId(payload);
    if (!subscription) return { handled: false };

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: attrs.status,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: attrs.ends_at ? new Date(attrs.ends_at) : null,
      },
    });

    await this.notify(
      subscription.userId,
      'Subscription cancelled',
      'Your plan was cancelled. You keep access until the end of the billing period.',
    );
    return { handled: true };
  }

  /** Subscription has fully ended — downgrade the user back to the Free plan. */
  private async onSubscriptionExpired(payload: LemonWebhookPayload) {
    const subscription = await this.findByLemonId(payload);
    if (!subscription) return { handled: false };

    const freePlan = await this.prisma.plan.findUnique({
      where: { name: 'Free' },
    });
    if (!freePlan) {
      this.logger.error('Free plan missing — cannot downgrade expired subscription');
      return { handled: false };
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        planId: freePlan.id,
        status: 'active',
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
        lemonSubscriptionId: null,
        lemonVariantId: null,
      },
    });

    await this.notify(
      subscription.userId,
      'Plan downgraded',
      'Your subscription expired. You are now on the Free plan.',
    );
    return { handled: true };
  }

  private findByLemonId(payload: LemonWebhookPayload) {
    return this.prisma.subscription.findUnique({
      where: { lemonSubscriptionId: String(payload.data.id) },
    });
  }

  private async notify(userId: string, title: string, message: string) {
    try {
      await this.notifications.createNotification(userId, title, message);
    } catch (err) {
      this.logger.warn(`Failed to create billing notification: ${String(err)}`);
    }
  }
}
