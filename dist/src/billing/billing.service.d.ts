import { PrismaService } from '../prisma/prisma.service';
export declare class BillingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPlans(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        price: number;
        maxServices: number;
        maxFeedback: number;
        hasAnalytics: boolean;
        hasNotifications: boolean;
        createdAt: Date;
    }[]>;
    getMyPlan(userId: string): Promise<{
        plan: {
            id: string;
            name: string;
            price: number;
            maxServices: number;
            maxFeedback: number;
            hasAnalytics: boolean;
            hasNotifications: boolean;
            createdAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        currentPeriodEnd: Date | null;
        userId: string;
        planId: string;
    }>;
    getMyUsage(userId: string): Promise<{
        plan: {
            name: string;
            price: number;
            maxServices: number;
            maxFeedback: number;
            hasAnalytics: boolean;
            hasNotifications: boolean;
        };
        subscription: {
            status: string;
            createdAt: string;
        };
        usage: {
            servicesUsed: number;
            servicesLimit: number;
            feedbackThisMonth: number;
            feedbackLimit: number;
        };
    }>;
    changePlan(userId: string, planName: 'Free' | 'Pro'): Promise<{
        plan: {
            id: string;
            name: string;
            price: number;
            maxServices: number;
            maxFeedback: number;
            hasAnalytics: boolean;
            hasNotifications: boolean;
            createdAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        currentPeriodEnd: Date | null;
        userId: string;
        planId: string;
    }>;
}
