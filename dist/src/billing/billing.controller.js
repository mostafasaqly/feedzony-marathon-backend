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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const billing_service_1 = require("./billing.service");
const lemon_squeezy_service_1 = require("./lemon-squeezy.service");
class CheckoutDto {
    planName;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['Pro']),
    __metadata("design:type", String)
], CheckoutDto.prototype, "planName", void 0);
let BillingController = class BillingController {
    billingService;
    lemon;
    constructor(billingService, lemon) {
        this.billingService = billingService;
        this.lemon = lemon;
    }
    getPlans() {
        return this.billingService.getPlans();
    }
    getMyPlan(req) {
        return this.billingService.getMyPlan(req.user.id);
    }
    getMyUsage(req) {
        return this.billingService.getMyUsage(req.user.id);
    }
    createCheckout(req, body) {
        return this.billingService.createCheckout(req.user.id, body.planName);
    }
    cancelSubscription(req) {
        return this.billingService.cancelSubscription(req.user.id);
    }
    async handleWebhook(req, signature) {
        const rawBody = req.rawBody;
        if (!rawBody) {
            throw new common_1.BadRequestException('Missing raw request body');
        }
        if (!this.lemon.verifyWebhookSignature(rawBody, signature)) {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        const payload = JSON.parse(rawBody.toString('utf8'));
        return this.billingService.handleWebhook(payload);
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Get)('plans'),
    (0, swagger_1.ApiOperation)({ summary: 'List all available plans' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "getPlans", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('my-plan'),
    (0, swagger_1.ApiOperation)({ summary: "Get the current user's subscription" }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "getMyPlan", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('my-usage'),
    (0, swagger_1.ApiOperation)({ summary: "Get the current user's plan usage" }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "getMyUsage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('checkout'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a Lemon Squeezy checkout for a paid plan' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CheckoutDto]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "createCheckout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel the current paid subscription' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Lemon Squeezy webhook receiver' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "handleWebhook", null);
exports.BillingController = BillingController = __decorate([
    (0, swagger_1.ApiTags)('billing'),
    (0, common_1.Controller)('billing'),
    __metadata("design:paramtypes", [billing_service_1.BillingService,
        lemon_squeezy_service_1.LemonSqueezyService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map