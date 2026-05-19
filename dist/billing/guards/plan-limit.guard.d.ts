import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BillingService } from '../billing.service';
export type PlanFeature = 'createService';
export declare class PlanLimitGuard implements CanActivate {
    private readonly reflector;
    private readonly billingService;
    constructor(reflector: Reflector, billingService: BillingService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
