export type LemonWebhookEventName = 'subscription_created' | 'subscription_updated' | 'subscription_cancelled' | 'subscription_resumed' | 'subscription_expired' | 'subscription_paused' | 'subscription_unpaused' | 'order_created';
export interface LemonSubscriptionAttributes {
    store_id: number;
    customer_id: number;
    order_id: number;
    product_id: number;
    variant_id: number;
    status: 'on_trial' | 'active' | 'paused' | 'past_due' | 'unpaid' | 'cancelled' | 'expired';
    cancelled: boolean;
    renews_at: string | null;
    ends_at: string | null;
    user_email: string;
}
export interface LemonWebhookPayload {
    meta: {
        event_name: LemonWebhookEventName;
        custom_data?: {
            user_id?: string;
        };
    };
    data: {
        type: string;
        id: string;
        attributes: LemonSubscriptionAttributes;
    };
}
