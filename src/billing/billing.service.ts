import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

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

  async changePlan(userId: string, planName: 'Free' | 'Pro') {
    const plan = await this.prisma.plan.findUnique({ where: { name: planName } });
    if (!plan) throw new NotFoundException(`Plan "${planName}" not found`);

    return this.prisma.subscription.update({
      where: { userId },
      data: { planId: plan.id },
      include: { plan: true },
    });
  }
}
