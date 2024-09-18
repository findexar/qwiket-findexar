'use client';
import React, { useState, useRef } from "react";
import useSWR from 'swr';
import { useAppContext } from '@lib/context';
import { UserAccountKey } from "@lib/keys";
import { actionUser } from "@/lib/fetchers/account";
import PriceCard from './price-card';
import { getPricePlans, PlanDetails, FeatureCard } from "./price-plans";
import FeatureCardComponent from './feature-card';
import { FaCheckCircle, FaComments, FaLightbulb, FaShieldAlt } from 'react-icons/fa';

interface Props {
    chatUUId?: string;
    isFantasyTeam?: boolean;
}

const AccountUpgrade: React.FC<Props> = ({
    chatUUId: chatUUIdProp,
    isFantasyTeam
}) => {
    const { user, fallback, userAccount, userAccountMutate } = useAppContext();
    const [displayFeatures, setDisplayFeatures] = useState<string | null>(null);
    const featureSectionRef = useRef<HTMLDivElement>(null);

    // const userAccountKey: UserAccountKey = { type: "user-account", email: user.email || "" };
    // const { data, error, isLoading } = useSWR(userAccountKey, actionUser, { fallback });
    //  const { subscriptionType } = userAccount;
    let level = userAccount?.subscriptionType || "trial";
    const isLoading = false;
    console.log("userAccount", userAccount);

    const plans: PlanDetails[] = getPricePlans(level);

    const handleSeeAllFeatures = (planLevel: string) => {
        setDisplayFeatures(planLevel);
        setTimeout(() => {
            if (featureSectionRef.current) {
                const yOffset = -100; // Adjust this value to fine-tune the scroll position
                const y = featureSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 100); // Small delay to ensure state has updated
    };

    const sharedFeatures = [
        { icon: FaComments, text: "The first general availability AI chat assistant for sports. Gives you a competitive edge in fantasy sports decision making." },
        { icon: FaLightbulb, text: "Specialized knowledge, insights, and recommendations for major leagues and fantasy sports." },
        { icon: FaShieldAlt, text: "Secure and private conversations. Never shared, never retained outside of user's data, deleted on demand or after a set period." },
        { icon: FaCheckCircle, text: "Trained on up-to-the-minute flow of sports news, athlete and team mentions available at Qwiket.com. Augmented with hard data from reliable real-time statistics sources." },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col justify-center items-center mb-8">
                    <h1 className="text-3xl font-bold">Qwiket AI Chat Subscriptions</h1>
                    {isLoading && <span className="mt-2">Loading...</span>}
                </div>
                {!isLoading && (
                    <div className="flex flex-col md:flex-row gap-6 justify-center mt-12">
                        {plans.map((plan) => (
                            <PriceCard
                                key={plan.planLevel}
                                {...plan}
                                mutate={userAccountMutate}
                                isCurrentPlan={plan.planLevel === level}
                                onSeeAllFeatures={() => handleSeeAllFeatures(plan.planLevel)}
                            />
                        ))}
                    </div>
                )}

                {/* Shared Features Section */}
                <div className="my-16">
                    <h2 className="text-2xl font-semibold text-center mb-8">All Plans Include</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {sharedFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-4">
                                <feature.icon className="text-emerald-500 text-2xl flex-shrink-0" />
                                <span className="text-lg">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Use Cases Section */}
                <div className="my-16 max-w-4xl mx-auto">
                    <h2 className="text-xl font-semibold text-center mb-6 text-gray-600 dark:text-gray-400">
                        How Qwiket AI Chat Improves Your Game
                    </h2>
                    <div className="space-y-4 text-base text-gray-600 dark:text-gray-400">
                        <p>
                            Imagine having a knowledgeable assistant always at your fingertips, ready to provide insights on your favorite sports teams, players, and fantasy leagues. With Qwiket AI Chat, you can quickly analyze player statistics, get injury updates, and receive personalized advice for your fantasy lineup decisions.
                        </p>
                        <p>
                            Whether you're a casual fan looking to stay informed or a dedicated fantasy sports player aiming for the top of your league, Qwiket AI Chat adapts to your needs. Ask about recent game highlights, discuss team strategies, or get help understanding complex sports rules - our AI is here to enhance your sports experience and keep you ahead of the competition.
                        </p>
                    </div>
                </div>

                {/* Feature cards container */}
                <div ref={featureSectionRef} className="flex flex-col md:flex-row gap-6 justify-center mt-12">
                    {plans.find(plan => plan.planLevel === (displayFeatures || level))?.featureCards.map((card, index) => (
                        <FeatureCardComponent key={index} {...card} />
                    ))}
                </div>
                {/* New section for additional text */}
                <div className="my-16 max-w-3xl mx-auto text-center">
                    <p className="text-lg italic text-gray-600 dark:text-gray-400">
                        "The more you know about your sport, the more you can control the game. Intelligence and knowledge are the keys to success in sports, just as they are in life."
                    </p>
                    <p className="text-sm mt-2 text-gray-500 dark:text-gray-500">
                        - Billie Jean King
                    </p>
                </div>
            </div>
            {/* Footer */}
            <footer className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-semibold mb-4">About Us</h3>
                            <p className="text-sm mb-4">
                                Findexar, Inc. provides cutting-edge AI solutions for sports enthusiasts and fantasy league players.
                            </p>
                            <h3 className="text-lg font-semibold mt-6 mb-2">Contact</h3>
                            <p className="text-sm">
                                <a href="mailto:support@qwiket.com" className="hover:text-gray-900 dark:hover:text-gray-200">support@qwiket.com</a>
                            </p>
                        </div>
                        <div className="lg:col-span-3">
                            <h3 className="text-lg font-semibold mb-4">Important Disclaimer</h3>
                            <p className="text-sm mb-4">
                                The information provided by Qwiket AI Chat is for general informational purposes only. While we strive for accuracy, please be aware that AI systems can make mistakes or provide incomplete information.
                            </p>
                            <p className="text-sm mb-4">
                                <strong>Attention:</strong> Always double-check critical information, especially for fantasy sports or betting decisions or when relying on data for important choices. Qwiket AI Chat is a tool to assist and enhance your experience, not to replace human judgment or official sources.
                            </p>
                            <p className="text-sm">
                                We make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability or completeness of any information provided by the AI.
                            </p>
                        </div>

                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-300 dark:border-gray-700 text-sm text-center">
                        © {new Date().getFullYear()} Findexar, Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AccountUpgrade;