import React from 'react';

interface TailwindIconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

const sizeClasses = {
  small: 'p-1 text-xs',
  medium: 'p-2 text-base',
  large: 'p-3 text-lg'
};

const colorClasses = {
  inherit: 'text-current',
  primary: 'text-blue-500',
  secondary: 'text-gray-500',
  default: 'text-black'
};

const TailwindIconButton: React.FC<TailwindIconButtonProps> = ({
  children,
  onClick,
  className = '',
  color = 'default',
  size = 'medium'
}) => {
  const sizeClass = sizeClasses[size];
  const colorClass = colorClasses[color as keyof typeof colorClasses];
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full ${sizeClass} ${colorClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default TailwindIconButton;
