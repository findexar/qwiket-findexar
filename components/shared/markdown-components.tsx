import React from 'react';
import { Components } from 'react-markdown';

export const MarkdownComponents: Partial<Components> = {
    h1: ({ node, ...props }: any) => <h1 className="text-2xl font-bold my-8" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-xl font-semibold my-4" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-lg font-medium my-2 mt-8" {...props} />,
    p: ({ node, ...props }: any) => <p className="my-2" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc list-inside my-2" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside my-2 mt-4" {...props} />,
    li: ({ node, ...props }: any) => <li className="my-1" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="font-bold mt-4" {...props} />,
    a: ({ node, href, children, ...props }: any) => (
        <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
            {children}
        </a>
    ),
    code: ({ node, className, children, ...props }: any) => {
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
    table: ({ node, children, ...props }: any) => (
        <table className="min-w-full border-collapse border border-gray-300" {...props}>
            {children}
        </table>
    )
};
