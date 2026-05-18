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
exports.FeedbackController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const feedback_service_1 = require("./feedback.service");
const create_feedback_dto_1 = require("./dto/create-feedback.dto");
let FeedbackController = class FeedbackController {
    feedbackService;
    constructor(feedbackService) {
        this.feedbackService = feedbackService;
    }
    submitFeedback(slug, dto) {
        return this.feedbackService.submitFeedback(slug, dto);
    }
    getAllForUser(req) {
        return this.feedbackService.getAllFeedbackForUser(req.user.id);
    }
    getByService(req, serviceId) {
        return this.feedbackService.getFeedbackByService(serviceId, req.user.id);
    }
    getStats(req, serviceId) {
        return this.feedbackService.getStats(serviceId, req.user.id);
    }
};
exports.FeedbackController = FeedbackController;
__decorate([
    (0, common_1.Post)('public/services/:slug/feedback'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit feedback for a service (public, no auth)' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Feedback created' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Validation failed (rating out of range, missing rating)' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Service not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_feedback_dto_1.CreateFeedbackDto]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "submitFeedback", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('feedback'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: "Get all feedback across the authenticated user's services" }),
    (0, swagger_1.ApiOkResponse)({ description: 'Returns feedback ordered by newest first' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid Bearer token' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "getAllForUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('feedback/service/:serviceId'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Get feedback for a specific service' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Returns feedback for the service' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid Bearer token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Service belongs to another user' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Service not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "getByService", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('feedback/service/:serviceId/stats'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Get feedback stats for a specific service' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Returns { totalCount, averageRating, thisMonth }' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Missing or invalid Bearer token' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Service belongs to another user' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Service not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "getStats", null);
exports.FeedbackController = FeedbackController = __decorate([
    (0, swagger_1.ApiTags)('Feedback'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [feedback_service_1.FeedbackService])
], FeedbackController);
//# sourceMappingURL=feedback.controller.js.map