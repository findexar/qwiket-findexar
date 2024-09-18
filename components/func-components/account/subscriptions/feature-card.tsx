import React from 'react';
import { FeatureCard } from './price-plans';

const FeatureCardComponent: React.FC<FeatureCard> = ({ title, description, Icon }) => (
    <div className="flex flex-col items-start gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center text-emerald-500">
            <Icon className="h-6 w-6" aria-label="Feature icon" role="graphics-symbol" />
        </div>
        <div className="flex w-full min-w-0 flex-col items-start justify-center gap-0 text-base">
            <h3 className="mb-4 text-lg leading-6 text-slate-700 dark:text-slate-200">
                {title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
                {description}
            </p>
        </div>
    </div>
);

export default FeatureCardComponent;