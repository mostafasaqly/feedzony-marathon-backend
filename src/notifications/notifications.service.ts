import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Filter = 'all' | 'unread' | 'read';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  createNotification(userId: string, title: string, message: string) {
    return this.prisma.notification.create({
      data: { userId, title, message },
    });
  }

  getAll(userId: string, filter: Filter = 'all') {
    const readFilter =
      filter === 'unread' ? false : filter === 'read' ? true : undefined;

    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(readFilter !== undefined && { read: readFilter }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { count };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { updated: result.count };
  }

  getRecent(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
  }
}
