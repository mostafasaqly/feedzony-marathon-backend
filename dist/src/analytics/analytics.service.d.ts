import { PrismaService } from '../prisma/prisma.service';
type Period = 'week' | 'month' | 'all';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getOverview(userId: string, period: Period): Promise<{
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
    getServiceAnalytics(serviceId: string, userId: string, period: Period): Promise<{
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
    private calcAverage;
    private calcDistribution;
    private calcOverTime;
    private calcThisMonth;
}
export {};
