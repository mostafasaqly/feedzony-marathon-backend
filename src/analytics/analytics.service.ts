import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Period = 'week' | 'month' | 'all';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string, period: Period) {
    const services = await this.prisma.service.findMany({
      where: { userId },
    });

    const serviceIds = services.map((s) => s.id);

    const feedbacks = await this.prisma.feedback.findMany({
      where: { serviceId: { in: serviceIds } },
      orderBy: { createdAt: 'desc' },
    });

    const topServices = services
      .map((service) => {
        const serviceFeedbacks = feedbacks.filter((f) => f.serviceId === service.id);
        const sorted = [...serviceFeedbacks].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
        return {
          serviceId: service.id,
          serviceName: service.name,
          slug: service.slug,
          totalFeedback: serviceFeedbacks.length,
          averageRating: this.calcAverage(serviceFeedbacks),
          lastFeedbackAt: sorted[0]?.createdAt.toISOString() ?? null,
        };
      })
      .sort((a, b) => b.totalFeedback - a.totalFeedback);

    return {
      totalFeedback: feedbacks.length,
      averageRating: this.calcAverage(feedbacks),
      totalServices: services.length,
      thisMonth: this.calcThisMonth(feedbacks),
      ratingDistribution: this.calcDistribution(feedbacks),
      feedbackOverTime: this.calcOverTime(feedbacks, period),
      topServices,
    };
  }

  async getServiceAnalytics(serviceId: string, userId: string, period: Period) {
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundException('Service not found');
    if (service.userId !== userId) throw new ForbiddenException('Access denied');

    const feedbacks = await this.prisma.feedback.findMany({
      where: { serviceId },
      orderBy: { createdAt: 'desc' },
    });

    const recentFeedback = feedbacks.slice(0, 5).map((f) => ({
      id: f.id,
      rating: f.rating,
      comment: f.comment,
      createdAt: f.createdAt.toISOString(),
    }));

    return {
      serviceId: service.id,
      serviceName: service.name,
      totalFeedback: feedbacks.length,
      averageRating: this.calcAverage(feedbacks),
      thisMonth: this.calcThisMonth(feedbacks),
      ratingDistribution: this.calcDistribution(feedbacks),
      feedbackOverTime: this.calcOverTime(feedbacks, period),
      recentFeedback,
    };
  }

  private calcAverage(feedbacks: { rating: number }[]): number {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    return Math.round((sum / feedbacks.length) * 10) / 10;
  }

  private calcDistribution(feedbacks: { rating: number }[]): Record<string, number> {
    const dist: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    for (const f of feedbacks) {
      const key = String(f.rating);
      if (key in dist) dist[key]++;
    }
    return dist;
  }

  private calcOverTime(
    feedbacks: { createdAt: Date }[],
    period: Period,
  ): { date: string; count: number }[] {
    const now = new Date();

    if (period === 'all') {
      const months: { date: string; count: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          count: 0,
        });
      }
      for (const f of feedbacks) {
        const key = `${f.createdAt.getFullYear()}-${String(f.createdAt.getMonth() + 1).padStart(2, '0')}`;
        const entry = months.find((m) => m.date === key);
        if (entry) entry.count++;
      }
      return months;
    }

    const days = period === 'week' ? 7 : 30;
    const result: { date: string; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      result.push({
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        count: 0,
      });
    }

    for (const f of feedbacks) {
      const key = `${f.createdAt.getFullYear()}-${String(f.createdAt.getMonth() + 1).padStart(2, '0')}-${String(f.createdAt.getDate()).padStart(2, '0')}`;
      const entry = result.find((r) => r.date === key);
      if (entry) entry.count++;
    }

    return result;
  }

  private calcThisMonth(feedbacks: { createdAt: Date }[]): number {
    const now = new Date();
    return feedbacks.filter(
      (f) =>
        f.createdAt.getFullYear() === now.getFullYear() &&
        f.createdAt.getMonth() === now.getMonth(),
    ).length;
  }
}
