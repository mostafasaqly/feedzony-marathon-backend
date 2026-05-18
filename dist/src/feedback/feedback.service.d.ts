import { PrismaService } from '../prisma/prisma.service';
import { ServicesService } from '../services/services.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
export declare class FeedbackService {
    private readonly prisma;
    private readonly servicesService;
    private readonly notificationsService;
    constructor(prisma: PrismaService, servicesService: ServicesService, notificationsService: NotificationsService);
    submitFeedback(slug: string, dto: CreateFeedbackDto): Promise<{
        id: string;
        createdAt: Date;
        service: {
            id: string;
            name: string;
            slug: string;
        };
        rating: number;
        comment: string | null;
    }>;
    getFeedbackByService(serviceId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        service: {
            id: string;
            name: string;
            slug: string;
        };
        rating: number;
        comment: string | null;
    }[]>;
    getAllFeedbackForUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        service: {
            id: string;
            name: string;
            slug: string;
        };
        rating: number;
        comment: string | null;
    }[]>;
    getStats(serviceId: string, userId: string): Promise<{
        totalCount: number;
        averageRating: number;
        thisMonth: number;
    }>;
}
