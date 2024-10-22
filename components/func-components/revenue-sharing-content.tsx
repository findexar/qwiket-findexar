'use client';
import React, { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useAppContext } from '@lib/context';
import Link from 'next/link';
import ApplicationForm from './application-form';

interface RevenueSharedContentProps {
    isCreator: boolean;
    onApply?: () => void;
    onCancel?: () => void;
    onSuccess?: () => void;
}

const RevenueSharedContent: React.FC<RevenueSharedContentProps> = ({ isCreator, onApply, onCancel, onSuccess }) => {
    const [templateContent, setTemplateContent] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const { userAccount } = useAppContext();

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const tag = userAccount?.tag || 'base';
                const templateName = isCreator ? 'cid-user-rsp' : 'trial-user-rsp';
                const response = await fetch(`/api/templates/${tag}/${templateName}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch template');
                }
                const data = await response.json();
                setTemplateContent(data.content);
            } catch (error) {
                console.error('Error fetching template:', error);
                setTemplateContent('Error loading content. Please try again later.');
            }
        };

        fetchTemplate();
    }, [userAccount, isCreator]);

    const handleApply = () => {
        setShowForm(true);
        setSubmitSuccess(false);
        onApply && onApply();
    };

    const handleCancel = () => {
        setShowForm(false);
        onCancel && onCancel();
    };

    const handleSuccess = () => {
        setShowForm(false);
        setSubmitSuccess(true);
        onSuccess && onSuccess();
    };

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
                                {templateContent || 'Loading...'}
                            </ReactMarkdown>
                            {submitSuccess && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                                    <strong className="font-bold">Success!</strong>
                                    <span className="block sm:inline"> Your application has been submitted successfully.</span>
                                </div>
                            )}
                            <div className="flex justify-center mt-8 mb-6">
                                {isCreator ? (
                                    <Link
                                        href="/account/dashboard"
                                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded inline-block text-center"
                                    >
                                        Go to Creator Dashboard
                                    </Link>
                                ) : (
                                    <button
                                        onClick={handleApply}
                                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded"
                                    >
                                        Apply Now and Start Earning!
                                    </button>
                                )}
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

export default RevenueSharedContent;
