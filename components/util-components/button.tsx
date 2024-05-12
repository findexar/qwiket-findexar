//create a button component that wraps children and supports additional properties like size and variant. Should mimic mui Button properties.

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium' | 'large';
  variant?: 'text' | 'outlined' | 'contained';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, size = 'medium', variant = 'outlined', disabled = false, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 dark:text-white rounded-md";
  const sizeStyles = {
    small: "px-2 py-1 text-xs",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };
  const variantStyles = {
    text: "text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md",
    outlined: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md",
    contained: "text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-800 dark:hover:bg-blue-700 rounded-md",
  };

  const className = `${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${props.className || ''}`;

  return (
    <button {...props} className={className} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;

