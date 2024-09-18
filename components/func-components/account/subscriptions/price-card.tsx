import React from 'react';
import { PlanDetails } from './price-plans';
import { useStripe } from '@stripe/react-stripe-js';
import { useAppContext } from '@lib/context';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { createCheckoutSession, cancelSubscription } from '@/lib/actions/stripe';
import { useState } from 'react';

interface PriceCardProps extends PlanDetails {
    isCurrentPlan: boolean;
    onSeeAllFeatures: () => void;
    mutate: () => void;
}

const PriceCard: React.FC<PriceCardProps> = ({
    planLevel,
    title,
    description,
    price,
    isCurrentPlan,
    features,
    buttonText,
    mutate,
    isDisabled = false,
    onSeeAllFeatures
}) => {
    const stripe = useStripe();
    const router = useRouter();
    const { isSignedIn } = useAuth();
    const { user: clerkUser } = useUser();
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleSubscribe = async () => {
        if (!stripe || isSubscribing) return;
        setIsSubscribing(true);
        if (!isSignedIn || !clerkUser) {
            // Redirect to login page if user is not logged in
            router.push('/sign-in?redirect=/account/upgrade');
            return;
        }
        try {
            const sessionId = await createCheckoutSession(planLevel, 'embedded');

            const result = await stripe.redirectToCheckout({
                sessionId,
            });

            if (result.error) {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('Error:', error);
            // Here you might want to show an error message to the user
        } finally {
            setIsSubscribing(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (isCancelling) return;
        setIsCancelling(true);
        if (!isSignedIn || !clerkUser) {
            router.push('/sign-in?redirect=/account/upgrade');
            return;
        }
        try {
            const result = await cancelSubscription();
            if (result.success) {
                // Subscription cancelled successfully
                // You might want to update the UI or redirect the user
                mutate();
                //router.push('/account/upgrade');
            } else {
                throw new Error(result.error || 'Failed to cancel subscription');
            }
        } catch (error) {
            console.error('Error:', error);
            // Here you might want to show an error message to the user
        } finally {
            setIsCancelling(false);
        }
    };

    const cardClass = `
        w-full max-w-sm mx-auto overflow-hidden rounded 
        ${isCurrentPlan
            ? 'bg-emerald-100 dark:bg-emerald-900 border-2 border-emerald-500'
            : 'bg-white dark:bg-gray-800'} 
        text-gray-500 dark:text-gray-400 shadow-lg shadow-gray-200 dark:shadow-gray-700
    `;

    const titleClass = `
        text-xl font-bold
        ${isCurrentPlan ? 'text-yellow-400' : 'text-gray-700 dark:text-gray-300'}
    `;

    const buttonClass = `
        inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded 
        ${isCurrentPlan
            ? 'bg-emerald-700 hover:bg-emerald-800'
            : 'bg-emerald-500 hover:bg-emerald-600'}
        px-6 text-sm font-medium tracking-wide text-white shadow-lg shadow-emerald-100 
        dark:shadow-emerald-900 transition duration-300 focus:bg-emerald-700 
        focus:shadow-md focus:shadow-emerald-100 dark:focus:shadow-emerald-900 focus-visible:outline-none
        ${(isDisabled || isSubscribing) ? 'opacity-50 cursor-not-allowed' : ''}
    `;

    return (
        <div className={cardClass}>
            <div className="flex flex-col">
                <header className="flex flex-col gap-6 p-6">
                    <h3 className={titleClass}>
                        {title}
                        <span className="block text-sm font-normal text-gray-400 dark:text-gray-500">
                            {description}
                        </span>
                    </h3>
                    <h4>
                        <span className="text-3xl">$</span>
                        <span className="text-5xl font-bold tracking-tighter text-gray-700 dark:text-gray-300 transition-all duration-300 lg:text-6xl">
                            {price}
                        </span>
                        <span className="text-sm">/month</span>
                    </h4>
                    <button onClick={handleSubscribe}
                        disabled={isDisabled || isSubscribing}
                        className={buttonClass}>
                        <span>{isSubscribing ? 'Processing...' : buttonText}</span>
                    </button>
                </header>
                <div className="p-6">
                    <ul className="space-y-4">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="h-6 w-6 shrink-0 p-1 text-emerald-500"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
                <footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-6 text-center text-sm">
                    <a
                        className="text-emerald-500 transition-colors duration-300 hover:text-emerald-600 focus:text-emerald-700"
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            onSeeAllFeatures();
                        }}
                    >
                        See all features
                    </a>
                    {isCurrentPlan && (
                        <div className="mt-2">
                            <a
                                href="#"
                                className={`text-gray-500 text-xs hover:text-red-400 focus:text-red-500 transition-colors duration-300 ${isCancelling ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (!isCancelling) {
                                        handleCancelSubscription();
                                    }
                                }}
                            >
                                {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                            </a>
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default PriceCard;