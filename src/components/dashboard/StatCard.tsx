import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
}

const iconStyles = {
  default: 'from-gray-500 to-gray-600',
  primary: 'from-primary to-purple-500',
  success: 'from-emerald-500 to-teal-500',
  warning: 'from-amber-500 to-orange-500',
  info: 'from-blue-500 to-cyan-500',
};

export function StatCard({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className="stat-card card-hover">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className={cn('p-2.5 rounded-xl bg-gradient-to-br shadow-lg', iconStyles[variant])}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {trend && (
        <div className={cn('flex items-center gap-1 mt-2 text-sm font-medium', trend.isPositive ? 'text-emerald-600' : 'text-red-500')}>
          {trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{trend.isPositive ? '+' : '-'}{trend.value}%</span>
          <span className="text-muted-foreground font-normal text-xs">vs last month</span>
        </div>
      )}
    </div>
  );
}
