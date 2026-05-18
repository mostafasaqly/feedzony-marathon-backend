import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getOverview(req: any, period?: string): Promise<{
        totalFeedback: number;
        averageRating: number;
        totalServices: number;
        thisMonth: number;
        ratingDistribution: Record<string, number>;
        feedbackOverTime: {
            date: string;
            count: number;
        }[];
        topServices: {
            serviceId: string;
            serviceName: string;
            slug: string;
            totalFeedback: number;
            averageRating: number;
            lastFeedbackAt: string;
        }[];
    }>;
    getServiceAnalytics(req: any, serviceId: string, period?: string): Promise<{
        serviceId: string;
        serviceName: string;
        totalFeedback: number;
        averageRating: number;
        thisMonth: number;
        ratingDistribution: Record<string, number>;
        feedbackOverTime: {
            date: string;
            count: number;
        }[];
        recentFeedback: {
            id: string;
            rating: number;
            comment: string | null;
            createdAt: string;
        }[];
    }>;
}
