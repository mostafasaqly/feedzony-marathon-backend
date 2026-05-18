import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
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
    getAllForUser(req: any): Promise<{
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
    getByService(req: any, serviceId: string): Promise<{
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
    getStats(req: any, serviceId: string): Promise<{
        totalCount: number;
        averageRating: number;
        thisMonth: number;
    }>;
}
