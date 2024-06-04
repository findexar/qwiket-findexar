import React from 'react';

interface TailwindIconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
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

}) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default TailwindIconButton;
