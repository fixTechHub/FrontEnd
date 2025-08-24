// src/constants/subscription.js (FE)
export const PAID_PLANS = ['BASIC', 'STANDARD', 'PREMIUM'];
export const FREE_TRIAL_LIMIT = 3;

export const isPaidPlan = (tech) =>
  PAID_PLANS.includes(String(tech?.subscriptionStatus || '').toUpperCase());

export const underTrialLimit = (tech) =>
  Number(tech?.jobCompleted || 0) < FREE_TRIAL_LIMIT;
