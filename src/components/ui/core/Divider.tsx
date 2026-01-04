import React from 'react';
import { cn } from '@/lib/utils';

interface DividerProps {
  className?: string;
  vertical?: boolean;
}

export const Divider: React.FC<DividerProps> = ({ className = '', vertical = false }) => {
  return (
    <div className={cn(
      vertical 
        ? "w-px h-full bg-slate-200 dark:bg-slate-800/60 mx-2" 
        : "h-px w-full bg-slate-100 dark:bg-slate-800/60 my-4",
      className
    )} />
  );
};

export default Divider;
