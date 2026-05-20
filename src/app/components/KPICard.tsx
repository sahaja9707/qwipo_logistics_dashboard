import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
  accentColor?: string;
  sparkData?: number[];
}

export default function KPICard({ title, value, icon: Icon, trend, subtitle, accentColor = '#6366F1', sparkData }: KPICardProps) {
  const chartData = sparkData ? sparkData.map((v, i) => ({ v, i })) : [];
  const chartId = `kpi-spark-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm"
      style={{
        border: '1px solid #E2E8F0',
        borderLeftWidth: '3px',
        borderLeftColor: accentColor,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ background: `${accentColor}18` }}>
            <Icon size={15} style={{ color: accentColor }} />
          </div>
          <span className="text-slate-500" style={{ fontSize: '11px' }}>{title}</span>
        </div>
        {trend && (
          <div
            className="flex items-center gap-0.5 font-medium"
            style={{ fontSize: '11px', color: trend.isPositive ? '#10B981' : '#EF4444' }}
          >
            {trend.isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Value + sparkline */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-slate-800 font-bold leading-none mb-1" style={{ fontSize: '1.35rem' }}>{value}</div>
          {subtitle && <div className="text-slate-400" style={{ fontSize: '10px' }}>{subtitle}</div>}
        </div>
        {sparkData && chartData.length > 0 && (
          <div style={{ width: 68, height: 36 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart id={chartId} data={chartData} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={accentColor}
                  strokeWidth={1.5}
                  fill={accentColor}
                  fillOpacity={0.15}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
