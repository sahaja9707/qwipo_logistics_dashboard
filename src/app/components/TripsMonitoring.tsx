import { useState } from 'react';
import KPICard from './KPICard';
import TruckRoutesMap from './TruckRoutesMap';
import type { Role } from '../App';
import { Truck, MapPin, AlertTriangle, DollarSign, Clock, TrendingUp, TrendingDown, Zap, Leaf, Timer, Route, ChevronDown } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, ReferenceLine, ReferenceArea } from 'recharts';

const varianceData = [
  { route: 'Route A', planned: 120, actual: 134, variance: 14  },
  { route: 'Route B', planned: 95,  actual: 91,  variance: -4  },
  { route: 'Route C', planned: 140, actual: 152, variance: 12  },
  { route: 'Route D', planned: 110, actual: 108, variance: -2  },
  { route: 'Route E', planned: 85,  actual: 99,  variance: 14  },
  { route: 'Route F', planned: 130, actual: 127, variance: -3  },
];

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

const utilization = [
  { name: 'Vehicle Utilization', value: 84, color: '#6366F1', target: 90 },
  { name: 'Time Utilization', value: 76, color: '#0891B2', target: 85 },
  { name: 'Delivery Point Util.', value: 91, color: '#10B981', target: 90 },
];

// Trips lifecycle
const lifecycle = [
  { label: 'Completed', value: 92,  color: '#10B981', dot: '🟢' },
  { label: 'Delayed',   value: 11,  color: '#F59E0B', dot: '🟡' },
  { label: 'Cancelled', value: 4,   color: '#94A3B8', dot: '⚫' },
];
const totalTrips = lifecycle.reduce((s, x) => s + x.value, 0);

// Operational efficiency sparklines
const runtimeSpark  = [3.8, 4.1, 3.6, 4.4, 3.9, 3.5, 3.2, 3.2].map((v, i) => ({ i, v }));
const distanceSpark = [11200, 12400, 11800, 13600, 14100, 13800, 14500, 14820].map((v, i) => ({ i, v }));
const effSpark      = [91.2, 90.8, 92.1, 91.4, 93.0, 93.5, 93.2, 93.7].map((v, i) => ({ i, v }));

const ANOMALY_TYPE_OPTIONS = ['All Types', 'Runtime Exceeded', 'Route Deviation', 'SIM Card Changed', 'Underutilization Alert', 'Delivery Failure', 'Delay Alert'];
const ANOMALY_SEV_OPTIONS  = ['All Severity', 'high', 'medium', 'low'];

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
      <text x="50" y="57" textAnchor="middle" fill={isOnTarget ? '#059669' : '#D97706'} fontSize="8">{isOnTarget ? '✓ On target' : `Target: ${target}%`}</text>
    </svg>
  );
}

// Custom dot for runtime trend — color by over/under target
function RuntimeDot(props: { cx?: number; cy?: number; payload?: { avgRuntime: number; target: number } }) {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload) return null;
  const over = payload.avgRuntime > payload.target;
  return <circle cx={cx} cy={cy} r={4} fill={over ? '#EF4444' : '#10B981'} stroke="white" strokeWidth={1.5} />;
}

export default function TripsMonitoring({ role }: { role: Role }) {
  const showDeliveryCost = role !== 'admin_support';

  const [anomalyTypeFilter, setAnomalyTypeFilter] = useState('All Types');
  const [anomalySevFilter,  setAnomalySevFilter]  = useState('All Severity');
  const [typeDropOpen, setTypeDropOpen] = useState(false);
  const [sevDropOpen,  setSevDropOpen]  = useState(false);

  const filteredAnomalies = anomalies.filter(a => {
    const typeOk = anomalyTypeFilter === 'All Types'    || a.type     === anomalyTypeFilter;
    const sevOk  = anomalySevFilter  === 'All Severity' || a.severity === anomalySevFilter;
    return typeOk && sevOk;
  });

  return (
    <div className="space-y-4">
      {/* ── Trips Lifecycle Horizontal Stack ─────────────────────────── */}
      <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-slate-800 text-sm font-semibold">Trips Lifecycle</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Today's trip status breakdown — {totalTrips} total trips dispatched</div>
          </div>
          <span className="px-3 py-1 rounded-full font-bold" style={{ background: '#EEF2FF', color: '#6366F1', fontSize: '13px' }}>
            {totalTrips} trips
          </span>
        </div>

        {/* Stacked bar */}
        <div className="flex rounded-lg overflow-hidden mb-4" style={{ height: 28 }}>
          {lifecycle.map(seg => (
            <div
              key={seg.label}
              className="flex items-center justify-center transition-all"
              style={{
                width: `${(seg.value / totalTrips) * 100}%`,
                background: seg.color,
                minWidth: seg.value > 0 ? 8 : 0,
              }}
              title={`${seg.label}: ${seg.value} (${((seg.value / totalTrips) * 100).toFixed(0)}%)`}
            />
          ))}
        </div>

        {/* Legend row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {lifecycle.map(seg => (
            <div
              key={seg.label}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: `${seg.color}10`, border: `1px solid ${seg.color}30` }}
            >
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: seg.color }} />
              <div>
                <div className="font-bold" style={{ fontSize: '18px', color: seg.color, lineHeight: 1 }}>{seg.value}</div>
                <div className="text-slate-500 mt-0.5" style={{ fontSize: '11px' }}>{seg.label}</div>
                <div style={{ fontSize: '10px', color: seg.color, opacity: 0.7 }}>
                  {((seg.value / totalTrips) * 100).toFixed(0)}% of total
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Operational Efficiency Panel ─────────────────────────────── */}
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

        {/* Live Distance */}
        <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col" style={{ border: '1px solid #E2E8F0', borderLeftWidth: 3, borderLeftColor: '#0891B2' }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: '#0891B215' }}>
                <MapPin size={14} style={{ color: '#0891B2' }} />
              </div>
              <span className="text-slate-500" style={{ fontSize: '11px' }}>Live Distance</span>
            </div>
            <span className="flex items-center gap-0.5 font-medium" style={{ fontSize: '11px', color: '#10B981' }}>
              <TrendingUp size={11} />4.2%
            </span>
          </div>
          <div className="font-bold text-slate-800 mt-1 mb-0.5" style={{ fontSize: '1.6rem', lineHeight: 1 }}>14,820 <span style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>km</span></div>
          <div className="text-slate-400 mb-3" style={{ fontSize: '10px' }}>Actual travelled today</div>
          <div className="flex-1" style={{ minHeight: 44 }}>
            <ResponsiveContainer width="100%" height={44}>
              <AreaChart id="trips-distance-spark" data={distanceSpark} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
                <Area type="monotone" dataKey="v" stroke="#0891B2" strokeWidth={1.5} fill="#0891B2" fillOpacity={0.12} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-1" style={{ fontSize: '9px', color: '#CBD5E1' }}>
            <span>May 10</span><span>May 17</span>
          </div>
        </div>

        {/* Route Efficiency */}
        <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col" style={{ border: '1px solid #E2E8F0', borderLeftWidth: 3, borderLeftColor: '#059669' }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: '#05966915' }}>
                <Truck size={14} style={{ color: '#059669' }} />
              </div>
              <span className="text-slate-500" style={{ fontSize: '11px' }}>Route Efficiency</span>
            </div>
            <span className="flex items-center gap-0.5 font-medium" style={{ fontSize: '11px', color: '#10B981' }}>
              <TrendingUp size={11} />1.3%
            </span>
          </div>
          <div className="font-bold text-slate-800 mt-1 mb-0.5" style={{ fontSize: '1.6rem', lineHeight: 1 }}>93.7 <span style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>%</span></div>
          <div className="text-slate-400 mb-3" style={{ fontSize: '10px' }}>Route optimisation score</div>
          <div className="flex-1" style={{ minHeight: 44 }}>
            <ResponsiveContainer width="100%" height={44}>
              <AreaChart id="trips-eff-spark" data={effSpark} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
                <Area type="monotone" dataKey="v" stroke="#059669" strokeWidth={1.5} fill="#059669" fillOpacity={0.12} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-1" style={{ fontSize: '9px', color: '#CBD5E1' }}>
            <span>May 10</span><span>May 17</span>
          </div>
        </div>
      </div>

      {/* ── Remaining standalone KPIs ─────────────────────────────────── */}
      <div className={`grid gap-3 ${showDeliveryCost ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {showDeliveryCost && (
          <KPICard title="Delivery Cost" value="₹3.8L" icon={DollarSign} trend={{ value: 2.1, isPositive: false }} subtitle="Today" accentColor="#F59E0B" />
        )}
        <KPICard title="Total Delivery Stops" value="4,218" icon={MapPin} trend={{ value: 4.8, isPositive: true }} subtitle="Stops covered today" accentColor="#8B5CF6" />
        <KPICard title="Anomalies" value="6" icon={AlertTriangle} trend={{ value: 1, isPositive: false }} subtitle="Needs review" accentColor="#EF4444" />
      </div>

      {/* ── Interactive Route Map ─────────────────────────────────────── */}
      <TruckRoutesMap />

      {/* ── Digital vs Manual Routing Savings ────────────────────────── */}
      <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-slate-800 text-sm font-semibold">Digital Routing vs Manual Distribution</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>
              Time &amp; cost savings from AI-optimised routing against traditional manual planning — May 2026
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: '#ECFDF5', border: '1px solid #6EE7B7' }}>
            <Zap size={12} style={{ color: '#059669' }} />
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Qwipo AI Active</span>
          </div>
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              icon: Timer,
              label: 'Planning Time',
              manual: '3–4 hrs/day',
              digital: '8 min/day',
              saving: '95% faster',
              color: '#6366F1',
              bg: '#EEF2FF',
            },
            {
              icon: Route,
              label: 'Avg Route Distance',
              manual: '148 km/trip',
              digital: '122 km/trip',
              saving: '−26 km saved',
              color: '#0891B2',
              bg: '#F0F9FF',
            },
            {
              icon: DollarSign,
              label: 'Fuel Cost / Day',
              manual: '₹5.4L/day',
              digital: '₹3.8L/day',
              saving: '₹1.6L saved',
              color: '#059669',
              bg: '#ECFDF5',
            },
            {
              icon: Leaf,
              label: 'CO₂ Emissions',
              manual: '2,840 kg/day',
              digital: '2,180 kg/day',
              saving: '−23% emissions',
              color: '#16A34A',
              bg: '#F0FDF4',
            },
          ].map(item => (
            <div
              key={item.label}
              className="rounded-xl p-4 flex flex-col gap-2"
              style={{ background: item.bg, border: `1px solid ${item.color}20` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-white">
                  <item.icon size={13} style={{ color: item.color }} />
                </div>
                <span className="text-slate-500 font-medium" style={{ fontSize: '11px' }}>{item.label}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400" style={{ fontSize: '10px' }}>Manual</span>
                  <span className="text-slate-600 font-medium line-through" style={{ fontSize: '11px' }}>{item.manual}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400" style={{ fontSize: '10px' }}>Digital</span>
                  <span className="font-bold" style={{ fontSize: '11px', color: item.color }}>{item.digital}</span>
                </div>
              </div>
              <div
                className="mt-auto text-center rounded-lg py-1 font-semibold"
                style={{ background: item.color, color: '#fff', fontSize: '10px' }}
              >
                {item.saving}
              </div>
            </div>
          ))}
        </div>

        {/* Monthly savings bar comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="text-slate-600 font-medium mb-3" style={{ fontSize: '12px' }}>Monthly Cost Comparison (₹L)</div>
            <div className="space-y-3">
              {[
                { label: 'Fuel & Vehicle Op.', manual: 162, digital: 114, unit: '₹L' },
                { label: 'Driver Overtime',    manual: 38,  digital: 12,  unit: '₹L' },
                { label: 'Missed Deliveries',  manual: 24,  digital: 6,   unit: '₹L' },
                { label: 'Admin / Planning',   manual: 18,  digital: 3,   unit: '₹L' },
              ].map(row => {
                const maxVal = 180;
                return (
                  <div key={row.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-500" style={{ fontSize: '10px' }}>{row.label}</span>
                      <span style={{ fontSize: '10px', color: '#059669', fontWeight: 600 }}>
                        −₹{row.manual - row.digital}L saved
                      </span>
                    </div>
                    <div className="relative" style={{ height: 16 }}>
                      {/* Manual bar (background) */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-r-sm"
                        style={{ width: `${(row.manual / maxVal) * 100}%`, background: '#FEE2E2' }}
                      />
                      {/* Digital bar (foreground) */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-r-sm"
                        style={{ width: `${(row.digital / maxVal) * 100}%`, background: '#6366F1' }}
                      />
                      <div className="absolute inset-y-0 flex items-center" style={{ left: `${(row.manual / maxVal) * 100 + 1}%` }}>
                        <span className="text-slate-400" style={{ fontSize: '9px' }}>₹{row.manual}L</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3" style={{ fontSize: '10px', color: '#94A3B8' }}>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-2 rounded-sm" style={{ background: '#FEE2E2' }} /> Manual</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-2 rounded-sm" style={{ background: '#6366F1' }} /> Digital (Qwipo)</span>
            </div>
          </div>

          {/* Monthly summary scorecard */}
          <div className="rounded-xl p-5" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #4338CA 100%)' }}>
            <div className="text-white font-semibold mb-1" style={{ fontSize: '13px' }}>Monthly Savings Summary</div>
            <div className="mb-4" style={{ fontSize: '11px', color: '#A5B4FC' }}>Cumulative gains from Qwipo digital routing</div>
            <div className="space-y-3">
              {[
                { label: 'Total Cost Saved',       value: '₹68.4L',   sub: 'vs manual planning baseline' },
                { label: 'Hours Saved (Planning)', value: '1,890 hrs', sub: '63 trips/day × 30 days' },
                { label: 'KM Reduction',           value: '48,360 km', sub: '26 km/trip avg saving' },
                { label: 'On-Time Delivery Rate',  value: '+18.4%',    sub: 'from 74.3% → 92.7%' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <div className="text-white font-semibold" style={{ fontSize: '13px' }}>{item.value}</div>
                    <div style={{ fontSize: '10px', color: '#A5B4FC' }}>{item.label}</div>
                  </div>
                  <div className="text-right" style={{ fontSize: '10px', color: '#818CF8' }}>{item.sub}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center rounded-lg py-2" style={{ background: 'rgba(99,102,241,0.4)', fontSize: '11px', color: '#E0E7FF' }}>
              ROI: <span className="font-bold text-white">3.2× return</span> vs Qwipo subscription cost
            </div>
          </div>
        </div>
      </div>

      {/* Gauge Charts — Utilization Overview */}
      <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="text-slate-800 text-sm font-semibold mb-0.5">Utilization Overview</div>
        <div className="text-slate-400 mb-5" style={{ fontSize: '11px' }}>Vehicle, time, and delivery point efficiency gauges</div>
        <div className="grid grid-cols-3 gap-4">
          {utilization.map(u => (
            <div key={u.name} className="flex flex-col items-center gap-1">
              <GaugeChart value={u.value} color={u.color} target={u.target} />
              <span className="text-slate-600 text-center" style={{ fontSize: '11px' }}>{u.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Planned vs Live Distance Bar Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-slate-800 text-sm font-semibold">Planned vs Live Distance</div>
              <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Actual − Planned km · red = over, green = under</div>
            </div>
            <div className="flex items-center gap-3" style={{ fontSize: '11px', color: '#94A3B8' }}>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded inline-block" style={{ background: '#EF4444' }} /> Over</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded inline-block" style={{ background: '#10B981' }} /> Under</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart id="trips-variance-bar" data={varianceData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="route" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} unit=" km" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }}
                formatter={(val: number, _name: string, props: { payload?: { planned?: number; actual?: number } }) => [
                  `${val > 0 ? '+' : ''}${val} km (Planned: ${props.payload?.planned}, Actual: ${props.payload?.actual})`,
                  'Variance',
                ]}
              />
              <ReferenceLine y={0} stroke="#CBD5E1" strokeWidth={1.5} />
              <Bar dataKey="variance" radius={[3, 3, 0, 0]} name="Variance (km)" isAnimationActive={false}>
                {varianceData.map((entry) => (
                  <Cell key={`var-cell-${entry.route}`} fill={entry.variance > 0 ? '#EF4444' : '#10B981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trips Trend */}
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
      </div>

      {/* Runtime Trend — Enhanced visualization */}
      <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-slate-800 text-sm font-semibold">Runtime Trend</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Average trip runtime vs 4h target — last 8 days · green = on target, red = exceeded</div>
          </div>
          <div className="flex items-center gap-3" style={{ fontSize: '11px', color: '#94A3B8' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#10B981' }} /> Under target
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#EF4444' }} /> Over target
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 border-t-2 border-dashed" style={{ borderColor: '#94A3B8' }} /> Target (4h)
            </span>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-2 mb-4">
          {(() => {
            const overCount  = runtimeTrend.filter(d => d.avgRuntime > d.target).length;
            const underCount = runtimeTrend.length - overCount;
            const avgRuntime = (runtimeTrend.reduce((s, d) => s + d.avgRuntime, 0) / runtimeTrend.length).toFixed(2);
            return (
              <>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                  {overCount} day{overCount !== 1 ? 's' : ''} over target
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#ECFDF5', color: '#059669' }}>
                  {underCount} day{underCount !== 1 ? 's' : ''} under target
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#EEF2FF', color: '#6366F1' }}>
                  Avg: {avgRuntime}h
                </span>
              </>
            );
          })()}
        </div>

        <ResponsiveContainer width="100%" height={220}>
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
            {/* Avg runtime line with color-coded dots */}
            <Line
              type="monotone"
              dataKey="avgRuntime"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              dot={<RuntimeDot />}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="Avg Runtime"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Per-day mini summary */}
        <div className="grid mt-4 pt-3" style={{ borderTop: '1px solid #F1F5F9', gridTemplateColumns: `repeat(${runtimeTrend.length}, 1fr)`, gap: 4 }}>
          {runtimeTrend.map(d => {
            const over = d.avgRuntime > d.target;
            return (
              <div key={d.date} className="flex flex-col items-center gap-0.5">
                <span
                  className="font-bold"
                  style={{ fontSize: '11px', color: over ? '#DC2626' : '#059669' }}
                >
                  {d.avgRuntime}h
                </span>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: over ? '#FEF2F2' : '#ECFDF5' }}
                >
                  <span style={{ fontSize: '9px' }}>{over ? '↑' : '✓'}</span>
                </div>
                <span style={{ fontSize: '9px', color: '#94A3B8' }}>{d.date.replace('May ', '')}</span>
              </div>
            );
          })}
        </div>
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
            return (
              <div
                key={a.id}
                className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors"
                style={{ borderTop: i === 0 ? 'none' : '1px solid #F8FAFC' }}
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
