import { PrismaService } from '../prisma/prisma.service';
import { ServicesService } from '../services/services.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
export declare class FeedbackService {
    private readonly prisma;
    private readonly servicesService;
    constructor(prisma: PrismaService, servicesService: ServicesService);
    submitFeedback(slug: string, dto: CreateFeedbackDto): Promise<{
        service: {
            id: string;
            name: string;
            slug: string;
        };
        id: string;
        createdAt: Date;
        rating: number;
        comment: string | null;
    }>;
    getFeedbackByService(serviceId: string, userId: string): Promise<{
        service: {
            id: string;
            name: string;
            slug: string;
        };
        id: string;
        createdAt: Date;
        rating: number;
        comment: string | null;
    }[]>;
    getAllFeedbackForUser(userId: string): Promise<{
        service: {
            id: string;
            name: string;
            slug: string;
        };
        id: string;
        createdAt: Date;
        rating: number;
        comment: string | null;
    }[]>;
    getStats(serviceId: string, userId: string): Promise<{
        totalCount: number;
        averageRating: number;
        thisMonth: number;
    }>;
}
