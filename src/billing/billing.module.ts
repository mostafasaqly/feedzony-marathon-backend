import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { LemonSqueezyService } from './lemon-squeezy.service';
import { PlanLimitGuard } from './guards/plan-limit.guard';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [BillingController],
  providers: [BillingService, LemonSqueezyService, PlanLimitGuard],
  exports: [BillingService, PlanLimitGuard],
})
export class BillingModule {}
