import { ConfigService } from '@nestjs/config';
export interface CreateCheckoutOptions {
    variantId: string;
    userId: string;
    email: string;
    name?: string;
}
export declare class LemonSqueezyService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    private get apiKey();
    private get storeId();
    private get webhookSecret();
    private request;
    createCheckout(opts: CreateCheckoutOptions): Promise<string>;
    cancelSubscription(lemonSubscriptionId: string): Promise<void>;
    verifyWebhookSignature(rawBody: Buffer, signature?: string): boolean;
}
