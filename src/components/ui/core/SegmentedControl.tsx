import React from 'react';
import { cn } from '@/lib/utils';

interface SegmentedControlOption<T> {
  label: React.ReactNode;
  value: T;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  activeClassName?: string;
  isFullWidth?: boolean;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string | number>({ 
  options, 
  value, 
  onChange, 
  className = '',
  activeClassName = '',
  isFullWidth = false,
  size = 'md'
}: SegmentedControlProps<T>) {
  return (
    <div className={cn(
      "flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg",
      isFullWidth ? "w-full" : "w-fit",
      className
    )}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 font-medium rounded-md transition-all active:scale-[0.98]",
              size === 'sm' ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
              isActive 
                ? cn("bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm", activeClassName)
                : "text-slate-500 dark:text-slate-400 sm:hover:text-slate-700 sm:dark:hover:text-slate-200"
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
