import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PlanLimitGuard } from './guards/plan-limit.guard';

@Module({
  imports: [PrismaModule],
  controllers: [BillingController],
  providers: [BillingService, PlanLimitGuard],
  exports: [BillingService, PlanLimitGuard],
})
export class BillingModule {}
