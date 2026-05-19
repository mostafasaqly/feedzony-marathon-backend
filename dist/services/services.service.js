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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ServicesService = class ServicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const existing = await this.prisma.service.findUnique({
            where: { slug: dto.slug },
        });
        if (existing)
            throw new common_1.ConflictException('Slug is already taken');
        return this.prisma.service.create({
            data: {
                name: dto.name,
                description: dto.description,
                slug: dto.slug,
                userId,
            },
        });
    }
    findAllByUser(userId) {
        return this.prisma.service.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, userId) {
        const service = await this.prisma.service.findUnique({ where: { id } });
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        if (service.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this service');
        }
        return service;
    }
    async update(id, userId, dto) {
        await this.findOne(id, userId);
        if (dto.slug) {
            const slugOwner = await this.prisma.service.findUnique({
                where: { slug: dto.slug },
            });
            if (slugOwner && slugOwner.id !== id) {
                throw new common_1.ConflictException('Slug is already taken');
            }
        }
        return this.prisma.service.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                slug: dto.slug,
            },
        });
    }
    async remove(id, userId) {
        await this.findOne(id, userId);
        await this.prisma.service.delete({ where: { id } });
        return { message: 'Service deleted successfully' };
    }
    async findBySlug(slug) {
        const service = await this.prisma.service.findUnique({
            where: { slug },
            select: { name: true, description: true, slug: true },
        });
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        return service;
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServicesService);
//# sourceMappingURL=services.service.js.map