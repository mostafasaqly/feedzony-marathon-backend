import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServicesService } from '../services/services.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

const feedbackSelect = {
  id: true,
  rating: true,
  comment: true,
  createdAt: true,
  service: {
    select: { id: true, name: true, slug: true },
  },
};

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly servicesService: ServicesService,
  ) {}

  async submitFeedback(slug: string, dto: CreateFeedbackDto) {
    const service = await this.prisma.service.findUnique({ where: { slug } });
    if (!service) throw new NotFoundException('Service not found');

    return this.prisma.feedback.create({
      data: {
        rating: dto.rating,
        comment: dto.comment ?? null,
        serviceId: service.id,
      },
      select: feedbackSelect,
    });
  }

  async getFeedbackByService(serviceId: string, userId: string) {
    await this.servicesService.findOne(serviceId, userId);

    return this.prisma.feedback.findMany({
      where: { serviceId },
      orderBy: { createdAt: 'desc' },
      select: feedbackSelect,
    });
  }

  async getAllFeedbackForUser(userId: string) {
    return this.prisma.feedback.findMany({
      where: { service: { userId } },
      orderBy: { createdAt: 'desc' },
      select: feedbackSelect,
    });
  }

  async getStats(serviceId: string, userId: string) {
    await this.servicesService.findOne(serviceId, userId);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalCount, aggregate, thisMonth] = await Promise.all([
      this.prisma.feedback.count({ where: { serviceId } }),
      this.prisma.feedback.aggregate({
        where: { serviceId },
        _avg: { rating: true },
      }),
      this.prisma.feedback.count({
        where: { serviceId, createdAt: { gte: monthStart } },
      }),
    ]);

    const avg = aggregate._avg.rating ?? 0;

    return {
      totalCount,
      averageRating: Math.round(avg * 10) / 10,
      thisMonth,
    };
  }
}
