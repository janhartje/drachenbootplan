import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: 'default' | 'ghost' | 'soft' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  iconSize?: number;
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  icon: Icon, 
  variant = 'default', 
  size = 'md', 
  iconSize,
  className = '',
  ...props 
}) => {
  const variants = {
    default: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 shadow-sm',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
    soft: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400',
    outline: 'border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-400 dark:hover:border-slate-600 transition-colors',
  };

  const sizes = {
    sm: 'p-1.5 rounded-md w-8 h-8',
    md: 'p-2 rounded-lg w-10 h-10',
    lg: 'p-2.5 rounded-xl w-12 h-12',
  };

  const defaultIconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      className={cn(
        "transition-all flex items-center justify-center shrink-0 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <Icon size={iconSize || defaultIconSizes[size]} />
    </button>
  );
};

export default IconButton;
