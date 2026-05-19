import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import { LemonSqueezyService } from './lemon-squeezy.service';
import { LemonWebhookPayload } from './lemon-squeezy.types';

class CheckoutDto {
  @IsString()
  @IsIn(['Pro'])
  planName: string;
}

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly lemon: LemonSqueezyService,
  ) {}

  @Get('plans')
  @ApiOperation({ summary: 'List all available plans' })
  getPlans() {
    return this.billingService.getPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-plan')
  @ApiOperation({ summary: "Get the current user's subscription" })
  getMyPlan(@Req() req: any) {
    return this.billingService.getMyPlan(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-usage')
  @ApiOperation({ summary: "Get the current user's plan usage" })
  getMyUsage(@Req() req: any) {
    return this.billingService.getMyUsage(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  @ApiOperation({ summary: 'Create a Lemon Squeezy checkout for a paid plan' })
  createCheckout(@Req() req: any, @Body() body: CheckoutDto) {
    return this.billingService.createCheckout(req.user.id, body.planName);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel')
  @ApiOperation({ summary: 'Cancel the current paid subscription' })
  cancelSubscription(@Req() req: any) {
    return this.billingService.cancelSubscription(req.user.id);
  }

  /**
   * Lemon Squeezy webhook endpoint. Public (no JWT) — authenticity is
   * established by verifying the `X-Signature` HMAC against the raw body.
   */
  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Lemon Squeezy webhook receiver' })
  async handleWebhook(
    @Req() req: Request,
    @Headers('x-signature') signature: string,
  ) {
    const rawBody = (req as any).rawBody as Buffer | undefined;
    if (!rawBody) {
      throw new BadRequestException('Missing raw request body');
    }

    if (!this.lemon.verifyWebhookSignature(rawBody, signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const payload = JSON.parse(rawBody.toString('utf8')) as LemonWebhookPayload;
    return this.billingService.handleWebhook(payload);
  }
}
