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
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BillingService = class BillingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getPlans() {
        return this.prisma.plan.findMany({ orderBy: { price: 'asc' } });
    }
    async getMyPlan(userId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });
        if (!subscription)
            throw new common_1.NotFoundException('No active subscription found');
        return subscription;
    }
    async getMyUsage(userId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });
        if (!subscription)
            throw new common_1.NotFoundException('No active subscription found');
        const services = await this.prisma.service.findMany({ where: { userId } });
        const serviceIds = services.map((s) => s.id);
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const feedbackThisMonth = await this.prisma.feedback.count({
            where: {
                serviceId: { in: serviceIds },
                createdAt: { gte: monthStart },
            },
        });
        const { plan } = subscription;
        return {
            plan: {
                name: plan.name,
                price: plan.price,
                maxServices: plan.maxServices,
                maxFeedback: plan.maxFeedback,
                hasAnalytics: plan.hasAnalytics,
                hasNotifications: plan.hasNotifications,
            },
            subscription: {
                status: subscription.status,
                createdAt: subscription.createdAt.toISOString(),
            },
            usage: {
                servicesUsed: services.length,
                servicesLimit: plan.maxServices,
                feedbackThisMonth,
                feedbackLimit: plan.maxFeedback,
            },
        };
    }
    async changePlan(userId, planName) {
        const plan = await this.prisma.plan.findUnique({ where: { name: planName } });
        if (!plan)
            throw new common_1.NotFoundException(`Plan "${planName}" not found`);
        return this.prisma.subscription.update({
            where: { userId },
            data: { planId: plan.id },
            include: { plan: true },
        });
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillingService);
//# sourceMappingURL=billing.service.js.map