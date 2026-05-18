import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BillingService } from '../billing.service';

export type PlanFeature = 'createService';

@Injectable()
export class PlanLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly billingService: BillingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get<PlanFeature>('planFeature', context.getHandler());
    if (!feature) return true;

    const request = context.switchToHttp().getRequest();
    const userId: string = request.user?.id;
    if (!userId) return false;

    if (feature === 'createService') {
      const usage = await this.billingService.getMyUsage(userId);
      const { maxServices } = usage.plan;
      if (maxServices === -1) return true;
      if (usage.usage.servicesUsed >= maxServices) {
        throw new ForbiddenException(
          'Service limit reached. Upgrade to Pro for unlimited services.',
        );
      }
    }

    return true;
  }
}
