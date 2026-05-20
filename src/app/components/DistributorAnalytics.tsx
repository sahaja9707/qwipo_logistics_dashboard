import { useState, useMemo } from 'react';
import KPICard from './KPICard';
import type { Role } from '../App';
import type { GlobalFilters } from '../data/filterData';
import { getFilteredDrivers, getSnapshotForFilters } from '../data/filterData';
import { Truck, Users, MapPin, Award, AlertTriangle, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Bar, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';

const vehicleUsageWeekly = [
  { day: 'Mon', used: 82, planned: 96, efficiency: 85.4 },
  { day: 'Tue', used: 91, planned: 96, efficiency: 94.8 },
  { day: 'Wed', used: 88, planned: 96, efficiency: 91.7 },
  { day: 'Thu', used: 94, planned: 96, efficiency: 97.9 },
  { day: 'Fri', used: 96, planned: 96, efficiency: 100 },
  { day: 'Sat', used: 78, planned: 80, efficiency: 97.5 },
  { day: 'Sun', used: 42, planned: 48, efficiency: 87.5 },
];

const vehicleUsageMonthly = [
  { week: 'W1 Apr', used: 84, planned: 96, efficiency: 87.5 },
  { week: 'W2 Apr', used: 89, planned: 96, efficiency: 92.7 },
  { week: 'W3 Apr', used: 91, planned: 96, efficiency: 94.8 },
  { week: 'W4 Apr', used: 79, planned: 96, efficiency: 82.3 },
  { week: 'W1 May', used: 88, planned: 96, efficiency: 91.7 },
  { week: 'W2 May', used: 93, planned: 96, efficiency: 96.9 },
  { week: 'W3 May', used: 87, planned: 96, efficiency: 90.6 },
];

const avgVehiclesTrend = [
  { day: 'Mon', avg: 82, target: 88 },
  { day: 'Tue', avg: 88, target: 88 },
  { day: 'Wed', avg: 85, target: 88 },
  { day: 'Thu', avg: 91, target: 88 },
  { day: 'Fri', avg: 94, target: 88 },
  { day: 'Sat', avg: 76, target: 88 },
  { day: 'Sun', avg: 41, target: 88 },
];

const UTIL_BASE = [
  { name: 'Vehicle Utilization',  color: '#6366F1', target: 90, key: 'vehicleUtil' as const },
  { name: 'Time Utilization',     color: '#0891B2', target: 85, key: 'timeUtil'    as const },
  { name: 'Delivery Point Util.', color: '#10B981', target: 90, key: 'dpUtil'      as const },
];

function GaugeChart({ value, color, target }: { value: number; color: string; target: number }) {
  const radius = 42;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - value / 100);
  const isOnTarget = value >= target;
  return (
    <svg width="100" height="58" viewBox="0 0 100 58">
      <path d={`M 8 50 A ${radius} ${radius} 0 0 1 92 50`} fill="none" stroke="#F1F5F9" strokeWidth="10" strokeLinecap="round" />
      <path d={`M 8 50 A ${radius} ${radius} 0 0 1 92 50`} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${circumference}`} strokeDashoffset={`${offset}`} />
      <text x="50" y="48" textAnchor="middle" fill="#1E293B" fontSize="15" fontWeight="700">{value}%</text>
      <text x="50" y="57" textAnchor="middle" fill={isOnTarget ? '#059669' : '#D97706'} fontSize="8">
        {isOnTarget ? '✓ On target' : `Target: ${target}%`}
      </text>
    </svg>
  );
}

export default function DistributorAnalytics({ role, filters }: { role: Role; filters: GlobalFilters }) {
  const [avgVehiclesExpanded, setAvgVehiclesExpanded] = useState(false);
  const [vehicleUsageView, setVehicleUsageView] = useState<'weekly' | 'monthly'>('weekly');

  const showAvgVehicles = role !== 'admin_support';

  const snap = useMemo(() => getSnapshotForFilters(filters), [filters]);
  const drivers = useMemo(() => getFilteredDrivers(filters), [filters]);

  const vehicleData = vehicleUsageView === 'weekly' ? vehicleUsageWeekly : vehicleUsageMonthly;
  const xKey = vehicleUsageView === 'weekly' ? 'day' : 'week';

  return (
    <div className="space-y-4">
      {/* KPIs — only relevant ones */}
      <div className={`grid gap-3 ${showAvgVehicles ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2'}`}>
        {showAvgVehicles && (
          <KPICard
            title="Avg Vehicles Used"
            value={snap.avgVehicles}
            icon={Truck}
            trend={{ value: 3.4, isPositive: true }}
            subtitle={`${snap.vehicleUtil}% utilization this week`}
            accentColor="#6366F1"
            sparkData={avgVehiclesTrend.map(d => d.avg)}
          />
        )}
        <KPICard title="Unique Customers" value={snap.uniqueCustomers.toLocaleString()} icon={Users} trend={{ value: 7.8, isPositive: true }} subtitle="Served this week" accentColor="#F59E0B" />
        <KPICard title="Distributor Coverage" value="98.4%" icon={MapPin} trend={{ value: 1.2, isPositive: true }} subtitle="Operational efficiency" accentColor="#10B981" />
      </div>

      {/* Avg Vehicles Used — expandable trend — hidden for admin_support */}
      {showAvgVehicles && (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
        <button
          onClick={() => setAvgVehiclesExpanded(v => !v)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
        >
          <div>
            <div className="text-slate-800 text-sm font-semibold">Average Vehicles Used — Daily Trend</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Actual vs target vehicles · click to expand history</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-indigo-600 font-medium" style={{ fontSize: '11px' }}>{avgVehiclesExpanded ? 'Collapse' : 'Expand trend'}</span>
            {avgVehiclesExpanded ? <ChevronUp size={14} style={{ color: '#6366F1' }} /> : <ChevronDown size={14} style={{ color: '#6366F1' }} />}
          </div>
        </button>

        {avgVehiclesExpanded && (
          <div className="px-5 pb-5" style={{ borderTop: '1px solid #F1F5F9' }}>
            <div className="grid grid-cols-3 gap-3 my-4">
              {[
                { label: 'Peak Day', value: 'Friday', sub: '94 vehicles', color: '#059669' },
                { label: 'Low Day', value: 'Sunday', sub: '41 vehicles', color: '#EF4444' },
                { label: 'Weekly Avg', value: '82.3', sub: 'vs target 88', color: '#6366F1' },
              ].map(m => (
                <div key={m.label} className="rounded-lg p-3 text-center" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <div className="font-bold text-slate-800" style={{ fontSize: '1.1rem' }}>{m.value}</div>
                  <div className="text-slate-500" style={{ fontSize: '11px' }}>{m.label}</div>
                  <div style={{ fontSize: '10px', color: m.color }}>{m.sub}</div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart id="avg-vehicles-trend" data={avgVehiclesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} />
                <ReferenceLine y={88} stroke="#94A3B8" strokeDasharray="4 2" label={{ value: 'Target', position: 'right', fontSize: 10, fill: '#94A3B8' }} />
                <Bar dataKey="avg" fill="#6366F1" fillOpacity={0.8} radius={[3, 3, 0, 0]} name="Avg Vehicles" isAnimationActive={false}>
                  {avgVehiclesTrend.map((entry, i) => (
                    <Cell
                      key={`avg-cell-${i}`}
                      fill={entry.avg >= entry.target ? '#6366F1' : entry.avg >= entry.target * 0.85 ? '#F59E0B' : '#EF4444'}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="target" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Target" isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 justify-center" style={{ fontSize: '11px', color: '#94A3B8' }}>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block" style={{ background: '#6366F1', opacity: 0.85 }} /> On/above target</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block" style={{ background: '#F59E0B', opacity: 0.85 }} /> Near target</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block" style={{ background: '#EF4444', opacity: 0.85 }} /> Below target</span>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Fleet Utilization Gauges */}
      <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="text-slate-800 text-sm font-semibold mb-0.5">Fleet Utilization</div>
        <div className="text-slate-400 mb-5" style={{ fontSize: '11px' }}>Vehicle · time · delivery point efficiency against targets</div>
        <div className="grid grid-cols-3 gap-4">
          {UTIL_BASE.map(u => (
            <div key={u.name} className="flex flex-col items-center gap-1">
              <GaugeChart value={snap[u.key]} color={u.color} target={u.target} />
              <span className="text-slate-600 text-center" style={{ fontSize: '11px' }}>{u.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Usage Trend — redesigned */}
      <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-slate-800 text-sm font-semibold">Vehicle Usage Trend</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>
              Planned vs actual · efficiency % · peak and low utilization highlighted
            </div>
          </div>
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
            {(['weekly', 'monthly'] as const).map(v => (
              <button
                key={v}
                onClick={() => setVehicleUsageView(v)}
                className="px-3 py-1.5 transition-colors"
                style={{
                  background: vehicleUsageView === v ? '#6366F1' : '#fff',
                  color: vehicleUsageView === v ? '#fff' : '#64748B',
                  fontSize: '11px',
                }}
              >
                {v === 'weekly' ? 'This Week' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Peak Utilization', value: vehicleData.reduce((m, d) => d.efficiency > m ? d.efficiency : m, 0).toFixed(1) + '%', color: '#059669' },
            { label: 'Low Utilization',  value: vehicleData.reduce((m, d) => d.efficiency < m ? d.efficiency : m, 100).toFixed(1) + '%', color: '#EF4444' },
            { label: 'Avg Efficiency',   value: (vehicleData.reduce((s, d) => s + d.efficiency, 0) / vehicleData.length).toFixed(1) + '%', color: '#6366F1' },
            { label: 'Max Vehicles',     value: Math.max(...vehicleData.map(d => d.used)) + ' units', color: '#0891B2' },
          ].map(m => (
            <div key={m.label} className="rounded-lg p-3" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <div className="font-bold" style={{ fontSize: '1.1rem', color: m.color }}>{m.value}</div>
              <div className="text-slate-500" style={{ fontSize: '10px' }}>{m.label}</div>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart id="dist-vehicle-composed" data={vehicleData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 110]} label={{ value: 'Vehicles', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 10, fill: '#94A3B8' } }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[60, 110]} tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }}
              formatter={(value: number, name: string) => name === 'Efficiency %' ? [`${value}%`, name] : [value, name]}
            />
            <Bar yAxisId="left" dataKey="planned" fill="#E2E8F0" radius={[3, 3, 0, 0]} name="Planned" isAnimationActive={false} />
            <Bar yAxisId="left" dataKey="used" fill="#6366F1" fillOpacity={0.85} radius={[3, 3, 0, 0]} name="Used" isAnimationActive={false}>
              {vehicleData.map((entry, i) => (
                <Cell
                  key={`vehicle-cell-${i}`}
                  fill={entry.efficiency >= 95 ? '#059669' : entry.efficiency >= 85 ? '#6366F1' : '#EF4444'}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
            <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 3 }} name="Efficiency %" isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-4 mt-2 justify-center flex-wrap" style={{ fontSize: '11px', color: '#94A3B8' }}>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block bg-slate-200" /> Planned</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block" style={{ background: '#059669', opacity: 0.8 }} /> High efficiency (≥95%)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block" style={{ background: '#6366F1', opacity: 0.8 }} /> Normal (85-95%)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block" style={{ background: '#EF4444', opacity: 0.8 }} /> Low (&lt;85%)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded inline-block" style={{ background: '#F59E0B' }} /> Efficiency %</span>
        </div>
      </div>

      {/* Driver Performance Table */}
      <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between p-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div className="text-slate-800 text-sm font-semibold">Driver Performance Analytics</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Delivery attempts · net sale · return rate · success rate</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: '#FEF2F2', fontSize: '11px', color: '#DC2626', border: '1px solid #FECACA' }}>
              <AlertTriangle size={11} />
              <span>{drivers.filter(d => d.returnPct > 12).length} high-risk</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: '#FFFBEB', fontSize: '11px', color: '#D97706' }}>
              <Award size={12} /> Top performers
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['#', 'Driver', 'Vehicle', 'Attempts', 'Returns', 'Net Sale (₹L)', 'Net Sale Contri %', '% Returns', 'Success Rate', 'Runtime'].map(h => (
                  <th key={h} className={`px-4 py-3 text-slate-400 font-medium ${['#', 'Driver', 'Vehicle'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Sort: high-return-rate drivers bubble to top with warning styling */}
              {[...drivers].sort((a, b) => {
                if (a.returnPct > 12 && b.returnPct <= 12) return -1;
                if (b.returnPct > 12 && a.returnPct <= 12) return 1;
                return a.rank - b.rank;
              }).map(d => {
                const isHighRisk = d.returnPct > 12;
                return (
                  <tr
                    key={d.rank}
                    style={{
                      borderTop: '1px solid #F1F5F9',
                      background: isHighRisk ? '#FFF5F5' : 'transparent',
                      position: 'relative',
                    }}
                    className="hover:brightness-[0.97] transition-all"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                          style={{ background: d.rank <= 3 ? '#FEF3C7' : '#F1F5F9', color: d.rank <= 3 ? '#D97706' : '#64748B', fontSize: '11px' }}
                        >
                          {d.rank}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700 font-medium">{d.name}</span>
                        {isHighRisk && (
                          <span
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                            style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '10px', border: '1px solid #FECACA' }}
                          >
                            <AlertTriangle size={9} />
                            HIGH RISK
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400" style={{ fontFamily: 'monospace', fontSize: '11px' }}>{d.vehicle}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{d.attempts}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{d.returns}</td>
                    <td className="px-4 py-3 text-right text-slate-700 font-medium">{d.netSale}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-14 rounded-full overflow-hidden" style={{ height: 4, background: '#F1F5F9' }}>
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(d.contribution / 14) * 100}%` }} />
                        </div>
                        <span className="text-slate-700">{d.contribution}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span
                          className="font-bold px-2 py-0.5 rounded-full"
                          style={{
                            color: d.returnPct > 12 ? '#DC2626' : d.returnPct > 8 ? '#D97706' : '#059669',
                            background: d.returnPct > 12 ? '#FEE2E2' : d.returnPct > 8 ? '#FEF3C7' : '#ECFDF5',
                            fontSize: '11px',
                          }}
                        >
                          {d.returnPct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold" style={{ color: d.successRate >= 95 ? '#059669' : d.successRate >= 90 ? '#D97706' : '#DC2626' }}>
                        {d.successRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">{d.runtime}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {drivers.filter(d => d.returnPct > 12).length > 0 && (
          <div className="px-5 py-3 flex items-start gap-2.5" style={{ background: '#FFF5F5', borderTop: '1px solid #FECACA' }}>
            <AlertTriangle size={13} style={{ color: '#DC2626', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: '11px', color: '#B91C1C' }}>
              <span className="font-semibold">High return rate alert: </span>
              {drivers.filter(d => d.returnPct > 12).map(d => `${d.name} (${d.returnPct}%)`).join(', ')} exceed the 12% return threshold. Immediate review recommended.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

