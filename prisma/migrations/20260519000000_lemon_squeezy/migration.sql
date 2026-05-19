-- Drop unused Stripe columns
ALTER TABLE "Subscription" DROP COLUMN IF EXISTS "stripeCustomerId";
ALTER TABLE "Subscription" DROP COLUMN IF EXISTS "stripeSubscriptionId";

-- Plan: Lemon Squeezy variant id
ALTER TABLE "Plan" ADD COLUMN "lemonVariantId" TEXT;

-- Subscription: Lemon Squeezy identifiers
ALTER TABLE "Subscription" ADD COLUMN "lemonCustomerId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "lemonSubscriptionId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "lemonOrderId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "lemonVariantId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;

-- Unique index on Lemon Squeezy subscription id
CREATE UNIQUE INDEX "Subscription_lemonSubscriptionId_key" ON "Subscription"("lemonSubscriptionId");
