import { BillingService } from './billing.service';
declare class ChangePlanDto {
    planName: 'Free' | 'Pro';
}
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
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
    getMyPlan(req: any): Promise<{
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
    getMyUsage(req: any): Promise<{
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
    changePlan(req: any, body: ChangePlanDto): Promise<{
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
export {};
