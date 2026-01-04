import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hasBorder?: boolean;
  isSoft?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hasBorder = true,
  isSoft = false,
  padding = 'md',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  return (
    <div 
      className={cn(
        "rounded-xl shadow-sm transition-all",
        isSoft 
          ? "bg-slate-50 dark:bg-slate-800/20" 
          : "bg-white dark:bg-slate-900",
        hasBorder && "border border-slate-200 dark:border-slate-800/40",
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
