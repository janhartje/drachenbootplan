import React from 'react';
import { Sparkles } from 'lucide-react';

interface ProBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string; // amber, blue, rose, emerald, violet, slate
}

export const ProBadge: React.FC<ProBadgeProps> = ({ className = '', size = 'md', color = 'amber' }) => {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  const themes = {
    amber: 'from-amber-400 via-yellow-300 to-amber-500 dark:from-amber-600 dark:via-yellow-500 dark:to-amber-700 text-amber-950 dark:text-amber-50 border-amber-500/30 dark:border-amber-400/20',
    blue: 'from-blue-400 via-cyan-300 to-blue-500 dark:from-blue-600 dark:via-cyan-500 dark:to-blue-700 text-blue-950 dark:text-blue-50 border-blue-500/30 dark:border-blue-400/20',
    rose: 'from-rose-400 via-pink-300 to-rose-500 dark:from-rose-600 dark:via-pink-500 dark:to-rose-700 text-rose-950 dark:text-rose-50 border-rose-500/30 dark:border-rose-400/20',
    emerald: 'from-emerald-400 via-teal-300 to-emerald-500 dark:from-emerald-600 dark:via-teal-500 dark:to-emerald-700 text-emerald-950 dark:text-emerald-50 border-emerald-500/30 dark:border-emerald-400/20',
    violet: 'from-violet-400 via-purple-300 to-violet-500 dark:from-violet-600 dark:via-purple-500 dark:to-violet-700 text-violet-950 dark:text-violet-50 border-violet-500/30 dark:border-violet-400/20',
    slate: 'from-slate-400 via-slate-300 to-slate-500 dark:from-slate-600 dark:via-slate-500 dark:to-slate-700 text-slate-950 dark:text-slate-50 border-slate-500/30 dark:border-slate-400/20',
    teal: 'from-teal-400 via-cyan-300 to-teal-500 dark:from-teal-600 dark:via-cyan-500 dark:to-teal-700 text-teal-950 dark:text-teal-50 border-teal-500/30 dark:border-teal-400/20',
    indigo: 'from-indigo-400 via-indigo-300 to-indigo-500 dark:from-indigo-600 dark:via-indigo-500 dark:to-indigo-700 text-indigo-950 dark:text-indigo-50 border-indigo-500/30 dark:border-indigo-400/20',
    orange: 'from-orange-400 via-orange-300 to-orange-500 dark:from-orange-600 dark:via-orange-500 dark:to-orange-700 text-orange-950 dark:text-orange-50 border-orange-500/30 dark:border-orange-400/20',
    zinc: 'from-zinc-400 via-zinc-300 to-zinc-500 dark:from-zinc-600 dark:via-zinc-500 dark:to-zinc-700 text-zinc-950 dark:text-zinc-50 border-zinc-500/30 dark:border-zinc-400/20',
  };

  const currentTheme = themes[color as keyof typeof themes] || themes.amber;

  return (
    <div className={`
      relative overflow-hidden font-bold rounded-md border flex items-center shadow-sm transition-all
      bg-gradient-to-r animate-shine
      ${currentTheme}
      ${sizeClasses[size]}
      ${className}
    `}>
      {/* Shimmer Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" 
           style={{ backgroundSize: '200% 100%' }} />
      
      <Sparkles size={iconSizes[size]} className="relative z-10 animate-pulse" />
      <span className="relative z-10 tracking-wider">PRO</span>
    </div>
  );
};

export default ProBadge;
