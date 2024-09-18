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