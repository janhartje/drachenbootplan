import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
  activeColor?: string; // e.g. 'bg-amber-500'
  focusColor?: string; // e.g. 'focus:ring-amber-500'
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ 
  enabled, 
  onChange, 
  className = '', 
  activeColor = 'bg-amber-500',
  focusColor = 'focus:ring-amber-500',
  disabled = false
}) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
        focusColor,
        enabled ? activeColor : "bg-slate-200 dark:bg-slate-800",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span
        className={cn(
          "relative inline-block h-4 w-4 transform rounded-full bg-slate-100 transition-transform shadow-sm",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
};

export default Toggle;
