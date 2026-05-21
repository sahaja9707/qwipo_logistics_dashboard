import { useState, useMemo } from 'react';
import KPICard from './KPICard';
import type { Role } from '../App';
import { getFilteredDrivers, getSnapshotForFilters, type GlobalFilters } from '../data/filterData';
import { Truck, MapPin, AlertTriangle, Award, DollarSign, Clock, TrendingDown, ChevronDown, ChevronRight } from 'lucide-react';
import { LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine, ReferenceArea } from 'recharts';

const runtimeSpark = [3.8, 4.1, 3.6, 4.4, 3.9, 3.5, 3.2, 3.2].map((v, i) => ({ i, v }));

const tripsTrend = [
  { date: 'May 10', trips: 48, completed: 44 },
  { date: 'May 11', trips: 52, completed: 50 },
  { date: 'May 12', trips: 45, completed: 42 },
  { date: 'May 13', trips: 58, completed: 55 },
  { date: 'May 14', trips: 61, completed: 59 },
  { date: 'May 15', trips: 54, completed: 51 },
  { date: 'May 16', trips: 49, completed: 47 },
  { date: 'May 17', trips: 36, completed: 33 },
];

const runtimeTrend = [
  { date: 'May 10', avgRuntime: 3.8, target: 4.0, overTarget: null as number | null, underTarget: 3.8 },
  { date: 'May 11', avgRuntime: 4.1, target: 4.0, overTarget: 4.1, underTarget: null as number | null },
  { date: 'May 12', avgRuntime: 3.6, target: 4.0, overTarget: null, underTarget: 3.6 },
  { date: 'May 13', avgRuntime: 4.4, target: 4.0, overTarget: 4.4, underTarget: null },
  { date: 'May 14', avgRuntime: 3.9, target: 4.0, overTarget: null, underTarget: 3.9 },
  { date: 'May 15', avgRuntime: 3.5, target: 4.0, overTarget: null, underTarget: 3.5 },
  { date: 'May 16', avgRuntime: 3.2, target: 4.0, overTarget: null, underTarget: 3.2 },
  { date: 'May 17', avgRuntime: 3.2, target: 4.0, overTarget: null, underTarget: 3.2 },
];

const anomalies = [
  { id: 1, trip: 'TRP-3847', vehicle: 'TS-09-EA-7823', driver: 'Ramesh Kumar', type: 'Runtime Exceeded', detail: '+2.4 hrs over planned 6h window', time: '1h 23m ago', severity: 'high' },
  { id: 2, trip: 'TRP-3841', vehicle: 'TS-09-EB-5678', driver: 'Anand Singh', type: 'Route Deviation', detail: 'Deviated 4.2 km from planned route near Madhapur', time: '2h 11m ago', severity: 'medium' },
  { id: 3, trip: 'TRP-3839', vehicle: 'TS-09-EA-3312', driver: 'Vikram Reddy', type: 'SIM Card Changed', detail: 'Device SIM replaced mid-trip — possible tamper risk', time: '3h 05m ago', severity: 'high' },
  { id: 4, trip: 'TRP-3831', vehicle: 'TS-09-EA-4421', driver: 'Suresh Reddy', type: 'Underutilization Alert', detail: 'Vehicle idle 47 min at stop #8 — Gachibowli, below efficiency threshold', time: '4h 40m ago', severity: 'low' },
  { id: 5, trip: 'TRP-3828', vehicle: 'TS-09-EB-9012', driver: 'Prakash Rao', type: 'Delivery Failure', detail: 'Stop #14 skipped without recorded delivery attempt — 3 consecutive failures', time: '5h 12m ago', severity: 'medium' },
  { id: 6, trip: 'TRP-3822', vehicle: 'TS-09-EA-6601', driver: 'Deepak Sharma', type: 'Delay Alert', detail: 'Trip running 1h 15m behind schedule — 9 stops remaining', time: '6h 30m ago', severity: 'medium' },
];

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  high:   { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  medium: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  low:    { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
};

// Trips lifecycle — 4 types
const lifecycle = [
  { label: 'Planned',     value: 18,  color: '#6366F1', dot: '🔵' },
  { label: 'In Progress', value: 14,  color: '#F59E0B', dot: '🟡' },
  { label: 'Completed',   value: 92,  color: '#10B981', dot: '🟢' },
  { label: 'Cancelled',   value: 4,   color: '#94A3B8', dot: '⚫' },
];
const totalTrips = lifecycle.reduce((s, x) => s + x.value, 0);


const ANOMALY_TYPE_OPTIONS = ['All Types', 'Runtime Exceeded', 'Route Deviation', 'SIM Card Changed', 'Underutilization Alert', 'Delivery Failure', 'Delay Alert'];
const ANOMALY_SEV_OPTIONS  = ['All Severity', 'high', 'medium', 'low'];
type TripAnomaly = typeof anomalies[0];

function GaugeChart({ value, color, target }: { value: number; color: string; target: number }) {
  const radius = 32;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - value / 100);
  const isOnTarget = value >= target;
  return (
    <svg width="80" height="48" viewBox="0 0 80 48">
      <path d={`M 8 40 A ${radius} ${radius} 0 0 1 72 40`} fill="none" stroke="#F1F5F9" strokeWidth="8" strokeLinecap="round" />
      <path d={`M 8 40 A ${radius} ${radius} 0 0 1 72 40`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${circumference}`} strokeDashoffset={`${offset}`} />
      <text x="40" y="38" textAnchor="middle" fill="#1E293B" fontSize="13" fontWeight="700">{value}%</text>
      <text x="40" y="46" textAnchor="middle" fill={isOnTarget ? '#059669' : '#D97706'} fontSize="7">{isOnTarget ? '✓ On target' : `Target: ${target}%`}</text>
    </svg>
  );
}

export default function TripsMonitoring({ role, filters }: { role: Role; filters: GlobalFilters }) {
  const showDeliveryCost = role !== 'admin_support' && role !== 'branch_manager';

  const snap = useMemo(() => getSnapshotForFilters(filters), [filters]);

  const utilizationMetrics = useMemo(() => [
    { name: 'Vehicle Utilization', value: snap.vehicleUtil, color: '#6366F1', target: 90, key: 'vehicleUtil' },
    { name: 'Time Utilization', value: snap.timeUtil, color: '#0891B2', target: 85, key: 'timeUtil' },
    { name: 'Delivery Point Util.', value: snap.dpUtil, color: '#10B981', target: 90, key: 'dpUtil' },
  ], [snap]);

  const [anomalyTypeFilter, setAnomalyTypeFilter] = useState('All Types');
  const [anomalySevFilter,  setAnomalySevFilter]  = useState('All Severity');
  const [typeDropOpen, setTypeDropOpen] = useState(false);
  const [sevDropOpen,  setSevDropOpen]  = useState(false);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<number | null>(null);

  const filteredAnomalies = anomalies.filter(a => {
    const typeOk = anomalyTypeFilter === 'All Types'    || a.type     === anomalyTypeFilter;
    const sevOk  = anomalySevFilter  === 'All Severity' || a.severity === anomalySevFilter;
    return typeOk && sevOk;
  });

  const drivers = useMemo(() => getFilteredDrivers(filters), [filters]);

  return (
    <div className="space-y-4">
      {/* ── 4 Trip Type Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {lifecycle.map(seg => (
          <div key={seg.label} className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #E2E8F0', borderTop: `3px solid ${seg.color}` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 font-medium" style={{ fontSize: '11px' }}>{seg.label}</span>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
            </div>
            <div className="font-extrabold text-slate-800" style={{ fontSize: '2rem', lineHeight: 1 }}>{seg.value}</div>
            <div style={{ fontSize: '10px', color: seg.color, marginTop: 4 }}>
              {((seg.value / totalTrips) * 100).toFixed(0)}% of {totalTrips} total
            </div>
            <div className="w-full rounded-full mt-3" style={{ height: 4, background: '#F1F5F9', overflow: 'hidden' }}>
              <div className="h-full rounded-full" style={{ width: `${(seg.value / totalTrips) * 100}%`, background: seg.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Operational Efficiency Panel ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Avg Runtime */}
        <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col" style={{ border: '1px solid #E2E8F0', borderLeftWidth: 3, borderLeftColor: '#8B5CF6' }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: '#8B5CF615' }}>
                <Clock size={14} style={{ color: '#8B5CF6' }} />
              </div>
              <span className="text-slate-500" style={{ fontSize: '11px' }}>Avg Run Time</span>
            </div>
            <span className="flex items-center gap-0.5 font-medium" style={{ fontSize: '11px', color: '#10B981' }}>
              <TrendingDown size={11} />6.5%
            </span>
          </div>
          <div className="font-bold text-slate-800 mt-1 mb-0.5" style={{ fontSize: '1.6rem', lineHeight: 1 }}>3.2 <span style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>hrs</span></div>
          <div className="text-slate-400 mb-3" style={{ fontSize: '10px' }}>Per trip · target ≤ 4h</div>
          <div className="flex-1" style={{ minHeight: 44 }}>
            <ResponsiveContainer width="100%" height={44}>
              <AreaChart id="trips-runtime-spark" data={runtimeSpark} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
                <Area type="monotone" dataKey="v" stroke="#8B5CF6" strokeWidth={1.5} fill="#8B5CF6" fillOpacity={0.12} dot={false} isAnimationActive={false} />
                <ReferenceLine y={4.0} stroke="#CBD5E1" strokeDasharray="3 2" strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-1" style={{ fontSize: '9px', color: '#CBD5E1' }}>
            <span>May 10</span><span>May 17</span>
          </div>
        </div>

        {/* Avg Route Distance — compact card */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0', borderLeftWidth: 3, borderLeftColor: '#0891B2' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-slate-800 text-sm font-semibold">Avg Route Distance</div>
              <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Manual routing vs digital optimization — per trip</div>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
              <TrendingDown size={11} style={{ color: '#059669' }} />
              <span className="font-bold" style={{ fontSize: '11px', color: '#059669' }}>−17.6% saved</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-xl text-center" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <div className="text-slate-400 font-semibold uppercase mb-1" style={{ fontSize: '9px' }}>Manual Routing</div>
              <div className="font-extrabold line-through" style={{ fontSize: '1.6rem', color: '#94A3B8', textDecorationColor: '#EF4444' }}>148</div>
              <div className="text-slate-400" style={{ fontSize: '10px' }}>km / trip</div>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
              <div className="text-slate-400 font-semibold uppercase mb-1" style={{ fontSize: '9px' }}>Digital Routing</div>
              <div className="font-extrabold" style={{ fontSize: '1.6rem', color: '#0891B2' }}>122</div>
              <div className="text-slate-500" style={{ fontSize: '10px' }}>km / trip</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F0F9FF 100%)', border: '1px solid #A7F3D0' }}>
            <TrendingDown size={14} style={{ color: '#059669' }} />
            <span className="font-bold text-emerald-700" style={{ fontSize: '13px' }}>−26 km saved per trip</span>
            <span className="text-slate-400" style={{ fontSize: '11px' }}>· reduces fuel + SLA breach risk</span>
          </div>
        </div>

      </div>

      {/* ── Remaining KPIs ───────────────────────────────────────── */}
      <div className={`grid gap-3 ${showDeliveryCost ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {showDeliveryCost && (
          <KPICard title="Delivery Cost" value="₹3.8L" icon={DollarSign} trend={{ value: 2.1, isPositive: false }} subtitle="Today" accentColor="#F59E0B" />
        )}
        <KPICard title="Total Delivery Stops" value="4,218" icon={MapPin} trend={{ value: 4.8, isPositive: true }} subtitle="Stops covered today" accentColor="#8B5CF6" />
      </div>

      {/* Gauge Charts — Utilization Overview — compact inline strip */}
      <div className="flex">
        <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #E2E8F0', maxWidth: 460, width: '100%' }}>
          <div className="text-slate-800 text-sm font-semibold mb-0.5">Utilization Overview</div>
          <div className="text-slate-400 mb-3" style={{ fontSize: '11px' }}>Vehicle, time, and delivery point efficiency gauges</div>
          <div className="grid grid-cols-3 gap-2">
            {utilizationMetrics.map(u => (
              <div key={u.name} className="flex flex-col items-center gap-0.5">
                <GaugeChart value={u.value} color={u.color} target={u.target} />
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

      {/* Trips Trend (Full Width) */}
      <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="text-slate-800 text-sm font-semibold mb-0.5">Trips Trend</div>
        <div className="text-slate-400 mb-4" style={{ fontSize: '11px' }}>Daily dispatched vs completed</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart id="trips-trend-line" data={tripsTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[30, 70]} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} />
            <Line type="monotone" dataKey="trips" stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Dispatched" isAnimationActive={false} />
            <Line type="monotone" dataKey="completed" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', r: 3 }} name="Completed" isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Runtime Trend — Enhanced visualization */}
      <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-slate-800 text-sm font-semibold">Runtime Trend</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Average trip runtime vs 4h target — last 8 days · green = on target, red = exceeded</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(() => {
              const overCount  = runtimeTrend.filter(d => d.avgRuntime > d.target).length;
              const underCount = runtimeTrend.length - overCount;
              const avgRuntime = (runtimeTrend.reduce((s, d) => s + d.avgRuntime, 0) / runtimeTrend.length).toFixed(2);
              return (
                <>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                    {overCount} day{overCount !== 1 ? 's' : ''} over
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#ECFDF5', color: '#059669' }}>
                    {underCount} day{underCount !== 1 ? 's' : ''} under
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#EEF2FF', color: '#6366F1' }}>
                    Avg: {avgRuntime}h
                  </span>
                </>
              );
            })()}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart id="trips-runtime-area" data={runtimeTrend} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="runtimeGradientGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="runtimeGradientRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            {/* Shaded "over-target" zone */}
            <ReferenceArea y1={4.0} y2={5.0} fill="#FEF2F2" fillOpacity={0.4} />
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
              domain={[2.5, 5]}
              tickFormatter={(v: number) => `${v}h`}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }}
              formatter={(v: number, name: string) => {
                if (name === 'Avg Runtime') {
                  const isOver = v > 4.0;
                  return [`${v}h ${isOver ? '⚠ Over target' : '✓ On target'}`, name];
                }
                return [`${v}h`, name];
              }}
            />
            {/* Target line */}
            <Line
              type="monotone"
              dataKey="target"
              stroke="#94A3B8"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={false}
              name="Target (4h)"
              isAnimationActive={false}
            />
            {/* Avg runtime line without dots */}
            <Line
              type="monotone"
              dataKey="avgRuntime"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="Avg Runtime"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Anomaly feed — with dropdown filters */}
      <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between p-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div className="text-slate-800 text-sm font-semibold">Anomaly Feed</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Runtime anomalies, delay alerts, underutilization &amp; delivery failures</div>
          </div>
          <div className="flex items-center gap-2">
            {/* Type dropdown */}
            <div className="relative">
              <button
                onClick={() => { setTypeDropOpen(o => !o); setSevDropOpen(false); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
                style={{
                  border: `1px solid ${anomalyTypeFilter !== 'All Types' ? '#6366F1' : '#E2E8F0'}`,
                  fontSize: '11px',
                  color: anomalyTypeFilter !== 'All Types' ? '#4F46E5' : '#64748B',
                  background: anomalyTypeFilter !== 'All Types' ? '#F5F3FF' : '#fff',
                }}
              >
                {anomalyTypeFilter === 'All Types' ? 'Type' : anomalyTypeFilter.length > 12 ? anomalyTypeFilter.slice(0, 12) + '…' : anomalyTypeFilter}
                <ChevronDown size={10} />
              </button>
              {typeDropOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setTypeDropOpen(false)} />
                  <div className="absolute right-0 top-9 bg-white rounded-xl shadow-xl z-50 overflow-hidden" style={{ border: '1px solid #E2E8F0', minWidth: 180 }}>
                    {ANOMALY_TYPE_OPTIONS.map(opt => (
                      <div
                        key={opt}
                        className="px-3 py-2 cursor-pointer hover:bg-indigo-50 transition-colors"
                        style={{ fontSize: '12px', color: opt === anomalyTypeFilter ? '#4F46E5' : '#374151', background: opt === anomalyTypeFilter ? '#EEF2FF' : 'transparent' }}
                        onClick={() => { setAnomalyTypeFilter(opt); setTypeDropOpen(false); }}
                      >
                        {opt === anomalyTypeFilter && <span className="mr-1.5" style={{ color: '#6366F1' }}>✓</span>}{opt}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* Severity dropdown */}
            <div className="relative">
              <button
                onClick={() => { setSevDropOpen(o => !o); setTypeDropOpen(false); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
                style={{
                  border: `1px solid ${anomalySevFilter !== 'All Severity' ? '#6366F1' : '#E2E8F0'}`,
                  fontSize: '11px',
                  color: anomalySevFilter !== 'All Severity' ? '#4F46E5' : '#64748B',
                  background: anomalySevFilter !== 'All Severity' ? '#F5F3FF' : '#fff',
                }}
              >
                {anomalySevFilter === 'All Severity' ? 'Severity' : anomalySevFilter}
                <ChevronDown size={10} />
              </button>
              {sevDropOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSevDropOpen(false)} />
                  <div className="absolute right-0 top-9 bg-white rounded-xl shadow-xl z-50 overflow-hidden" style={{ border: '1px solid #E2E8F0', minWidth: 140 }}>
                    {ANOMALY_SEV_OPTIONS.map(opt => (
                      <div
                        key={opt}
                        className="px-3 py-2 cursor-pointer hover:bg-indigo-50 transition-colors capitalize"
                        style={{ fontSize: '12px', color: opt === anomalySevFilter ? '#4F46E5' : '#374151', background: opt === anomalySevFilter ? '#EEF2FF' : 'transparent' }}
                        onClick={() => { setAnomalySevFilter(opt); setSevDropOpen(false); }}
                      >
                        {opt === anomalySevFilter && <span className="mr-1.5" style={{ color: '#6366F1' }}>✓</span>}{opt}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <span className="px-2 py-1 rounded-full" style={{ background: '#FEF2F2', color: '#DC2626', fontSize: '11px' }}>
              {filteredAnomalies.length} active
            </span>
          </div>
        </div>

        {filteredAnomalies.length === 0 && (
          <div className="px-5 py-8 text-center text-slate-400" style={{ fontSize: '12px' }}>
            No anomalies match the current filters.
          </div>
        )}

        <div style={{ borderBottom: '1px solid #F1F5F9' }}>
          {filteredAnomalies.map((a, i) => {
            const sc = severityConfig[a.severity];
            const isOpen = selectedAnomalyId === a.id;
            return (
              <div key={a.id} style={{ borderTop: i === 0 ? 'none' : '1px solid #F8FAFC' }}>
                <button
                  onClick={() => setSelectedAnomalyId(isOpen ? null : a.id)}
                  className="w-full flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <span
                    className="px-2 py-0.5 rounded font-medium flex-shrink-0 mt-0.5"
                    style={{ background: sc.bg, color: sc.color, fontSize: '10px', border: `1px solid ${sc.border}` }}
                  >
                    {a.severity.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <span className="text-slate-700 font-medium" style={{ fontSize: '12px' }}>{a.type}</span>
                      <span className="text-slate-400 flex-shrink-0" style={{ fontSize: '11px' }}>{a.time}</span>
                    </div>
                    <div className="text-slate-500 mb-0.5" style={{ fontSize: '11px' }}>{a.detail}</div>
                    <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '10px' }}>
                      <span>{a.trip}</span><span>·</span><span>{a.vehicle}</span><span>·</span><span>{a.driver}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="mt-1 text-slate-400 transition-transform" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <TripAnomalyExpandedDetails anomaly={a} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Performance Analytics Table */}
      <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between p-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div className="text-slate-800 text-sm font-semibold">Driver Performance Analytics</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Overview of trips, distance covered, and delivery success metrics</div>
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
                {['#', 'Driver', 'Vehicle', 'Trips', 'Distance (km)', 'Attempts', 'Returns', 'Success Rate', 'Runtime'].map(h => (
                  <th key={h} className={`px-3 py-3 text-slate-400 font-medium ${['#', 'Driver', 'Vehicle'].includes(h) ? 'text-left' : 'text-right'}`} style={{ fontSize: '10px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...drivers].sort((a, b) => a.rank - b.rank).map(d => {
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
                    <td className="px-3 py-2.5 text-right text-slate-700 font-medium">{d.trips}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600">{d.distanceKm} km</td>
                    <td className="px-3 py-2.5 text-right text-slate-700">{d.attempts}</td>
                    <td className="px-3 py-2.5 text-right text-slate-500">{d.returns}</td>
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
                  <span className="text-slate-500 font-bold" style={{ fontSize: '11px' }}>
                    Summary: {drivers.reduce((s, d) => s + d.trips, 0)} trips · {drivers.reduce((s, d) => s + d.distanceKm, 0).toLocaleString()} km
                  </span>
                </td>
                <td colSpan={6} className="px-3 py-2.5 text-right">
                  <span className="text-slate-400" style={{ fontSize: '10px' }}>
                    Total Trips: {drivers.reduce((s, d) => s + d.trips, 0)} · Total Distance: {drivers.reduce((s, d) => s + d.distanceKm, 0).toLocaleString()} km
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function TripAnomalyExpandedDetails({ anomaly }: { anomaly: TripAnomaly }) {
  const sc = severityConfig[anomaly.severity];
  return (
    <div className="rounded-lg p-3" style={{ background: '#F8FAFC', border: `1px solid ${sc.border}` }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-md p-2.5" style={{ background: '#fff', border: '1px solid #E2E8F0' }}>
          <div className="text-slate-400 uppercase font-semibold" style={{ fontSize: '10px' }}>Operational Context</div>
          <p className="text-slate-600 mt-1" style={{ fontSize: '11px' }}>
            {anomaly.trip} reported {anomaly.type.toLowerCase()} with impact on route adherence and SLA compliance.
          </p>
        </div>
        <div className="rounded-md p-2.5" style={{ background: '#fff', border: '1px solid #E2E8F0' }}>
          <div className="text-slate-400 uppercase font-semibold" style={{ fontSize: '10px' }}>Recommended Action</div>
          <p className="text-slate-600 mt-1" style={{ fontSize: '11px' }}>
            Validate telemetry and driver notes, then escalate to branch operations if issue persists beyond 30 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
