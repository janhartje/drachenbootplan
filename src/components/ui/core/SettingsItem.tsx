import React from 'react';
import { cn } from '@/lib/utils';

interface SettingsItemProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({ 
  label, 
  description, 
  children, 
  className = '' 
}) => {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-slate-200 dark:border-slate-800/40 transition-all",
      className
    )}>
      <div className="space-y-0.5">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0 ml-4">
        {children}
      </div>
    </div>
  );
};

export default SettingsItem;
