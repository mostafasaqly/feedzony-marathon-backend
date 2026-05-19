"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LemonSqueezyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LemonSqueezyService = void 0;
const crypto_1 = require("crypto");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const LEMON_API = 'https://api.lemonsqueezy.com/v1';
let LemonSqueezyService = LemonSqueezyService_1 = class LemonSqueezyService {
    config;
    logger = new common_1.Logger(LemonSqueezyService_1.name);
    constructor(config) {
        this.config = config;
    }
    get apiKey() {
        const key = this.config.get('LEMON_SQUEEZY_API_KEY');
        if (!key) {
            throw new common_1.InternalServerErrorException('LEMON_SQUEEZY_API_KEY is not configured');
        }
        return key;
    }
    get storeId() {
        const id = this.config.get('LEMON_SQUEEZY_STORE_ID');
        if (!id) {
            throw new common_1.InternalServerErrorException('LEMON_SQUEEZY_STORE_ID is not configured');
        }
        return id;
    }
    get webhookSecret() {
        const secret = this.config.get('LEMON_SQUEEZY_WEBHOOK_SECRET');
        if (!secret) {
            throw new common_1.InternalServerErrorException('LEMON_SQUEEZY_WEBHOOK_SECRET is not configured');
        }
        return secret;
    }
    async request(path, init) {
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
            throw new common_1.InternalServerErrorException('Lemon Squeezy request failed. Please try again later.');
        }
        return res.json();
    }
    async createCheckout(opts) {
        const redirectUrl = this.config.get('FRONTEND_URL') ?? '';
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
        const result = await this.request('/checkouts', { method: 'POST', body: payload });
        return result.data.attributes.url;
    }
    async cancelSubscription(lemonSubscriptionId) {
        await this.request(`/subscriptions/${lemonSubscriptionId}`, {
            method: 'DELETE',
        });
    }
    verifyWebhookSignature(rawBody, signature) {
        if (!signature)
            return false;
        const digest = (0, crypto_1.createHmac)('sha256', this.webhookSecret)
            .update(rawBody)
            .digest('hex');
        const expected = Buffer.from(digest, 'hex');
        const received = Buffer.from(signature, 'hex');
        if (expected.length !== received.length)
            return false;
        return (0, crypto_1.timingSafeEqual)(expected, received);
    }
};
exports.LemonSqueezyService = LemonSqueezyService;
exports.LemonSqueezyService = LemonSqueezyService = LemonSqueezyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LemonSqueezyService);
//# sourceMappingURL=lemon-squeezy.service.js.map