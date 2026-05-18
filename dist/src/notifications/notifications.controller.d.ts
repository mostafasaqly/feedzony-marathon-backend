import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getRecent(req: any): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        message: string;
        read: boolean;
    }[]>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    getAll(req: any, filter?: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        message: string;
        read: boolean;
    }[]>;
    markAllAsRead(req: any): Promise<{
        updated: number;
    }>;
    markAsRead(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        message: string;
        read: boolean;
    }>;
}
