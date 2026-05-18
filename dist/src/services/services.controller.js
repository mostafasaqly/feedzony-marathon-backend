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
exports.ServicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const services_service_1 = require("./services.service");
const create_service_dto_1 = require("./dto/create-service.dto");
const update_service_dto_1 = require("./dto/update-service.dto");
let ServicesController = class ServicesController {
    servicesService;
    constructor(servicesService) {
        this.servicesService = servicesService;
    }
    create(req, dto) {
        return this.servicesService.create(req.user.id, dto);
    }
    findAll(req) {
        return this.servicesService.findAllByUser(req.user.id);
    }
    findOne(req, id) {
        return this.servicesService.findOne(id, req.user.id);
    }
    update(req, id, dto) {
        return this.servicesService.update(id, req.user.id, dto);
    }
    remove(req, id) {
        return this.servicesService.remove(id, req.user.id);
    }
    findBySlug(slug) {
        return this.servicesService.findBySlug(slug);
    }
};
exports.ServicesController = ServicesController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('services'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new service' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Service created' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid Bearer token' }),
    (0, swagger_1.ApiConflictResponse)({ description: 'Slug is already taken' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_service_dto_1.CreateServiceDto]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('services'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: "List the authenticated user's services" }),
    (0, swagger_1.ApiOkResponse)({ description: 'Returns services ordered by newest first' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid Bearer token' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('services/:id'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single service by id' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Returns the service' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid Bearer token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Service belongs to another user' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Service not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('services/:id'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a service' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Returns the updated service' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid Bearer token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Service belongs to another user' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Service not found' }),
    (0, swagger_1.ApiConflictResponse)({ description: 'Slug is already taken' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_service_dto_1.UpdateServiceDto]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('services/:id'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a service' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Service deleted' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid Bearer token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Service belongs to another user' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Service not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('public/services/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Publicly view a service by its slug' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Returns public service info (name, description, slug)' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Service not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "findBySlug", null);
exports.ServicesController = ServicesController = __decorate([
    (0, swagger_1.ApiTags)('Services'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [services_service_1.ServicesService])
], ServicesController);
//# sourceMappingURL=services.controller.js.map