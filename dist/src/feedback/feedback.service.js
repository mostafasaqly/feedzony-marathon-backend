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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const services_service_1 = require("../services/services.service");
const feedbackSelect = {
    id: true,
    rating: true,
    comment: true,
    createdAt: true,
    service: {
        select: { id: true, name: true, slug: true },
    },
};
let FeedbackService = class FeedbackService {
    prisma;
    servicesService;
    constructor(prisma, servicesService) {
        this.prisma = prisma;
        this.servicesService = servicesService;
    }
    async submitFeedback(slug, dto) {
        const service = await this.prisma.service.findUnique({ where: { slug } });
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        return this.prisma.feedback.create({
            data: {
                rating: dto.rating,
                comment: dto.comment ?? null,
                serviceId: service.id,
            },
            select: feedbackSelect,
        });
    }
    async getFeedbackByService(serviceId, userId) {
        await this.servicesService.findOne(serviceId, userId);
        return this.prisma.feedback.findMany({
            where: { serviceId },
            orderBy: { createdAt: 'desc' },
            select: feedbackSelect,
        });
    }
    async getAllFeedbackForUser(userId) {
        return this.prisma.feedback.findMany({
            where: { service: { userId } },
            orderBy: { createdAt: 'desc' },
            select: feedbackSelect,
        });
    }
    async getStats(serviceId, userId) {
        await this.servicesService.findOne(serviceId, userId);
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalCount, aggregate, thisMonth] = await Promise.all([
            this.prisma.feedback.count({ where: { serviceId } }),
            this.prisma.feedback.aggregate({
                where: { serviceId },
                _avg: { rating: true },
            }),
            this.prisma.feedback.count({
                where: { serviceId, createdAt: { gte: monthStart } },
            }),
        ]);
        const avg = aggregate._avg.rating ?? 0;
        return {
            totalCount,
            averageRating: Math.round(avg * 10) / 10,
            thisMonth,
        };
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        services_service_1.ServicesService])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map