export const THEME_MAP = {
  amber: {
    text: 'text-amber-600 dark:text-amber-500',
    ring: 'from-amber-500 via-yellow-200 to-amber-600',
    ringBorder: 'group-hover:border-amber-400',
    button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
    buttonGhost: 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30'
  },
  blue: {
    text: 'text-blue-600 dark:text-blue-500',
    ring: 'from-blue-500 via-cyan-200 to-blue-600',
    ringBorder: 'group-hover:border-blue-400',
    button: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20',
    buttonGhost: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
  },
  rose: {
    text: 'text-rose-600 dark:text-rose-500',
    ring: 'from-rose-500 via-pink-200 to-rose-600',
    ringBorder: 'group-hover:border-rose-400',
    button: 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20',
    buttonGhost: 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
  },
  emerald: {
    text: 'text-emerald-600 dark:text-emerald-500',
    ring: 'from-emerald-500 via-teal-200 to-emerald-600',
    ringBorder: 'group-hover:border-emerald-400',
    button: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20',
    buttonGhost: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-blue-950/30'
  },
  violet: {
    text: 'text-violet-600 dark:text-violet-500',
    ring: 'from-violet-500 via-purple-200 to-violet-600',
    ringBorder: 'group-hover:border-violet-400',
    button: 'bg-violet-500 hover:bg-violet-600 shadow-violet-500/20',
    buttonGhost: 'text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30'
  },
  slate: {
    text: 'text-slate-700 dark:text-slate-300',
    ring: 'from-slate-600 via-slate-200 to-slate-700',
    ringBorder: 'group-hover:border-slate-400',
    button: 'bg-slate-700 hover:bg-slate-800 shadow-slate-700/20',
    buttonGhost: 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30'
  },
  teal: {
    text: 'text-teal-600 dark:text-teal-500',
    ring: 'from-teal-500 via-teal-200 to-teal-600',
    ringBorder: 'group-hover:border-teal-400',
    button: 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/20',
    buttonGhost: 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30'
  },
  indigo: {
    text: 'text-indigo-600 dark:text-indigo-500',
    ring: 'from-indigo-500 via-indigo-200 to-indigo-600',
    ringBorder: 'group-hover:border-indigo-400',
    button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20',
    buttonGhost: 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
  },
  orange: {
    text: 'text-orange-600 dark:text-orange-500',
    ring: 'from-orange-500 via-orange-200 to-orange-600',
    ringBorder: 'group-hover:border-orange-400',
    button: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20',
    buttonGhost: 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30'
  },
  zinc: {
    text: 'text-zinc-600 dark:text-zinc-500',
    ring: 'from-zinc-500 via-zinc-200 to-zinc-600',
    ringBorder: 'group-hover:border-zinc-400',
    button: 'bg-zinc-600 hover:bg-zinc-700 shadow-zinc-500/20',
    buttonGhost: 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
  }
};

export type ThemeKey = keyof typeof THEME_MAP;
