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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanLimitGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const billing_service_1 = require("../billing.service");
let PlanLimitGuard = class PlanLimitGuard {
    reflector;
    billingService;
    constructor(reflector, billingService) {
        this.reflector = reflector;
        this.billingService = billingService;
    }
    async canActivate(context) {
        const feature = this.reflector.get('planFeature', context.getHandler());
        if (!feature)
            return true;
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        if (!userId)
            return false;
        if (feature === 'createService') {
            const usage = await this.billingService.getMyUsage(userId);
            const { maxServices } = usage.plan;
            if (maxServices === -1)
                return true;
            if (usage.usage.servicesUsed >= maxServices) {
                throw new common_1.ForbiddenException('Service limit reached. Upgrade to Pro for unlimited services.');
            }
        }
        return true;
    }
};
exports.PlanLimitGuard = PlanLimitGuard;
exports.PlanLimitGuard = PlanLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        billing_service_1.BillingService])
], PlanLimitGuard);
//# sourceMappingURL=plan-limit.guard.js.map