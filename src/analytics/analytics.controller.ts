import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

type Period = 'week' | 'month' | 'all';

function parsePeriod(raw: string | undefined): Period {
  if (raw === 'week' || raw === 'month' || raw === 'all') return raw;
  return 'month';
}

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  getOverview(@Req() req: any, @Query('period') period?: string) {
    return this.analyticsService.getOverview(req.user.id, parsePeriod(period));
  }

  @Get('services/:serviceId')
  getServiceAnalytics(
    @Req() req: any,
    @Param('serviceId') serviceId: string,
    @Query('period') period?: string,
  ) {
    return this.analyticsService.getServiceAnalytics(
      serviceId,
      req.user.id,
      parsePeriod(period),
    );
  }
}
