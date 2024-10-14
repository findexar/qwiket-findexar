export type UserAccount = {
    email: string;
    billingDay?: number;
    type?: string;
    creditsTotal?: number;
    creditsRemaining?: number;
    extraCreditsTotal?: number;
    extraCreditsRemaining?: number;
    subscriptionType?: string;
    subscriptionActive?: boolean;
}
export type UsageDetail = {
    usageDate: string;
    usedCredits: number;
    usedExtraCredits: number;
}

export type MonthlyUsage = {
    year: string;
    month: string;
    usage: UsageDetail[];
}

export type UserUsage = MonthlyUsage[];
export type Payment = {
    billingYear: number;
    billingMonth: number;
    value: number;
};

export type CidUsage = {
    usage: { year: string; month: string; usage: { date: string; visitors: number; subscribers: number }[] }[];
    totals: { date: string; visitors: number; subscribers: number }[];
    currentTotalVisitors: number;
    currentTotalSubscribers: number;
    payments: Payment[];
    totalPayments: number;
};