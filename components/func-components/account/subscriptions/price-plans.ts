import { IconType } from 'react-icons';
import { FaBolt, FaChartLine, FaCreditCard, FaLock, FaRocket, FaUsers, FaCog, FaDatabase } from 'react-icons/fa';

export interface FeatureCard {
    title: string;
    description: string;
    Icon: IconType;
}

export interface PlanDetails {
    planLevel: string;
    title: string;
    description: string;
    price: number;
    features: string[];
    buttonText: string;
    isDisabled?: boolean;
    featureCards: FeatureCard[];
}

export function getPricePlans(currentPlan: string): PlanDetails[] {
    const isCurrentPlan = (planLevel: string) => currentPlan === planLevel;

    return [
        {
            planLevel: "trial",
            title: "Trial",
            description: "25 free credits to try Qwiket Chat AI.",
            price: 0,
            features: [
                "25 free Qwiket AI Chat credits. Not refillable.",
                "Fully-featured Qwiket AI Chat."
            ],
            isDisabled: true,
            buttonText: isCurrentPlan("trial") ? "Current Plan" : "Select",
            featureCards: [
                {
                    title: "Basic AI Chat",
                    description: "Experience the core functionality of Qwiket AI Chat with limited credits.",
                    Icon: FaBolt
                },
                {
                    title: "Limited Access",
                    description: "Try out the features with a restricted number of queries and interactions.",
                    Icon: FaLock
                },
                {
                    title: "No Commitment",
                    description: "Explore Qwiket AI Chat without any financial commitment or long-term obligation.",
                    Icon: FaRocket
                }
            ]
        },
        {
            planLevel: "basic",
            title: "Basic",
            description: "Ideal for most fans and Fantasy Sports users.",
            price: 20,
            features: [
                "Includes 1000 Qwiket AI Chat credits per month.",
                "Additional credits available in blocks of 1000 credits per $20"
            ],
            isDisabled: isCurrentPlan("basic"),
            buttonText: isCurrentPlan("basic") ? "Current Plan" : "Subscribe",
            featureCards: [
                {
                    title: "Enhanced AI Chat",
                    description: "Enjoy extended conversations and more in-depth analysis with increased credits.",
                    Icon: FaBolt
                },
                {
                    title: "Fantasy Sports Insights",
                    description: "Get AI-powered insights and recommendations for your fantasy sports teams.",
                    Icon: FaChartLine
                },
                {
                    title: "Flexible Credit System",
                    description: "Purchase additional credits as needed to suit your usage patterns.",
                    Icon: FaCreditCard
                }
            ]
        },
        {
            planLevel: "creator",
            title: "Creator",
            description: "Allow customization and upload of documents.",
            price: 40,
            features: [
                "Includes 2000 Qwiket AI Chat credits per month.",
                "Additional credits available in blocks of 1000 credits per $20",
                "Customization options and document upload features"
            ],
            buttonText: isCurrentPlan("creator") ? "Current Plan" : "Subscribe",
            isDisabled: isCurrentPlan("creator"),
            featureCards: [
                {
                    title: "Advanced Customization",
                    description: "Tailor the AI chat experience to your specific needs and preferences.",
                    Icon: FaCog
                },
                {
                    title: "Document Upload",
                    description: "Upload and analyze documents to enhance your AI chat interactions.",
                    Icon: FaDatabase
                },
                {
                    title: "Expanded Credit Limit",
                    description: "Enjoy a higher monthly credit allocation for more extensive usage.",
                    Icon: FaCreditCard
                }
            ]
        },
        {
            planLevel: "enterprise",
            title: "Enterprise",
            description: "Multiple users and advanced integration features.",
            price: 80,
            features: [
                "Supports white label embedding of AI Chat.",
                "Supports custom data sources by the customer.",
                "Multiple user accounts and advanced team collaboration features"
            ],
            buttonText: isCurrentPlan("enterprise") ? "Current Plan" : "Coming Soon",
            isDisabled: true,
            featureCards: [
                {
                    title: "White Label Integration",
                    description: "Seamlessly embed Qwiket AI Chat into your own platforms and services.",
                    Icon: FaUsers
                },
                {
                    title: "Custom Data Sources",
                    description: "Integrate your own data sources to power the AI chat with your specific information.",
                    Icon: FaDatabase
                },
                {
                    title: "Team Collaboration",
                    description: "Enable multiple users to work together efficiently using advanced collaboration tools.",
                    Icon: FaUsers
                }
            ]
        }
    ];
}