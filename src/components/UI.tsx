import React from 'react';
import { cn } from '../utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  title?: string;
  extra?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, bodyClassName, title, extra }) => (
  <div className={cn("bg-white/40 dark:bg-black/50 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl overflow-hidden shadow-2xl transition-colors", className)}>
    {title && (
      <div className="px-4 py-3 border-b border-white/30 dark:border-white/10 bg-white/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider drop-shadow-sm">{title}</h3>
        {extra && <div className="drop-shadow-sm">{extra}</div>}
      </div>
    )}
    <div className={cn("p-4", bodyClassName)}>
      {children}
    </div>
  </div>
);

export const KpiCard = ({ title, value, unit, trend, trendLabel, icon }: {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactNode;
}) => (
  <Card className="flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-zinc-100/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-lg text-zinc-600 dark:text-zinc-400">
        {icon}
      </div>
      {trend !== undefined && (
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded-full",
          trend < 0 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
        )}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div>
      <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-1 drop-shadow-sm">{title}</p>
      <div className="flex items-baseline gap-1">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</h2>
        {unit && <span className="text-sm text-zinc-700 dark:text-zinc-200 font-bold drop-shadow-sm">{unit}</span>}
      </div>
      {trendLabel && <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2 font-bold drop-shadow-sm">{trendLabel}</p>}
    </div>
  </Card>
);
