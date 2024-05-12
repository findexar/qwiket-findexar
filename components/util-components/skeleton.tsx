import React from 'react';

interface SkeletonProps {
  variant?: 'circular' | 'rectangular';
  height?: string;
  width?: string;
  color?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ variant, height, width, color }) => {
  const baseClasses = "inline-block animate-pulse";
  const heightClass = height ? `h-[${height}]` : 'h-4';
  const widthClass = width ? `w-[${width}]` : 'w-full';
  const colorClass = color ? `bg-[${color}]` : 'bg-gray-200';
  const borderRadiusClass = variant === 'circular' ? 'rounded-full' : 'rounded';

  return (
    <div className={`${baseClasses} ${heightClass} ${widthClass} ${colorClass} ${borderRadiusClass}`}></div>
  );
};

export default Skeleton;

