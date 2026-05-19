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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverview(userId, period) {
        const services = await this.prisma.service.findMany({
            where: { userId },
        });
        const serviceIds = services.map((s) => s.id);
        const feedbacks = await this.prisma.feedback.findMany({
            where: { serviceId: { in: serviceIds } },
            orderBy: { createdAt: 'desc' },
        });
        const topServices = services
            .map((service) => {
            const serviceFeedbacks = feedbacks.filter((f) => f.serviceId === service.id);
            const sorted = [...serviceFeedbacks].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            return {
                serviceId: service.id,
                serviceName: service.name,
                slug: service.slug,
                totalFeedback: serviceFeedbacks.length,
                averageRating: this.calcAverage(serviceFeedbacks),
                lastFeedbackAt: sorted[0]?.createdAt.toISOString() ?? null,
            };
        })
            .sort((a, b) => b.totalFeedback - a.totalFeedback);
        return {
            totalFeedback: feedbacks.length,
            averageRating: this.calcAverage(feedbacks),
            totalServices: services.length,
            thisMonth: this.calcThisMonth(feedbacks),
            ratingDistribution: this.calcDistribution(feedbacks),
            feedbackOverTime: this.calcOverTime(feedbacks, period),
            topServices,
        };
    }
    async getServiceAnalytics(serviceId, userId, period) {
        const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        if (service.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        const feedbacks = await this.prisma.feedback.findMany({
            where: { serviceId },
            orderBy: { createdAt: 'desc' },
        });
        const recentFeedback = feedbacks.slice(0, 5).map((f) => ({
            id: f.id,
            rating: f.rating,
            comment: f.comment,
            createdAt: f.createdAt.toISOString(),
        }));
        return {
            serviceId: service.id,
            serviceName: service.name,
            totalFeedback: feedbacks.length,
            averageRating: this.calcAverage(feedbacks),
            thisMonth: this.calcThisMonth(feedbacks),
            ratingDistribution: this.calcDistribution(feedbacks),
            feedbackOverTime: this.calcOverTime(feedbacks, period),
            recentFeedback,
        };
    }
    calcAverage(feedbacks) {
        if (feedbacks.length === 0)
            return 0;
        const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
        return Math.round((sum / feedbacks.length) * 10) / 10;
    }
    calcDistribution(feedbacks) {
        const dist = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
        for (const f of feedbacks) {
            const key = String(f.rating);
            if (key in dist)
                dist[key]++;
        }
        return dist;
    }
    calcOverTime(feedbacks, period) {
        const now = new Date();
        if (period === 'all') {
            const months = [];
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                months.push({
                    date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                    count: 0,
                });
            }
            for (const f of feedbacks) {
                const key = `${f.createdAt.getFullYear()}-${String(f.createdAt.getMonth() + 1).padStart(2, '0')}`;
                const entry = months.find((m) => m.date === key);
                if (entry)
                    entry.count++;
            }
            return months;
        }
        const days = period === 'week' ? 7 : 30;
        const result = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            result.push({
                date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
                count: 0,
            });
        }
        for (const f of feedbacks) {
            const key = `${f.createdAt.getFullYear()}-${String(f.createdAt.getMonth() + 1).padStart(2, '0')}-${String(f.createdAt.getDate()).padStart(2, '0')}`;
            const entry = result.find((r) => r.date === key);
            if (entry)
                entry.count++;
        }
        return result;
    }
    calcThisMonth(feedbacks) {
        const now = new Date();
        return feedbacks.filter((f) => f.createdAt.getFullYear() === now.getFullYear() &&
            f.createdAt.getMonth() === now.getMonth()).length;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map