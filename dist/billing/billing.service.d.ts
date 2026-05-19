import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LemonSqueezyService } from './lemon-squeezy.service';
import { LemonWebhookPayload } from './lemon-squeezy.types';
export declare class BillingService {
    private readonly prisma;
    private readonly lemon;
    private readonly notifications;
    private readonly logger;
    constructor(prisma: PrismaService, lemon: LemonSqueezyService, notifications: NotificationsService);
    getPlans(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        price: number;
        maxServices: number;
        maxFeedback: number;
        hasAnalytics: boolean;
        hasNotifications: boolean;
        lemonVariantId: string | null;
    }[]>;
    getMyPlan(userId: string): Promise<{
        plan: {
            id: string;
            name: string;
            createdAt: Date;
            price: number;
            maxServices: number;
            maxFeedback: number;
            hasAnalytics: boolean;
            hasNotifications: boolean;
            lemonVariantId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lemonVariantId: string | null;
        status: string;
        lemonCustomerId: string | null;
        lemonSubscriptionId: string | null;
        lemonOrderId: string | null;
        cancelAtPeriodEnd: boolean;
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
    createCheckout(userId: string, planName: string): Promise<{
        checkoutUrl: string;
    }>;
    cancelSubscription(userId: string): Promise<{
        plan: {
            id: string;
            name: string;
            createdAt: Date;
            price: number;
            maxServices: number;
            maxFeedback: number;
            hasAnalytics: boolean;
            hasNotifications: boolean;
            lemonVariantId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lemonVariantId: string | null;
        status: string;
        lemonCustomerId: string | null;
        lemonSubscriptionId: string | null;
        lemonOrderId: string | null;
        cancelAtPeriodEnd: boolean;
        currentPeriodEnd: Date | null;
        userId: string;
        planId: string;
    }>;
    handleWebhook(payload: LemonWebhookPayload): Promise<{
        handled: boolean;
    }>;
    private resolveUserId;
    private onSubscriptionCreated;
    private onSubscriptionActive;
    private onSubscriptionCancelled;
    private onSubscriptionExpired;
    private findByLemonId;
    private notify;
}
