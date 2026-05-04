import Stripe from 'stripe'
import { env } from '@/lib/env'

// Stripe client initialization
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

// Price ID constants (live values from environment variables)
export const PRICE_MONTHLY = env.STRIPE_PRICE_MONTHLY
export const PRICE_ANNUAL = env.STRIPE_PRICE_ANNUAL
export const PRICE_PREMIUM_MONTHLY_ADDON = env.STRIPE_PRICE_PREMIUM_MONTHLY_ADDON
export const PRICE_PREMIUM_ANNUAL_ADDON = env.STRIPE_PRICE_PREMIUM_ANNUAL_ADDON

// Plan prices map: plan_type → base price ID and premium add-on price ID
export const PLAN_PRICES: Record<
  'monthly' | 'annual',
  { base: string; premiumAddon: string }
> = {
  monthly: {
    base: PRICE_MONTHLY,
    premiumAddon: PRICE_PREMIUM_MONTHLY_ADDON,
  },
  annual: {
    base: PRICE_ANNUAL,
    premiumAddon: PRICE_PREMIUM_ANNUAL_ADDON,
  },
}

// Utility: get relevant price IDs for a given plan type and premium toggle
export function getPriceIds(
  planType: 'monthly' | 'annual',
  hasPremium: boolean
): { base: string; premiumAddon?: string } {
  const plan = PLAN_PRICES[planType]
  return {
    base: plan.base,
    ...(hasPremium ? { premiumAddon: plan.premiumAddon } : {}),
  }
}
