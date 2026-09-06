export const PLAN_LIMITS: Record<string,number> = { FREE:100, STARTER:10000, PRO:100000, BUSINESS:1000000 };
export const planWindow = (plan:string) => plan === 'FREE' ? 'day' : 'month';
