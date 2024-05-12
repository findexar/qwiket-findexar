import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  type: 'error' | 'warning' | 'info' | 'success';
  className?: string;
  severity?: 'low' | 'medium' | 'high'; // Added severity property
}

const typeStyles = {
  error: 'bg-red-100 border-red-400 text-red-700',
  warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
  info: 'bg-blue-100 border-blue-400 text-blue-700',
  success: 'bg-green-100 border-green-400 text-green-700'
};

const Alert: React.FC<AlertProps> = ({ children, type, className = '', severity = 'medium' }) => {
  const severityStyles = {
    low: 'opacity-50',
    medium: 'opacity-75',
    high: 'opacity-100'
  };

  const content = typeof children === 'string' && children.length === 1
    ? <div className="flex justify-center items-center h-full">{children}</div>
    : children;

  return (
    <div className={`border-l-4 p-4 ${typeStyles[type]} ${severityStyles[severity]} ${className}`} role="alert">
      {content}
    </div>
  );
};

export default Alert;
