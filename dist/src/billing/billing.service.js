"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const lemon_squeezy_service_1 = require("./lemon-squeezy.service");
let BillingService = BillingService_1 = class BillingService {
    prisma;
    lemon;
    notifications;
    logger = new common_1.Logger(BillingService_1.name);
    constructor(prisma, lemon, notifications) {
        this.prisma = prisma;
        this.lemon = lemon;
        this.notifications = notifications;
    }
    getPlans() {
        return this.prisma.plan.findMany({ orderBy: { price: 'asc' } });
    }
    async getMyPlan(userId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });
        if (!subscription)
            throw new common_1.NotFoundException('No active subscription found');
        return subscription;
    }
    async getMyUsage(userId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });
        if (!subscription)
            throw new common_1.NotFoundException('No active subscription found');
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
    async createCheckout(userId, planName) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const plan = await this.prisma.plan.findUnique({ where: { name: planName } });
        if (!plan)
            throw new common_1.NotFoundException(`Plan "${planName}" not found`);
        if (plan.price <= 0) {
            throw new common_1.BadRequestException('The Free plan does not require checkout');
        }
        if (!plan.lemonVariantId) {
            throw new common_1.BadRequestException(`Plan "${planName}" is not linked to a Lemon Squeezy variant`);
        }
        const url = await this.lemon.createCheckout({
            variantId: plan.lemonVariantId,
            userId: user.id,
            email: user.email,
            name: user.name,
        });
        return { checkoutUrl: url };
    }
    async cancelSubscription(userId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        if (!subscription)
            throw new common_1.NotFoundException('No active subscription found');
        if (!subscription.lemonSubscriptionId) {
            throw new common_1.BadRequestException('Subscription is not managed by Lemon Squeezy');
        }
        await this.lemon.cancelSubscription(subscription.lemonSubscriptionId);
        const updated = await this.prisma.subscription.update({
            where: { userId },
            data: { cancelAtPeriodEnd: true },
            include: { plan: true },
        });
        return updated;
    }
    async handleWebhook(payload) {
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
    async resolveUserId(payload) {
        const customUserId = payload.meta.custom_data?.user_id;
        if (customUserId) {
            const user = await this.prisma.user.findUnique({
                where: { id: customUserId },
            });
            if (user)
                return user.id;
        }
        const lemonSubscriptionId = String(payload.data.id);
        const existing = await this.prisma.subscription.findUnique({
            where: { lemonSubscriptionId },
        });
        if (existing)
            return existing.userId;
        const email = payload.data.attributes.user_email;
        if (email) {
            const user = await this.prisma.user.findUnique({ where: { email } });
            if (user)
                return user.id;
        }
        this.logger.warn(`Could not resolve user for Lemon Squeezy subscription ${lemonSubscriptionId}`);
        return null;
    }
    async onSubscriptionCreated(payload) {
        const userId = await this.resolveUserId(payload);
        if (!userId)
            return { handled: false };
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
        await this.notify(userId, 'Subscription activated', `Your ${proPlan.name} plan is now active. Enjoy the upgrade!`);
        return { handled: true };
    }
    async onSubscriptionActive(payload) {
        const attrs = payload.data.attributes;
        const subscription = await this.findByLemonId(payload);
        if (!subscription)
            return { handled: false };
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
    async onSubscriptionCancelled(payload) {
        const attrs = payload.data.attributes;
        const subscription = await this.findByLemonId(payload);
        if (!subscription)
            return { handled: false };
        await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                status: attrs.status,
                cancelAtPeriodEnd: true,
                currentPeriodEnd: attrs.ends_at ? new Date(attrs.ends_at) : null,
            },
        });
        await this.notify(subscription.userId, 'Subscription cancelled', 'Your plan was cancelled. You keep access until the end of the billing period.');
        return { handled: true };
    }
    async onSubscriptionExpired(payload) {
        const subscription = await this.findByLemonId(payload);
        if (!subscription)
            return { handled: false };
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
        await this.notify(subscription.userId, 'Plan downgraded', 'Your subscription expired. You are now on the Free plan.');
        return { handled: true };
    }
    findByLemonId(payload) {
        return this.prisma.subscription.findUnique({
            where: { lemonSubscriptionId: String(payload.data.id) },
        });
    }
    async notify(userId, title, message) {
        try {
            await this.notifications.createNotification(userId, title, message);
        }
        catch (err) {
            this.logger.warn(`Failed to create billing notification: ${String(err)}`);
        }
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = BillingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        lemon_squeezy_service_1.LemonSqueezyService,
        notifications_service_1.NotificationsService])
], BillingService);
//# sourceMappingURL=billing.service.js.map