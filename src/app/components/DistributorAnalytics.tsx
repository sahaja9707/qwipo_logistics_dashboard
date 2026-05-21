import { useState, useMemo } from 'react';
import KPICard from './KPICard';
import type { Role } from '../App';
import type { GlobalFilters } from '../data/filterData';
import { getFilteredDrivers, getSnapshotForFilters, getFilteredDistributorPerf } from '../data/filterData';
import { Truck, Users, MapPin, Award, AlertTriangle, ChevronRight, AlertOctagon, Clock, X, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';
import {
  Bar, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
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

const distributionAnomalies = [
  {
    id: 'DIST-ANO-01',
    title: 'Critical D4+ Aging — DIS-HYD-004',
    type: 'Delivery Aging',
    severity: 'critical',
    distributor: 'DIS-HYD-004',
    time: '8 min ago',
    operationalImpact: '14 orders stuck at D4+ with no retry scheduled. Customer churn risk high.',
    recommendedAction: 'Reassign to available driver; escalate to branch manager for priority re-dispatch.',
  },
  {
    id: 'DIST-ANO-02',
    title: 'High Return Rate — DIS-MUM-012',
    type: 'Return Rate',
    severity: 'high',
    distributor: 'DIS-MUM-012',
    time: '23 min ago',
    operationalImpact: 'Return rate at 18.1%, threshold 12%. Repeated offenders identified.',
    recommendedAction: 'Review delivery attempt logs; schedule coaching; enforce proof-of-delivery checks.',
  },
  {
    id: 'DIST-ANO-03',
    title: 'Runtime Exceeded — DIS-BAN-007',
    type: 'Trip Anomaly',
    severity: 'medium',
    distributor: 'DIS-BAN-007',
    time: '1h 10m ago',
    operationalImpact: '9 orders delayed due to overrun routes, increasing SLA breach risk.',
    recommendedAction: 'Tune route planning buffers and rebalance stop assignments for the next cycle.',
  },
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
  const [vehicleUsageView, setVehicleUsageView] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string>('orders');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const snap = useMemo(() => getSnapshotForFilters(filters), [filters]);
  const drivers = useMemo(() => getFilteredDrivers(filters), [filters]);
  const distPerfRaw = useMemo(() => getFilteredDistributorPerf(filters), [filters]);

  // Sorted distributor performance
  const distPerf = useMemo(() => {
    const sorted = [...distPerfRaw].sort((a, b) => {
      let av: number, bv: number;
      switch (sortKey) {
        case 'orders':    av = a.orders;    bv = b.orders;    break;
        case 'delivery':  av = a.fulfilled / a.orders * 100; bv = b.fulfilled / b.orders * 100; break;
        case 'returns':   av = a.returnRate; bv = b.returnRate; break;
        case 'dispatch':  av = a.invoiceL;  bv = b.invoiceL;  break;
        case 'fillRate':  av = a.fillRate;  bv = b.fillRate;  break;
        case 'tripEff':   av = a.tripEfficiency; bv = b.tripEfficiency; break;
        default:          av = a.orders;    bv = b.orders;
      }
      return sortDir === 'desc' ? bv - av : av - bv;
    });
    return sorted;
  }, [distPerfRaw, sortKey, sortDir]);

  function handleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  const vehicleData = vehicleUsageView === 'weekly' ? vehicleUsageWeekly : vehicleUsageMonthly;
  const xKey = vehicleUsageView === 'weekly' ? 'day' : 'week';

  // Returns breakdown
  const totalReturns = snap.returnedOrders + snap.cancelledOrders;
  const retryPct = totalReturns > 0 ? Math.round((snap.deliveryRetryReturns / totalReturns) * 100) : 0;
  const cancelledPct = 100 - retryPct;

  // Driver summary
  const totalTrips = drivers.reduce((s, d) => s + d.trips, 0);
  const totalKm = drivers.reduce((s, d) => s + d.distanceKm, 0);

  return (
    <div className="space-y-4">
      {/* Row 1: Existing KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <KPICard title="Unique Customers" value={snap.uniqueCustomers.toLocaleString()} icon={Users} trend={{ value: 7.8, isPositive: true }} subtitle="Served this week" accentColor="#F59E0B" />
        <KPICard title="Route Coverage Rate" value="98.4%" icon={MapPin} trend={{ value: 1.2, isPositive: true }} subtitle="Planned delivery points reached" accentColor="#10B981" />
      </div>

      {/* Row 2: Dispatch / Return / Net Sales KPI cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Dispatch Value */}
        <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #E2E8F0', borderLeft: '4px solid #6366F1' }}>
          <div className="text-slate-400 font-semibold uppercase tracking-wider mb-1" style={{ fontSize: '9px' }}>Dispatch Value</div>
          <div className="text-slate-800 font-extrabold" style={{ fontSize: '1.5rem' }}>₹{snap.dispatchValue}L</div>
          <div className="text-slate-400 mt-0.5" style={{ fontSize: '10px' }}>
            {snap.totalOrders.toLocaleString()} orders · {(snap.totalVolumetricWeight / 1000).toFixed(1)}T vol.wt
          </div>
        </div>
        {/* Return Value */}
        <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #E2E8F0', borderLeft: '4px solid #EF4444' }}>
          <div className="text-slate-400 font-semibold uppercase tracking-wider mb-1" style={{ fontSize: '9px' }}>Return Value</div>
          <div className="font-extrabold" style={{ fontSize: '1.5rem', color: '#DC2626' }}>₹{snap.returnValue}L</div>
          <div className="text-slate-400 mt-0.5" style={{ fontSize: '10px' }}>
            {snap.returnedOrders + snap.cancelledOrders} returns · {(snap.totalVolumetricWeight * 0.08 / 1000).toFixed(1)}T vol.wt
          </div>
        </div>
        {/* Net Sales Value */}
        <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #E2E8F0', borderLeft: '4px solid #10B981' }}>
          <div className="text-slate-400 font-semibold uppercase tracking-wider mb-1" style={{ fontSize: '9px' }}>Net Sales Value</div>
          <div className="font-extrabold" style={{ fontSize: '1.5rem', color: '#059669' }}>₹{snap.netSalesValue}L</div>
          <div className="text-slate-400 mt-0.5" style={{ fontSize: '10px' }}>
            {snap.fulfilledOrders.toLocaleString()} net orders · {(snap.totalVolumetricWeight * 0.92 / 1000).toFixed(1)}T vol.wt
          </div>
        </div>
      </div>

      {/* Returns Overview */}
      <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-slate-800 text-sm font-semibold">Returns Overview</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Delivery retry vs cancelled returns breakdown</div>
          </div>
          <div className="text-slate-800 font-bold" style={{ fontSize: '1.1rem' }}>
            {totalReturns.toLocaleString()} <span className="text-slate-400 font-normal" style={{ fontSize: '11px' }}>total returns</span>
          </div>
        </div>

        {/* Stacked bar */}
        <div className="w-full rounded-full overflow-hidden flex" style={{ height: 28, gap: 2 }}>
          <div className="flex items-center justify-center transition-all" style={{ width: `${retryPct}%`, background: '#0891B2', borderRadius: '6px 0 0 6px' }}>
            <span className="text-white font-bold" style={{ fontSize: '11px' }}>{retryPct}%</span>
          </div>
          <div className="flex items-center justify-center flex-1 transition-all" style={{ background: '#EF4444', borderRadius: '0 6px 6px 0' }}>
            <span className="text-white font-bold" style={{ fontSize: '11px' }}>{cancelledPct}%</span>
          </div>
        </div>

        {/* Info chips */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: '#0891B2' }} />
            <div>
              <div className="text-slate-700 font-medium" style={{ fontSize: '11px' }}>Delivery Retry</div>
              <div className="text-slate-500" style={{ fontSize: '10px' }}>{snap.deliveryRetryReturns} orders · ₹{(snap.deliveryRetryReturns * 0.9).toFixed(0)}K value</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: '#EF4444' }} />
            <div>
              <div className="text-slate-700 font-medium" style={{ fontSize: '11px' }}>Cancelled Returns</div>
              <div className="text-slate-500" style={{ fontSize: '10px' }}>{snap.cancelledReturns} orders · ₹{(snap.cancelledReturns * 1.4).toFixed(0)}K value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Utilization Gauges — compact inline strip */}
      <div className="flex">
        <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #E2E8F0', maxWidth: 460, width: '100%' }}>
          <div className="text-slate-800 text-sm font-semibold mb-0.5">Fleet Utilization</div>
          <div className="text-slate-400 mb-3" style={{ fontSize: '11px' }}>Vehicle · time · delivery point efficiency against targets</div>
          <div className="grid grid-cols-3 gap-2">
            {UTIL_BASE.map(u => (
              <div key={u.name} className="flex flex-col items-center gap-0.5">
                <GaugeChart value={snap[u.key]} color={u.color} target={u.target} />
                <span className="text-slate-600 text-center font-medium" style={{ fontSize: '11px' }}>{u.name}</span>
                {u.key === 'vehicleUtil' && (
                  <span className="text-slate-500 font-bold" style={{ fontSize: '10.5px', marginTop: '1px' }}>
                    {snap.avgVehicles} vehicles
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Vehicle Usage Trend */}
      <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-slate-800 text-sm font-semibold">Vehicle Usage Trend</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>
              Planned vs actual vehicles (count) · efficiency %
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
            { label: 'Max Vehicles Used', value: Math.max(...vehicleData.map(d => d.used)) + ' units', color: '#0891B2' },
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
              formatter={(value: number, name: string) => name === 'Efficiency %' ? [`${value}%`, name] : [`${value} vehicles`, name]}
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
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block" style={{ background: '#059669', opacity: 0.8 }} /> High eff. (≥95%)</span>
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
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Trips · distance · delivery attempts · return rate · success rate</div>
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
                {['#', 'Trips', 'Km', 'Driver', 'Vehicle', 'Attempts', 'Returns', 'Net Sale (₹L)', 'Net Sale %', '% Returns', 'Success Rate', 'Runtime'].map(h => (
                  <th key={h} className={`px-3 py-3 text-slate-400 font-medium ${['#', 'Trips', 'Km', 'Driver', 'Vehicle'].includes(h) ? 'text-left' : 'text-right'}`} style={{ fontSize: '10px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
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
                    }}
                    className="hover:brightness-[0.97] transition-all"
                  >
                    <td className="px-3 py-2.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold" style={{ background: d.rank <= 3 ? '#FEF3C7' : '#F1F5F9', color: d.rank <= 3 ? '#D97706' : '#64748B', fontSize: '10px' }}>
                        {d.rank}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 font-medium">{d.trips}</td>
                    <td className="px-3 py-2.5 text-slate-600">{d.distanceKm} km</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-700 font-medium">{d.name}</span>
                        {isHighRisk && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '9px', border: '1px solid #FECACA' }}>
                            <AlertTriangle size={8} /> HIGH RISK
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-400" style={{ fontFamily: 'monospace', fontSize: '10px' }}>{d.vehicle}</td>
                    <td className="px-3 py-2.5 text-right text-slate-700">{d.attempts}</td>
                    <td className="px-3 py-2.5 text-right text-slate-500">{d.returns}</td>
                    <td className="px-3 py-2.5 text-right text-slate-700 font-medium">{d.netSale}</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 rounded-full overflow-hidden" style={{ height: 4, background: '#F1F5F9' }}>
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(d.contribution / 14) * 100}%` }} />
                        </div>
                        <span className="text-slate-700">{d.contribution}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="font-bold px-2 py-0.5 rounded-full" style={{ color: d.returnPct > 12 ? '#DC2626' : d.returnPct > 8 ? '#D97706' : '#059669', background: d.returnPct > 12 ? '#FEE2E2' : d.returnPct > 8 ? '#FEF3C7' : '#ECFDF5', fontSize: '10px' }}>
                        {d.returnPct}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="font-semibold" style={{ color: d.successRate >= 95 ? '#059669' : d.successRate >= 90 ? '#D97706' : '#DC2626' }}>
                        {d.successRate}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-500">{d.runtime}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#F8FAFC', borderTop: '2px solid #E2E8F0' }}>
                <td colSpan={3} className="px-3 py-2.5">
                  <span className="text-slate-500 font-semibold" style={{ fontSize: '11px' }}>
                    Summary: {totalTrips} trips · {totalKm.toLocaleString()} km
                  </span>
                </td>
                <td colSpan={9} className="px-3 py-2.5 text-right">
                  <span className="text-slate-400" style={{ fontSize: '10px' }}>
                    {drivers.length} drivers · avg {drivers.length > 0 ? Math.round(totalKm / drivers.length) : 0} km/driver
                  </span>
                </td>
              </tr>
            </tfoot>
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

      {/* Distributor Performance Comparison */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
        <div className="p-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div className="text-slate-800 text-sm font-semibold">Distributor Performance Comparison</div>
          <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>
            Click column headers to sort · Delivery %, return rate, fill rate, trip efficiency
          </div>
        </div>
        {distPerf.length === 0 ? (
          <div className="p-8 text-center text-slate-400" style={{ fontSize: '12px' }}>No distributors match current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {[
                    { label: 'Distributor', key: '' },
                    { label: 'City / Zone', key: '' },
                    { label: 'Orders', key: 'orders' },
                    { label: 'Delivery %', key: 'delivery' },
                    { label: 'Returns', key: 'returns' },
                    { label: 'Dispatch (₹L)', key: 'dispatch' },
                    { label: 'Fill Rate %', key: 'fillRate' },
                    { label: 'Trip Eff %', key: 'tripEff' },
                    { label: 'Status', key: '' },
                  ].map(h => (
                    <th
                      key={h.label}
                      className={`px-4 py-2.5 text-slate-400 font-medium ${['Distributor', 'City / Zone'].includes(h.label) ? 'text-left' : 'text-right'}`}
                      style={{ fontSize: '10px', cursor: h.key ? 'pointer' : 'default', userSelect: 'none' }}
                      onClick={() => h.key && handleSort(h.key)}
                    >
                      <span className="flex items-center gap-1 justify-end">
                        {['Distributor', 'City / Zone'].includes(h.label) ? <span>{h.label}</span> : <span className="ml-auto">{h.label}</span>}
                        {h.key && sortKey === h.key && (
                          sortDir === 'desc' ? <ChevronDown size={10} style={{ color: '#6366F1' }} /> : <ChevronUp size={10} style={{ color: '#6366F1' }} />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {distPerf.map(d => {
                  const deliveryPct = parseFloat(((d.fulfilled / d.orders) * 100).toFixed(1));
                  const status = d.returnRate > 12 ? 'risk' : d.returnRate > 8 ? 'warn' : 'good';
                  return (
                    <tr key={d.code} style={{ borderTop: '1px solid #F1F5F9' }} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 text-slate-700 font-medium" style={{ fontFamily: 'monospace', fontSize: '11px' }}>{d.code}</td>
                      <td className="px-4 py-2.5">
                        <div className="text-slate-600" style={{ fontSize: '11px' }}>{d.city}</div>
                        <div className="text-slate-400" style={{ fontSize: '10px' }}>{d.zone}</div>
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-700">{d.orders}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="font-semibold" style={{ color: deliveryPct >= 92 ? '#059669' : deliveryPct >= 85 ? '#D97706' : '#DC2626' }}>{deliveryPct}%</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="font-semibold" style={{ color: d.returnRate > 12 ? '#DC2626' : d.returnRate > 8 ? '#D97706' : '#059669' }}>{d.returnRate}%</span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-700 font-medium">₹{d.invoiceL}L</td>
                      <td className="px-4 py-2.5 text-right">
                        <span style={{ color: d.fillRate >= 93 ? '#059669' : d.fillRate >= 88 ? '#D97706' : '#DC2626' }}>{d.fillRate}%</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span style={{ color: d.tripEfficiency >= 90 ? '#059669' : d.tripEfficiency >= 85 ? '#D97706' : '#DC2626' }}>{d.tripEfficiency}%</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="px-2 py-0.5 rounded-full font-medium" style={{
                          fontSize: '10px',
                          background: status === 'good' ? '#ECFDF5' : status === 'warn' ? '#FFFBEB' : '#FEF2F2',
                          color: status === 'good' ? '#059669' : status === 'warn' ? '#D97706' : '#DC2626',
                        }}>
                          {status === 'good' ? '✓ On Track' : status === 'warn' ? '⚠ Monitor' : '✕ At Risk'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Distribution anomalies */}
      <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between p-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div className="text-slate-800 text-sm font-semibold">Anomalies</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Click any anomaly to view operational impact and recommended actions</div>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {distributionAnomalies.map(anomaly => {
            const isSelected = selectedAnomalyId === anomaly.id;
            const sc = anomaly.severity === 'critical'
              ? { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'Critical', dot: '#EF4444' }
              : anomaly.severity === 'high'
              ? { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'High', dot: '#F59E0B' }
              : { color: '#0891B2', bg: '#F0F9FF', border: '#BAE6FD', label: 'Medium', dot: '#38BDF8' };
            return (
              <div key={anomaly.id}>
                <button
                  onClick={() => setSelectedAnomalyId(isSelected ? null : anomaly.id)}
                  className="w-full flex items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                  style={{ background: isSelected ? sc.bg : 'transparent' }}
                >
                  <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: sc.dot }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-700 font-medium" style={{ fontSize: '12px' }}>{anomaly.title}</span>
                      <span className="px-1.5 py-0.5 rounded font-medium flex-shrink-0" style={{ background: sc.bg, color: sc.color, fontSize: '10px', border: `1px solid ${sc.border}` }}>{sc.label}</span>
                      <span className="px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: '#F1F5F9', color: '#64748B', fontSize: '10px' }}>{anomaly.type}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1" style={{ fontSize: '11px', color: '#94A3B8' }}>
                      <span>{anomaly.distributor}</span><span>·</span><span>{anomaly.time}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="mt-1 text-slate-400 transition-transform flex-shrink-0" style={{ transform: isSelected ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                </button>
                {isSelected && <DistributionAnomalyExpanded anomaly={anomaly} onClose={() => setSelectedAnomalyId(null)} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DistributionAnomalyExpanded({
  anomaly,
  onClose,
}: {
  anomaly: (typeof distributionAnomalies)[0];
  onClose: () => void;
}) {
  const sc = anomaly.severity === 'critical'
    ? { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'Critical' }
    : anomaly.severity === 'high'
    ? { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'High' }
    : { color: '#0891B2', bg: '#F0F9FF', border: '#BAE6FD', label: 'Medium' };

  return (
    <div className="px-5 pb-4">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: `1.5px solid ${sc.border}` }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ background: sc.bg, borderBottom: `1px solid ${sc.border}` }}>
          <div className="flex items-center gap-2.5">
            <AlertOctagon size={15} style={{ color: sc.color }} />
            <span className="font-semibold" style={{ fontSize: '13px', color: sc.color }}>{anomaly.title}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: sc.color, color: '#fff' }}>{sc.label}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/60 text-slate-400 transition-colors"><X size={15} /></button>
        </div>
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: MapPin,  label: 'Distributor', value: anomaly.distributor },
                { icon: Clock,   label: 'Detected',    value: anomaly.time },
              ].map(item => (
                <div key={item.label} className="rounded-lg p-3" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <item.icon size={11} style={{ color: '#94A3B8' }} />
                    <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                  </div>
                  <div className="text-slate-700 font-medium" style={{ fontSize: '12px' }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div className="rounded-lg p-3" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle size={11} style={{ color: '#D97706' }} />
                <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operational Impact</span>
              </div>
              <p className="text-slate-600 leading-relaxed" style={{ fontSize: '12px' }}>{anomaly.operationalImpact}</p>
            </div>
          </div>
          <div>
            <div className="rounded-lg p-3" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp size={11} style={{ color: '#059669' }} />
                <span style={{ fontSize: '10px', color: '#059669', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended Action</span>
              </div>
              <p className="text-emerald-800 leading-relaxed" style={{ fontSize: '12px' }}>{anomaly.recommendedAction}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
