import React from 'react';
import { Components } from 'react-markdown';

export const MarkdownComponents: Partial<Components> = {
    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-8" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-xl font-semibold my-4" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-lg font-medium my-2 mt-8" {...props} />,
    p: ({ node, ...props }) => <p className="my-2" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-2 mt-4" {...props} />,
    li: ({ node, ...props }) => <li className="my-1" {...props} />,
    strong: ({ node, ...props }) => <strong className="font-bold mt-4" {...props} />,
    a: ({ node, href, children, ...props }) => (
        <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
            {children}
        </a>
    ),
    code: ({ node, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || '');
        return match ? (
            <pre className="bg-gray-100 dark:bg-gray-800 rounded p-2 my-2 overflow-x-auto">
                <code className={className} {...props}>
                    {children}
                </code>
            </pre>
        ) : (
            <code className="bg-gray-200 dark:bg-gray-700 rounded px-1" {...props}>
                {children}
            </code>
        );
    },
};
