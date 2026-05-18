import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@ApiTags('Feedback')
@Controller()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('public/services/:slug/feedback')
  @ApiOperation({ summary: 'Submit feedback for a service (public, no auth)' })
  @ApiCreatedResponse({ description: 'Feedback created' })
  @ApiBadRequestResponse({ description: 'Validation failed (rating out of range, missing rating)' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  submitFeedback(@Param('slug') slug: string, @Body() dto: CreateFeedbackDto) {
    return this.feedbackService.submitFeedback(slug, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('feedback')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: "Get all feedback across the authenticated user's services" })
  @ApiOkResponse({ description: 'Returns feedback ordered by newest first' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token' })
  getAllForUser(@Request() req: any) {
    return this.feedbackService.getAllFeedbackForUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('feedback/service/:serviceId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get feedback for a specific service' })
  @ApiOkResponse({ description: 'Returns feedback for the service' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token' })
  @ApiForbiddenResponse({ description: 'Service belongs to another user' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  getByService(@Request() req: any, @Param('serviceId') serviceId: string) {
    return this.feedbackService.getFeedbackByService(serviceId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('feedback/service/:serviceId/stats')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get feedback stats for a specific service' })
  @ApiOkResponse({ description: 'Returns { totalCount, averageRating, thisMonth }' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token' })
  @ApiForbiddenResponse({ description: 'Service belongs to another user' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  getStats(@Request() req: any, @Param('serviceId') serviceId: string) {
    return this.feedbackService.getStats(serviceId, req.user.id);
  }
}
