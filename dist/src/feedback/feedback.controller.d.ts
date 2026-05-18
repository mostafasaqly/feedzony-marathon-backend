import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
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
    getAllForUser(req: any): Promise<{
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
    getByService(req: any, serviceId: string): Promise<{
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
    getStats(req: any, serviceId: string): Promise<{
        totalCount: number;
        averageRating: number;
        thisMonth: number;
    }>;
}
