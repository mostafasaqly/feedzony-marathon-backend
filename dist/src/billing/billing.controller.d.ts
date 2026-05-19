import type { Request } from 'express';
import { BillingService } from './billing.service';
import { LemonSqueezyService } from './lemon-squeezy.service';
declare class CheckoutDto {
    planName: string;
}
export declare class BillingController {
    private readonly billingService;
    private readonly lemon;
    constructor(billingService: BillingService, lemon: LemonSqueezyService);
    getPlans(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        price: number;
        maxServices: number;
        maxFeedback: number;
        hasAnalytics: boolean;
        hasNotifications: boolean;
        lemonVariantId: string | null;
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
            lemonVariantId: string | null;
            createdAt: Date;
        };
    } & {
        id: string;
        lemonVariantId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        lemonCustomerId: string | null;
        lemonSubscriptionId: string | null;
        lemonOrderId: string | null;
        cancelAtPeriodEnd: boolean;
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
            cancelAtPeriodEnd: boolean;
            currentPeriodEnd: string | null;
            createdAt: string;
        };
        usage: {
            servicesUsed: number;
            servicesLimit: number;
            feedbackThisMonth: number;
            feedbackLimit: number;
        };
    }>;
    createCheckout(req: any, body: CheckoutDto): Promise<{
        checkoutUrl: string;
    }>;
    cancelSubscription(req: any): Promise<{
        plan: {
            id: string;
            name: string;
            price: number;
            maxServices: number;
            maxFeedback: number;
            hasAnalytics: boolean;
            hasNotifications: boolean;
            lemonVariantId: string | null;
            createdAt: Date;
        };
    } & {
        id: string;
        lemonVariantId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        lemonCustomerId: string | null;
        lemonSubscriptionId: string | null;
        lemonOrderId: string | null;
        cancelAtPeriodEnd: boolean;
        currentPeriodEnd: Date | null;
        userId: string;
        planId: string;
    }>;
    handleWebhook(req: Request, signature: string): Promise<{
        handled: boolean;
    }>;
}
export {};
