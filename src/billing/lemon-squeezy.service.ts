import { createHmac, timingSafeEqual } from 'crypto';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const LEMON_API = 'https://api.lemonsqueezy.com/v1';

export interface CreateCheckoutOptions {
  variantId: string;
  userId: string;
  email: string;
  name?: string;
}

/**
 * Thin client around the Lemon Squeezy REST API plus webhook helpers.
 * Docs: https://docs.lemonsqueezy.com/api
 */
@Injectable()
export class LemonSqueezyService {
  private readonly logger = new Logger(LemonSqueezyService.name);

  constructor(private readonly config: ConfigService) {}

  private get apiKey(): string {
    const key = this.config.get<string>('LEMON_SQUEEZY_API_KEY');
    if (!key) {
      throw new InternalServerErrorException(
        'LEMON_SQUEEZY_API_KEY is not configured',
      );
    }
    return key;
  }

  private get storeId(): string {
    const id = this.config.get<string>('LEMON_SQUEEZY_STORE_ID');
    if (!id) {
      throw new InternalServerErrorException(
        'LEMON_SQUEEZY_STORE_ID is not configured',
      );
    }
    return id;
  }

  private get webhookSecret(): string {
    const secret = this.config.get<string>('LEMON_SQUEEZY_WEBHOOK_SECRET');
    if (!secret) {
      throw new InternalServerErrorException(
        'LEMON_SQUEEZY_WEBHOOK_SECRET is not configured',
      );
    }
    return secret;
  }

  private async request<T>(
    path: string,
    init: { method: string; body?: unknown },
  ): Promise<T> {
    const res = await fetch(`${LEMON_API}${path}`, {
      method: init.method,
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Lemon Squeezy API ${path} failed: ${res.status} ${text}`);
      throw new InternalServerErrorException(
        'Lemon Squeezy request failed. Please try again later.',
      );
    }

    return res.json() as Promise<T>;
  }

  /**
   * Creates a hosted checkout for the given plan variant and returns its URL.
   * The userId is passed as custom data so the webhook can map the resulting
   * subscription back to a FeedZony user.
   */
  async createCheckout(opts: CreateCheckoutOptions): Promise<string> {
    const redirectUrl = this.config.get<string>('FRONTEND_URL') ?? '';

    const payload = {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: opts.email,
            name: opts.name,
            custom: { user_id: opts.userId },
          },
          product_options: {
            redirect_url: `${redirectUrl}/billing?checkout=success`,
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: this.storeId } },
          variant: { data: { type: 'variants', id: opts.variantId } },
        },
      },
    };

    const result = await this.request<{
      data: { attributes: { url: string } };
    }>('/checkouts', { method: 'POST', body: payload });

    return result.data.attributes.url;
  }

  /** Cancels a Lemon Squeezy subscription at the end of the current period. */
  async cancelSubscription(lemonSubscriptionId: string): Promise<void> {
    await this.request(`/subscriptions/${lemonSubscriptionId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Verifies the `X-Signature` header of an incoming webhook against the
   * raw request body using HMAC-SHA256. Returns true when the signature is valid.
   */
  verifyWebhookSignature(rawBody: Buffer, signature?: string): boolean {
    if (!signature) return false;

    const digest = createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expected = Buffer.from(digest, 'hex');
    const received = Buffer.from(signature, 'hex');

    if (expected.length !== received.length) return false;
    return timingSafeEqual(expected, received);
  }
}
