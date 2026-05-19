import { PrismaService } from '../prisma/prisma.service';
type Filter = 'all' | 'unread' | 'read';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createNotification(userId: string, title: string, message: string): import("@prisma/client").Prisma.Prisma__NotificationClient<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        read: boolean;
        message: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getAll(userId: string, filter?: Filter): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        read: boolean;
        message: string;
    }[]>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markAsRead(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        read: boolean;
        message: string;
    }>;
    markAllAsRead(userId: string): Promise<{
        updated: number;
    }>;
    getRecent(userId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        read: boolean;
        message: string;
    }[]>;
}
export {};
