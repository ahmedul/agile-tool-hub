export type SubscriptionPlan = "free" | "pro";

interface UsageRecord {
  month: string;
  count: number;
}

export interface AiUsageStatus {
  plan: SubscriptionPlan;
  used: number;
  quota: number;
  remaining: number;
}

const PLAN_KEY = "ath_plan";
const AI_USAGE_KEY = "ath_ai_usage";

export const FREE_AI_MONTHLY_QUOTA = 20;
export const PRO_AI_MONTHLY_QUOTA = 800;

function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getStoredUsage(): UsageRecord {
  if (typeof window === "undefined") {
    return { month: getCurrentMonthKey(), count: 0 };
  }

  const raw = window.localStorage.getItem(AI_USAGE_KEY);
  if (!raw) return { month: getCurrentMonthKey(), count: 0 };

  try {
    const parsed = JSON.parse(raw) as UsageRecord;
    if (!parsed.month || typeof parsed.count !== "number") {
      return { month: getCurrentMonthKey(), count: 0 };
    }
    return parsed;
  } catch {
    return { month: getCurrentMonthKey(), count: 0 };
  }
}

function setStoredUsage(record: UsageRecord): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AI_USAGE_KEY, JSON.stringify(record));
}

function normalizeUsageByMonth(record: UsageRecord): UsageRecord {
  const current = getCurrentMonthKey();
  if (record.month === current) return record;
  const reset = { month: current, count: 0 };
  setStoredUsage(reset);
  return reset;
}

export function getClientPlan(): SubscriptionPlan {
  if (typeof window === "undefined") return "free";
  const value = window.localStorage.getItem(PLAN_KEY);
  return value === "pro" ? "pro" : "free";
}

export function setClientPlan(plan: SubscriptionPlan): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PLAN_KEY, plan);
}

export function getPlanQuota(plan: SubscriptionPlan): number {
  return plan === "pro" ? PRO_AI_MONTHLY_QUOTA : FREE_AI_MONTHLY_QUOTA;
}

export function getAiUsageStatus(): AiUsageStatus {
  const plan = getClientPlan();
  const usage = normalizeUsageByMonth(getStoredUsage());
  const quota = getPlanQuota(plan);
  const remaining = Math.max(0, quota - usage.count);

  return {
    plan,
    used: usage.count,
    quota,
    remaining,
  };
}

export function incrementAiUsage(): AiUsageStatus {
  const usage = normalizeUsageByMonth(getStoredUsage());
  const next = { ...usage, count: usage.count + 1 };
  setStoredUsage(next);
  return getAiUsageStatus();
}
