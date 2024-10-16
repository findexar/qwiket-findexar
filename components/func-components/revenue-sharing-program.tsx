'use client';
import React, { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ApplicationForm from './application-form';

const RevenueSharing: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleApply = () => {
        setShowForm(true);
        setSubmitSuccess(false);
    };

    const handleCancel = () => {
        setShowForm(false);
    };

    const handleSuccess = () => {
        setShowForm(false);
        setSubmitSuccess(true);
    };

    const rspMarkdownText = `
# Monetize Your Sports Content with Qwiket's Revenue-Sharing Program

## Turn Your Audience into Substantial Income

Are you a sports or fantasy sports content creator looking to earn from your expertise? Qwiket's Revenue-Sharing Program (RSP) offers you a straightforward way to monetize your existing audience. Here's how you can start earning:

### How It Works: Simple Steps to Revenue

1. **Join the Program**: Once accepted, you'll receive a unique Affiliate ID (AID).
2. **Start with 200 Credits**: We'll kickstart your account with 200 credits for Qwiket AI use.
3. **Share Your Links**: Use your personalized links (with your AID) when sharing Qwiket content. The visitors from your links will be started with 100 free credits, which is 400% over the default user.
4. **Get Credits for Traffic**: For every 100 visitors through your links, we'll top up your Qwiket AI credits to 2000.
5. **Earn from Subscriptions**: When your readers become Qwiket subscribers, you earn 5% of their subscription fee. That's $1 per month for every $20 subscription.

### The Power of Recurring Revenue

Imagine converting 1000 of your readers into Qwiket subscribers. That's $1000 in your pocket every month, or $12,000 per year - without any additional effort! And remember, this is recurring revenue that keeps coming as long as those subscribers stay active.

### Getting Paid: Quick and Easy

Cashing out your subscription earnings is simple. Fill out our invoice form, and we'll transfer your earnings via Stripe. No complicated processes, just straightforward payments. Note that the minimum payout is $20.

## Are You Eligible?

To qualify for our RSP, you need:
- A blog or content platform with over 10,000 unique monthly visitors
- Original sports or fantasy sports content

## The Qwiket Advantage: Why Choose Our Program?

- **Substantial Recurring Revenue**: Potential to earn thousands monthly from your existing audience
- **Dual Benefits**: Earn money from subscriptions and get credits for Qwiket AI use
- **High Commission Rate**: 5% of subscription fees is higher than many affiliate programs
- **Low Maintenance**: No need to change your content strategy - just add links
- **Reliable Payments**: Get paid via Stripe, a trusted payment platform

## How to Get Started

1. Click the "Apply" button below
2. Complete the short application form
3. Once approved, start sharing links to earn and get credits!

Don't miss out on this lucrative opportunity. Join Qwiket's Revenue-Sharing Program today and start monetizing your sports content effectively!

## Terms and Conditions

<small><i>By participating in Qwiket's Revenue-Sharing Program, you agree to the following terms:

1. Eligibility: Maintain at least 10,000 unique monthly visitors to remain in the program.
2. Payments: Subscription earnings will be transferred via Stripe within 30 days of month-end, subject to a $50 minimum payout.
3. Credits: Traffic-based credits are for Qwiket AI use only and have no cash value.
4. Program Changes: We reserve the right to modify the program with 30 days' notice.
5. Tracking: Ensure you're using the correct tracking links (&aid=cid) for proper attribution.
6. Taxes: You're responsible for reporting your earnings to relevant tax authorities.
7. Non-exclusivity: This program doesn't create an exclusive relationship between you and Qwiket.
8. Termination: Either party can end the partnership with 30 days' written notice.
9. Liability: Qwiket is not responsible for any losses or damages resulting from your participation.

By clicking 'Apply', you confirm that you've read and agree to these terms.</i></small>
    `;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="w-full max-w-4xl mx-auto">
                    {!showForm ? (
                        <>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-8" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mb-4" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mb-2" {...props} />,
                                    p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4" {...props} />,
                                    li: ({ node, ...props }) => <li className="mb-2" {...props} />,
                                    small: ({ node, ...props }) => <small className="text-sm block mt-4 text-gray-600 dark:text-gray-400" {...props} />,
                                    i: ({ node, ...props }) => <i className="italic" {...props} />,
                                    strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                                }}
                            >
                                {rspMarkdownText}
                            </ReactMarkdown>
                            {submitSuccess && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                                    <strong className="font-bold">Success!</strong>
                                    <span className="block sm:inline"> Your application has been submitted successfully.</span>
                                </div>
                            )}
                            <div className="flex justify-center mt-8 mb-6">
                                <button
                                    onClick={handleApply}
                                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded"
                                >
                                    Apply Now and Start Earning!
                                </button>
                            </div>
                        </>
                    ) : (
                        <ApplicationForm onCancel={handleCancel} onSuccess={handleSuccess} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default RevenueSharing;
