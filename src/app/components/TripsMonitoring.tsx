import { useState, useMemo } from 'react';
import KPICard from './KPICard';
import type { Role } from '../App';
import { getFilteredDrivers, getSnapshotForFilters, type GlobalFilters } from '../data/filterData';
import { Truck, MapPin, DollarSign, Clock, TrendingDown, Award } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ReferenceLine
} from 'recharts';

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

// Trips + avg vehicles used — simple chart (Image 2 replacement)
const tripsVehicleWeekly = [
  { day: 'Mon', trips: 48, avgVehicles: 82 },
  { day: 'Tue', trips: 52, avgVehicles: 88 },
  { day: 'Wed', trips: 51, avgVehicles: 85 },
  { day: 'Thu', trips: 61, avgVehicles: 94 },
  { day: 'Fri', trips: 59, avgVehicles: 96 },
  { day: 'Sat', trips: 38, avgVehicles: 74 },
  { day: 'Sun', trips: 22, avgVehicles: 42 },
];

const tripsVehicleMonthly = [
  { week: 'W1 Apr', trips: 220, avgVehicles: 84 },
  { week: 'W2 Apr', trips: 248, avgVehicles: 89 },
  { week: 'W3 Apr', trips: 261, avgVehicles: 91 },
  { week: 'W4 Apr', trips: 204, avgVehicles: 79 },
  { week: 'W1 May', trips: 242, avgVehicles: 88 },
  { week: 'W2 May', trips: 271, avgVehicles: 93 },
  { week: 'W3 May', trips: 239, avgVehicles: 87 },
];

// Trip lifecycle
const lifecycle = [
  { label: 'Planned',     value: 18,  color: '#6366F1' },
  { label: 'In Progress', value: 14,  color: '#F59E0B' },
  { label: 'Completed',   value: 92,  color: '#10B981' },
  { label: 'Cancelled',   value: 4,   color: '#94A3B8' },
];
const totalTripsLifecycle = lifecycle.reduce((s, x) => s + x.value, 0);

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
  const [tripsVehicleView, setTripsVehicleView] = useState<'weekly' | 'monthly'>('weekly');

  const snap = useMemo(() => getSnapshotForFilters(filters), [filters]);

  const utilizationMetrics = useMemo(() => [
    { name: 'Vehicle Utilization', value: snap.vehicleUtil, color: '#6366F1', target: 90, key: 'vehicleUtil' },
    { name: 'Time Utilization', value: snap.timeUtil, color: '#0891B2', target: 85, key: 'timeUtil' },
    { name: 'Delivery Point Util.', value: snap.dpUtil, color: '#10B981', target: 90, key: 'dpUtil' },
  ], [snap]);

  const drivers = useMemo(() => getFilteredDrivers(filters), [filters]);
  const totalKm = drivers.reduce((s, d) => s + d.distanceKm, 0);
  const totalDriverTrips = drivers.reduce((s, d) => s + d.trips, 0);

  const vehicleData = tripsVehicleView === 'weekly' ? tripsVehicleWeekly : tripsVehicleMonthly;
  const xKey = tripsVehicleView === 'weekly' ? 'day' : 'week';

  return (
    <div className="space-y-4">

      {/* ── TRIPS SECTION ─────────────────────────────────────────────────────── */}

      {/* 4 Trip Lifecycle Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {lifecycle.map(seg => (
          <div key={seg.label} className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #E2E8F0', borderTop: `3px solid ${seg.color}` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 font-medium" style={{ fontSize: '11px' }}>{seg.label}</span>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
            </div>
            <div className="font-extrabold text-slate-800" style={{ fontSize: '2rem', lineHeight: 1 }}>{seg.value}</div>
            <div style={{ fontSize: '10px', color: seg.color, marginTop: 4 }}>
              {((seg.value / totalTripsLifecycle) * 100).toFixed(0)}% of {totalTripsLifecycle} total
            </div>
            <div className="w-full rounded-full mt-3" style={{ height: 4, background: '#F1F5F9', overflow: 'hidden' }}>
              <div className="h-full rounded-full" style={{ width: `${(seg.value / totalTripsLifecycle) * 100}%`, background: seg.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Trips Trend */}
      <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="text-slate-800 text-sm font-semibold mb-0.5">Trips Trend</div>
        <div className="text-slate-400 mb-3" style={{ fontSize: '11px' }}>Daily dispatched vs completed</div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart id="trips-trend-line" data={tripsTrend} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[30, 70]} />
            <Tooltip contentStyle={{ borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 10, padding: '4px 8px' }} />
            <Line type="monotone" dataKey="trips" stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Dispatched" isAnimationActive={false} />
            <Line type="monotone" dataKey="completed" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', r: 3 }} name="Completed" isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Avg Runtime — full row */}
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
        <div className="flex items-end justify-between">
          <div>
            <div className="font-bold text-slate-800 mt-1 mb-0.5" style={{ fontSize: '1.6rem', lineHeight: 1 }}>3.2 <span style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>hrs</span></div>
            <div className="text-slate-400" style={{ fontSize: '10px' }}>Per trip · target ≤ 4h</div>
          </div>
          <div style={{ width: 200 }}>
            <ResponsiveContainer width="100%" height={44}>
              <AreaChart id="trips-runtime-spark" data={runtimeSpark} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
                <Area type="monotone" dataKey="v" stroke="#8B5CF6" strokeWidth={1.5} fill="#8B5CF6" fillOpacity={0.12} dot={false} isAnimationActive={false} />
                <ReferenceLine y={4.0} stroke="#CBD5E1" strokeDasharray="3 2" strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── VEHICLES SECTION ──────────────────────────────────────────────────── */}

      {/* Fleet Utilization + Delivery Cost side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fleet Utilization Gauges */}
        <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
          <div className="text-slate-800 text-sm font-semibold mb-0.5">Fleet Utilization</div>
          <div className="text-slate-400 mb-4" style={{ fontSize: '11px' }}>Vehicle · time · delivery point efficiency against targets</div>
          <div className="grid grid-cols-3 gap-4">
            {utilizationMetrics.map(u => (
              <div key={u.name} className="flex flex-col items-center gap-1">
                <GaugeChart value={u.value} color={u.color} target={u.target} />
                <span className="text-slate-600 text-center font-medium" style={{ fontSize: '11px' }}>{u.name}</span>
                {u.key === 'vehicleUtil' && (
                  <span className="text-slate-500 font-bold" style={{ fontSize: '10.5px' }}>
                    {snap.avgVehicles} vehicles
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Delivery Cost KPI (role-gated) + Total Delivery Stops stacked */}
        <div className="flex flex-col gap-4">
          {showDeliveryCost ? (
            <>
              <KPICard title="Delivery Cost" value={`₹${(snap.invoiceValueNum * 0.087).toFixed(1)}L`} icon={DollarSign} trend={{ value: 2.1, isPositive: false }} subtitle="Logistics cost this week" accentColor="#D97706" />
              <KPICard title="Total Delivery Stops" value="4,218" icon={MapPin} trend={{ value: 4.8, isPositive: true }} subtitle="Stops covered today" accentColor="#8B5CF6" />
            </>
          ) : (
            <KPICard title="Total Delivery Stops" value="4,218" icon={MapPin} trend={{ value: 4.8, isPositive: true }} subtitle="Stops covered today" accentColor="#8B5CF6" />
          )}
        </div>
      </div>

      {/* Trips per Day — clean single-metric chart */}
      <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-slate-800 text-sm font-semibold">Trips per Day</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Daily trip volume for the selected period</div>
          </div>
          <div className="flex items-center gap-5">
            {/* Inline stats — Total Trips + Avg */}
            <div className="text-right">
              <div className="font-extrabold text-slate-800" style={{ fontSize: '1.3rem', lineHeight: 1 }}>
                {vehicleData.reduce((s, d) => s + d.trips, 0)}
              </div>
              <div className="text-slate-400" style={{ fontSize: '10px' }}>Total trips</div>
            </div>
            <div className="w-px bg-slate-200" style={{ height: 32 }} />
            <div className="text-right">
              <div className="font-extrabold" style={{ fontSize: '1.3rem', lineHeight: 1, color: '#6366F1' }}>
                {Math.round(vehicleData.reduce((s, d) => s + d.trips, 0) / vehicleData.length)}
              </div>
              <div className="text-slate-400" style={{ fontSize: '10px' }}>Avg / day</div>
            </div>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
              {(['weekly', 'monthly'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setTripsVehicleView(v)}
                  className="px-3 py-1.5 transition-colors"
                  style={{
                    background: tripsVehicleView === v ? '#6366F1' : '#fff',
                    color: tripsVehicleView === v ? '#fff' : '#64748B',
                    fontSize: '11px',
                  }}
                >
                  {v === 'weekly' ? 'This Week' : 'Monthly'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <BarChart id="trips-per-day-chart" data={vehicleData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#CBD5E1' }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: '#F8FAFC', radius: 6 }}
              contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 11, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              formatter={(value: number) => [value, 'Trips']}
            />
            <Bar dataKey="trips" radius={[5, 5, 0, 0]} name="Trips" isAnimationActive={false}>
              {vehicleData.map((entry, i) => {
                const max = Math.max(...vehicleData.map(d => d.trips));
                const ratio = entry.trips / max;
                const fill = ratio >= 0.9 ? '#4F46E5' : ratio >= 0.7 ? '#6366F1' : ratio >= 0.5 ? '#818CF8' : '#A5B4FC';
                return <Cell key={`trip-bar-${i}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Bottom legend: lightest to darkest = fewer to more trips */}
        <div className="flex items-center justify-end gap-4 mt-3" style={{ fontSize: '10px', color: '#94A3B8' }}>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block" style={{ background: '#A5B4FC' }} /> Low</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block" style={{ background: '#818CF8' }} /> Mid</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block" style={{ background: '#4F46E5' }} /> Peak</span>
        </div>
      </div>

      {/* ── DRIVERS SECTION ───────────────────────────────────────────────────── */}

      {/* Driver Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #E2E8F0', borderTop: '3px solid #6366F1' }}>
          <div className="text-slate-500 font-medium mb-1" style={{ fontSize: '11px' }}>Total Drivers</div>
          <div className="font-extrabold text-slate-800" style={{ fontSize: '2rem', lineHeight: 1 }}>{drivers.length}</div>
          <div className="text-slate-400 mt-1" style={{ fontSize: '10px' }}>Active this period</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #E2E8F0', borderTop: '3px solid #10B981' }}>
          <div className="text-slate-500 font-medium mb-1" style={{ fontSize: '11px' }}>Total Trips</div>
          <div className="font-extrabold text-slate-800" style={{ fontSize: '2rem', lineHeight: 1 }}>{totalDriverTrips}</div>
          <div className="text-slate-400 mt-1" style={{ fontSize: '10px' }}>{drivers.length > 0 ? Math.round(totalDriverTrips / drivers.length) : 0} avg per driver</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #E2E8F0', borderTop: '3px solid #0891B2' }}>
          <div className="text-slate-500 font-medium mb-1" style={{ fontSize: '11px' }}>Total Distance</div>
          <div className="font-extrabold text-slate-800" style={{ fontSize: '2rem', lineHeight: 1 }}>{totalKm.toLocaleString()}<span style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}> km</span></div>
          <div className="text-slate-400 mt-1" style={{ fontSize: '10px' }}>{drivers.length > 0 ? Math.round(totalKm / drivers.length) : 0} avg km/driver</div>
        </div>
      </div>

      {/* Driver Performance Table */}
      <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between p-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div className="text-slate-800 text-sm font-semibold">Driver Performance Analytics</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Overview of trips, distance covered, and delivery success metrics</div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: '#FFFBEB', fontSize: '11px', color: '#D97706' }}>
            <Award size={12} /> Top performers
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
              {[...drivers].sort((a, b) => a.rank - b.rank).map(d => (
                <tr
                  key={d.rank}
                  style={{ borderTop: '1px solid #F1F5F9' }}
                  className="hover:brightness-[0.97] transition-all"
                >
                  <td className="px-3 py-2.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold" style={{ background: d.rank <= 3 ? '#FEF3C7' : '#F1F5F9', color: d.rank <= 3 ? '#D97706' : '#64748B', fontSize: '10px' }}>
                      {d.rank}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-slate-700 font-medium">{d.name}</span>
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
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#F8FAFC', borderTop: '2px solid #E2E8F0' }}>
                <td colSpan={3} className="px-3 py-2.5">
                  <span className="text-slate-500 font-bold" style={{ fontSize: '11px' }}>
                    Summary: {totalDriverTrips} trips · {totalKm.toLocaleString()} km
                  </span>
                </td>
                <td colSpan={6} className="px-3 py-2.5 text-right">
                  <span className="text-slate-400" style={{ fontSize: '10px' }}>
                    {drivers.length} drivers · avg {drivers.length > 0 ? Math.round(totalKm / drivers.length) : 0} km/driver
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
