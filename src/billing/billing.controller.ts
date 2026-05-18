import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';

class ChangePlanDto {
  planName: 'Free' | 'Pro';
}

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  getPlans() {
    return this.billingService.getPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-plan')
  getMyPlan(@Req() req: any) {
    return this.billingService.getMyPlan(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-usage')
  getMyUsage(@Req() req: any) {
    return this.billingService.getMyUsage(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-plan')
  changePlan(@Req() req: any, @Body() body: ChangePlanDto) {
    return this.billingService.changePlan(req.user.id, body.planName);
  }
}
