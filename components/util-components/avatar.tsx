import React from 'react';

interface TailwindAvatarProps {
  children: React.ReactNode;
  alt?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const sizeClasses = {
  small: 'h-6 w-6',
  medium: 'h-10 w-10',
  large: 'h-16 w-16'
};

const TailwindAvatar: React.FC<TailwindAvatarProps> = ({ children, alt, className = '', size = 'medium' }) => {
  const sizeClass = sizeClasses[size];
  return (
    <div
      className={`inline-block rounded-full overflow-hidden flex justify-center items-center ${sizeClass} ${className}`}
      aria-label={alt}
    >
      {React.isValidElement(children) ? React.cloneElement(children, { className: 'rounded-full object-cover w-full h-full' } as React.HTMLAttributes<HTMLElement>) : children}
    </div>
  );
};
export default TailwindAvatar;
