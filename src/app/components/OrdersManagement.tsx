import { useState, useMemo } from 'react';
import KPICard from './KPICard';
import type { Role } from '../App';
import type { GlobalFilters } from '../data/filterData';
import { getSnapshotForFilters, getAgingHeatmapData, getOrderTrend } from '../data/filterData';
import { ShoppingCart, DollarSign, XCircle, AlertTriangle, Users, TrendingDown, ChevronRight, X, AlertOctagon, Clock, MapPin, TrendingUp, Zap, RefreshCw, RotateCcw, ChevronDown } from 'lucide-react';
import {
  PieChart, Pie, Cell, ComposedChart, Line, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const anomalies = [
  {
    id: 'ANO-0041',
    title: 'Critical D4+ Aging — DIS-HYD-004',
    type: 'Delivery Aging',
    severity: 'critical',
    distributor: 'DIS-HYD-004',
    time: '8 min ago',
    estimatedLoss: '₹2.1L',
    source: 'Delivery Aging Monitor',
    operationalImpact: '14 orders stuck at D4+ with no retry scheduled. Customer churn risk high.',
    recommendedAction: 'Reassign to available driver; escalate to branch manager for priority re-dispatch.',
    details: 'Orders at DIS-HYD-004 have breached the D4+ aging threshold. Cumulative invoice value at risk: ₹2.1L. Common pattern: morning route cancellations not re-queued.',
  },
  {
    id: 'ANO-0040',
    title: 'High Return Rate — DIS-MUM-012',
    type: 'Return Rate',
    severity: 'high',
    distributor: 'DIS-MUM-012',
    time: '23 min ago',
    estimatedLoss: '₹84K',
    source: 'Returns Analytics Engine',
    operationalImpact: 'Return rate at 18.1%, threshold 12%. Repeated offenders identified.',
    recommendedAction: 'Review delivery attempt logs; schedule driver coaching; enable mandatory photo confirmation.',
    details: 'Top driver: Vikram Nair with 16.7% returns on 30 delivery attempts this week. Pattern: customer unreachable in evening slots.',
  },
  {
    id: 'ANO-0039',
    title: 'Cancelled Spike — DIS-BAN-007',
    type: 'Order Spike',
    severity: 'medium',
    distributor: 'DIS-BAN-007',
    time: '1h 10m ago',
    estimatedLoss: '₹31K',
    source: 'Order Status Watchdog',
    operationalImpact: '9 orders cancelled in morning window vs daily avg of 2. SLA at risk.',
    recommendedAction: 'Investigate order cancellation reasons; engage customers with rescheduling offer.',
    details: 'Cancellations concentrated between 9–11 AM. Likely cause: delivery window mismatch with customer availability.',
  },
  {
    id: 'ANO-0038',
    title: 'Runtime Exceeded — TRP-3847',
    type: 'Trip Anomaly',
    severity: 'medium',
    distributor: 'DIS-KRN-001',
    time: '2h 30m ago',
    estimatedLoss: '₹18K',
    source: 'Trip Monitor',
    operationalImpact: 'Trip exceeded 6h planned window by 2.4 hrs. Fuel and overtime cost overrun.',
    recommendedAction: 'Review route optimization; check if detours were authorized; adjust future trip windows.',
    details: 'Route: Kompally → Secunderabad. Cause: unplanned road diversion and 3 failed delivery attempts causing backtracking.',
  },
  {
    id: 'ANO-0037',
    title: 'SIM Tamper Alert — MH-04-T-3312',
    type: 'Security',
    severity: 'critical',
    distributor: 'DIS-CHN-003',
    time: '3h 05m ago',
    estimatedLoss: '₹0 (flagged)',
    source: 'Vehicle Telemetry',
    operationalImpact: 'Vehicle halted mid-trip. 8 deliveries pending. Customer SLA breach imminent.',
    recommendedAction: 'Halt vehicle; dispatch supervisor; transfer pending load to backup vehicle.',
    details: 'SIM card swap detected on vehicle TS-09-T-3312 during active trip. GPS signal briefly lost. Incident reported to compliance team.',
  },
];

function heatColor(value: number, heatMax: number): { bg: string; text: string } {
  const ratio = value / (heatMax || 1);
  if (ratio < 0.1) return { bg: '#ECFDF5', text: '#065F46' };
  if (ratio < 0.25) return { bg: '#D1FAE5', text: '#065F46' };
  if (ratio < 0.45) return { bg: '#FEF9C3', text: '#713F12' };
  if (ratio < 0.65) return { bg: '#FED7AA', text: '#7C2D12' };
  if (ratio < 0.82) return { bg: '#FECACA', text: '#7F1D1D' };
  return { bg: '#EF4444', text: '#fff' };
}

const severityConfig = {
  critical: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'Critical', dot: '#EF4444' },
  high:     { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'High',     dot: '#F59E0B' },
  medium:   { color: '#0891B2', bg: '#F0F9FF', border: '#BAE6FD', label: 'Medium',   dot: '#38BDF8' },
};

type Anomaly = typeof anomalies[0];

function AnomalyDetailPanel({ anomaly, onClose }: { anomaly: Anomaly; onClose: () => void }) {
  const sc = severityConfig[anomaly.severity as keyof typeof severityConfig];
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: `1.5px solid ${sc.border}` }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ background: sc.bg, borderBottom: `1px solid ${sc.border}` }}>
        <div className="flex items-center gap-2.5">
          <AlertOctagon size={15} style={{ color: sc.color }} />
          <span className="font-semibold" style={{ fontSize: '13px', color: sc.color }}>{anomaly.title}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: sc.color, color: '#fff' }}>{sc.label}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/60 text-slate-400 transition-colors"><X size={15} /></button>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: key details */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin,      label: 'Distributor',      value: anomaly.distributor },
              { icon: Clock,       label: 'Detected',         value: anomaly.time },
              { icon: TrendingDown, label: 'Est. Financial Loss', value: anomaly.estimatedLoss },
              { icon: Zap,         label: 'Source',           value: anomaly.source },
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

        {/* Right: analysis + action */}
        <div className="space-y-3">
          <div className="rounded-lg p-3" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <TrendingUp size={11} style={{ color: '#6366F1' }} />
              <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details & Root Cause</span>
            </div>
            <p className="text-slate-600 leading-relaxed" style={{ fontSize: '12px' }}>{anomaly.details}</p>
          </div>

          <div className="rounded-lg p-3" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <ChevronRight size={11} style={{ color: '#059669' }} />
              <span style={{ fontSize: '10px', color: '#059669', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended Action</span>
            </div>
            <p className="text-emerald-800 leading-relaxed" style={{ fontSize: '12px' }}>{anomaly.recommendedAction}</p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              className="flex-1 py-2 rounded-lg font-medium text-white transition-colors"
              style={{ background: sc.color, fontSize: '12px' }}
            >
              Escalate
            </button>
            <button
              className="flex-1 py-2 rounded-lg font-medium transition-colors"
              style={{ background: '#F1F5F9', color: '#475569', fontSize: '12px' }}
            >
              Mark Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ANOMALY_TYPE_OPTIONS = ['All Types', 'Delivery Aging', 'Return Rate', 'Order Spike', 'Trip Anomaly', 'Security'];
const ANOMALY_SEV_OPTIONS  = ['All Severity', 'critical', 'high', 'medium'];

export default function OrdersManagement({ role, filters }: { role: Role; filters: GlobalFilters }) {
  const showFinancial = role !== 'admin_support';

  const snap = useMemo(() => getSnapshotForFilters(filters), [filters]);
  const orderTrend = useMemo(() => getOrderTrend(filters), [filters]);
  const { codes: heatCodes, rows: heatRows } = useMemo(() => getAgingHeatmapData(filters), [filters]);

  const orderStatus = useMemo(() => [
    { name: 'Delivered',     value: snap.fulfilledOrders,                                                                 color: '#10B981' },
    { name: 'In Planning',   value: snap.pendingOrders,                                                                   color: '#6366F1' },
    { name: 'Returned',      value: snap.returnedOrders,                                                                  color: '#F59E0B' },
    { name: 'Partial Return',value: Math.round(snap.returnedOrders * 0.41),                                               color: '#FB923C' },
    { name: 'Cancelled',     value: snap.cancelledOrders,                                                                 color: '#EF4444' },
  ], [snap]);

  const totalOrders = orderStatus.reduce((s, x) => s + x.value, 0);

  const allHeatValues = heatRows.flatMap(r => Object.values(r.values));
  const heatMax = Math.max(...allHeatValues, 1);

  // Anomaly filters (dropdown-style like trips page)
  const [anomalyTypeFilter, setAnomalyTypeFilter] = useState('All Types');
  const [anomalySevFilter,  setAnomalySevFilter]  = useState('All Severity');
  const [typeDropOpen, setTypeDropOpen] = useState(false);
  const [sevDropOpen,  setSevDropOpen]  = useState(false);

  const filteredAnomalies = useMemo(() => {
    let result = filters.distributor
      ? anomalies.filter(a => a.distributor === filters.distributor)
      : anomalies;
    if (anomalyTypeFilter !== 'All Types')    result = result.filter(a => a.type === anomalyTypeFilter);
    if (anomalySevFilter  !== 'All Severity') result = result.filter(a => a.severity === anomalySevFilter);
    return result;
  }, [filters.distributor, anomalyTypeFilter, anomalySevFilter]);

  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  // Trend domain helpers
  const maxOrders   = Math.max(...orderTrend.map(d => d.orders),   1);
  const maxPrice    = Math.max(...orderTrend.map(d => d.totalPrice),1);
  const trendMinO   = Math.max(0, Math.round(Math.min(...orderTrend.map(d => d.orders))   * 0.85));
  const trendMinP   = Math.max(0, Math.round(Math.min(...orderTrend.map(d => d.totalPrice)) * 0.85 * 10) / 10);

  // Returned sub-cards
  const retDeliveryRetry = Math.round(snap.returnedOrders * 0.35);
  const retCancelled     = snap.returnedOrders - retDeliveryRetry;

  return (
    <div className="space-y-4">
      {/* KPIs Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Total Orders" value={snap.totalOrders.toLocaleString()} icon={ShoppingCart} trend={{ value: 9.4, isPositive: true }} subtitle="This week" accentColor="#6366F1" sparkData={[280, 312, 290, 390, 420, 350, 285]} />
        <KPICard title="Active Orders" value={snap.pendingOrders.toLocaleString()} icon={ShoppingCart} trend={{ value: 5.2, isPositive: true }} subtitle="In progress" accentColor="#0891B2" />
        <KPICard title="Delivered Orders" value={snap.fulfilledOrders.toLocaleString()} icon={ShoppingCart} trend={{ value: 8.3, isPositive: true }} subtitle={`${((snap.fulfilledOrders / snap.totalOrders) * 100).toFixed(1)}% success`} accentColor="#059669" />
        <KPICard title="Delayed Orders" value={Math.round(snap.totalOrders * 0.032).toString()} icon={AlertTriangle} trend={{ value: 5.2, isPositive: false }} subtitle="Exceeding SLA" accentColor="#EF4444" />
      </div>

      {/* KPIs Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Returned : Delivery Retry */}
        <KPICard
          title="Returned : Delivery Retry"
          value={retDeliveryRetry.toString()}
          icon={RefreshCw}
          trend={{ value: 2.1, isPositive: false }}
          subtitle={`${((retDeliveryRetry / snap.totalOrders) * 100).toFixed(1)}% of orders`}
          accentColor="#F59E0B"
        />
        {/* Returned : Cancelled */}
        <KPICard
          title="Returned : Cancelled"
          value={retCancelled.toString()}
          icon={RotateCcw}
          trend={{ value: 1.4, isPositive: false }}
          subtitle={`${((retCancelled / snap.totalOrders) * 100).toFixed(1)}% of orders`}
          accentColor="#DC2626"
        />
        {showFinancial && <KPICard title="Invoice Value" value={snap.invoiceValue} icon={DollarSign} trend={{ value: 14.2, isPositive: true }} subtitle="This week" accentColor="#059669" />}
        <KPICard title="Unique Customers" value={snap.uniqueCustomers.toLocaleString()} icon={Users} trend={{ value: 7.8, isPositive: true }} subtitle="Active this month" accentColor="#0891B2" />
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-slate-800 text-sm font-semibold">Delivery Aging Matrix</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Orders by aging bucket × distributor — intensity = volume</div>
          </div>
          <div className="flex items-center gap-1" style={{ fontSize: '10px', color: '#94A3B8' }}>
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#ECFDF5', border: '1px solid #D1FAE5' }} />
            <span className="mr-2">Low</span>
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#FEF9C3' }} />
            <span className="mr-2">Mid</span>
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#EF4444' }} />
            <span className="ml-0.5">High</span>
          </div>
        </div>

        {/* Scrollable container with smooth scrolling */}
        <div
          className="overflow-x-auto"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: '#CBD5E1 #F1F5F9',
          }}
        >
          <div style={{ minWidth: Math.max(560, heatCodes.length * 110 + 60) }}>
            {/* Column headers */}
            <div className="grid mb-1" style={{ gridTemplateColumns: `52px repeat(${heatCodes.length}, minmax(90px, 1fr))`, gap: 4 }}>
              <div />
              {heatCodes.map(d => (
                <div key={d} className="text-center text-slate-400 font-medium truncate px-1" style={{ fontSize: '10px' }}>{d}</div>
              ))}
            </div>

            {/* Heatmap rows */}
            <div className="space-y-1">
              {heatRows.map(row => {
                const dayLabel = row.label.split(' — ')[0];
                return (
                  <div key={row.label} className="grid items-center" style={{ gridTemplateColumns: `52px repeat(${heatCodes.length}, minmax(90px, 1fr))`, gap: 4 }}>
                    <div
                      className="text-center font-semibold rounded"
                      style={{
                        fontSize: '11px',
                        color: dayLabel === 'D4+' ? '#DC2626' : dayLabel === 'D3' ? '#D97706' : '#475569',
                        background: dayLabel === 'D4+' ? '#FEF2F2' : dayLabel === 'D3' ? '#FFFBEB' : '#F8FAFC',
                        padding: '6px 0',
                      }}
                    >
                      {dayLabel}
                    </div>
                    {heatCodes.map(code => {
                      const val = row.values[code] ?? 0;
                      const { bg, text } = heatColor(val, heatMax);
                      return (
                        <div
                          key={code}
                          className="rounded-lg flex flex-col items-center justify-center cursor-default transition-transform hover:scale-105"
                          style={{ background: bg, padding: '8px 4px', minHeight: 44 }}
                          title={`${dayLabel} · ${code}: ${val} orders`}
                        >
                          <span className="font-bold" style={{ fontSize: '13px', color: text }}>{val}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Column totals */}
            <div className="grid mt-2 pt-2" style={{ gridTemplateColumns: `52px repeat(${heatCodes.length}, minmax(90px, 1fr))`, gap: 4, borderTop: '1px solid #F1F5F9' }}>
              <div className="text-slate-400 font-medium" style={{ fontSize: '10px', paddingTop: 4 }}>Total</div>
              {heatCodes.map(code => {
                const colTotal = heatRows.reduce((s, r) => s + (r.values[code] ?? 0), 0);
                return (
                  <div key={code} className="text-center font-semibold text-slate-600" style={{ fontSize: '11px', paddingTop: 4 }}>{colTotal}</div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row: Trend + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Volume Trend — with price */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-slate-800 text-sm font-semibold">Order Volume Trend</div>
              <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Daily orders & total price — {orderTrend.length} days</div>
            </div>
            <div className="flex items-center gap-3" style={{ fontSize: '11px', color: '#94A3B8' }}>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded inline-block" style={{ background: '#6366F1', opacity: 0.7 }} /> Orders</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded inline-block" style={{ background: '#10B981' }} /> Price (₹L)</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <ComposedChart id="orders-trend-composed" data={orderTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[trendMinO, Math.ceil(maxOrders * 1.1)]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[trendMinP, parseFloat((maxPrice * 1.15).toFixed(1))]} tickFormatter={v => `₹${v}L`} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }}
                formatter={(value: number, name: string) => name === 'Price (₹L)' ? [`₹${value}L`, name] : [value, name]}
              />
              <Bar yAxisId="left" dataKey="orders" fill="#6366F1" fillOpacity={0.75} radius={[3, 3, 0, 0]} name="Orders" isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="totalPrice" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 3 }} name="Price (₹L)" isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Donut — read-only, no drilldown */}
        <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col" style={{ border: '1px solid #E2E8F0' }}>
          <div className="text-slate-800 text-sm font-semibold mb-0.5">Order Status Distribution</div>
          <div className="text-slate-400 mb-1" style={{ fontSize: '11px' }}>Today's breakdown</div>
          <ResponsiveContainer width="100%" height={155}>
            <PieChart id="orders-status-pie">
              <Pie
                data={orderStatus}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={68}
                dataKey="value"
                strokeWidth={2}
                stroke="white"
                isAnimationActive={false}
              >
                {orderStatus.map(e => (
                  <Cell key={`orders-cell-${e.name}`} fill={e.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1 flex-1">
            {orderStatus.map(s => (
              <div key={s.name} className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-slate-600" style={{ fontSize: '11px' }}>{s.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-700 font-medium" style={{ fontSize: '11px' }}>{s.value}</span>
                  <span className="text-slate-400" style={{ fontSize: '10px' }}>({((s.value / totalOrders) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Contribution — improved colors */}
      <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="text-slate-800 text-sm font-semibold mb-0.5">Orders Contribution by Type</div>
        <div className="text-slate-400 mb-4" style={{ fontSize: '11px' }}>Sales vs Digital breakdown</div>
        {(() => {
          const salesVal   = Math.round(snap.totalOrders * 0.715);
          const digitalVal = snap.totalOrders - salesVal;
          const salesPct   = ((salesVal / snap.totalOrders) * 100).toFixed(0);
          const digitalPct = ((digitalVal / snap.totalOrders) * 100).toFixed(0);
          const types = [
            { name: 'Sales',   value: salesVal,   color: '#4F46E5', bg: '#EEF2FF', pct: salesPct },
            { name: 'Digital', value: digitalVal,  color: '#0EA5E9', bg: '#F0F9FF', pct: digitalPct },
          ];
          return (
            <>
              <div className="flex items-center gap-6 mb-4">
                {types.map(t => (
                  <div key={t.name} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: t.bg }}>
                      <div className="w-4 h-4 rounded-full" style={{ background: t.color }} />
                    </div>
                    <div>
                      <div className="text-slate-800 font-bold" style={{ fontSize: '1.3rem' }}>{t.value.toLocaleString()}</div>
                      <div className="text-slate-500" style={{ fontSize: '11px' }}>
                        <span className="font-semibold" style={{ color: t.color }}>{t.name}</span> — {t.pct}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Segmented progress bar */}
              <div className="w-full rounded-full overflow-hidden flex" style={{ height: 12, background: '#F1F5F9', gap: 2 }}>
                <div
                  className="h-full rounded-l-full transition-all"
                  style={{ width: `${salesPct}%`, background: 'linear-gradient(to right, #4F46E5, #7C3AED)' }}
                />
                <div
                  className="h-full rounded-r-full flex-1 transition-all"
                  style={{ background: 'linear-gradient(to right, #0EA5E9, #38BDF8)' }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                {types.map(t => (
                  <span key={t.name} className="flex items-center gap-1" style={{ fontSize: '10px', color: '#94A3B8' }}>
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: t.color }} />
                    {t.name}: {t.pct}%
                  </span>
                ))}
              </div>
            </>
          );
        })()}
      </div>

      {/* Anomalies — with dropdown filter */}
      <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between p-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div className="text-slate-800 text-sm font-semibold">Anomalies</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Click any anomaly to view full insights and recommended actions</div>
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
                {anomalyTypeFilter}
                <ChevronDown size={10} />
              </button>
              {typeDropOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setTypeDropOpen(false)} />
                  <div className="absolute right-0 top-9 bg-white rounded-xl shadow-xl z-50 overflow-hidden" style={{ border: '1px solid #E2E8F0', minWidth: 160 }}>
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
            <span
              className="px-2 py-0.5 rounded-full font-bold"
              style={{ background: '#FEF2F2', color: '#DC2626', fontSize: '11px' }}
            >
              {filteredAnomalies.filter(a => a.severity === 'critical').length} critical
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredAnomalies.length === 0 && (
            <div className="px-5 py-8 text-center text-slate-400" style={{ fontSize: '12px' }}>
              No anomalies match the current filters.
            </div>
          )}
          {filteredAnomalies.map(anomaly => {
            const sc = severityConfig[anomaly.severity as keyof typeof severityConfig];
            const isSelected = selectedAnomaly?.id === anomaly.id;
            return (
              <div key={anomaly.id}>
                <button
                  onClick={() => setSelectedAnomaly(isSelected ? null : anomaly)}
                  className="w-full flex items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                  style={{ background: isSelected ? sc.bg : 'transparent' }}
                >
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: sc.dot }} />
                    {anomaly.severity === 'critical' && (
                      <div
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ background: sc.dot, opacity: 0.4 }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-700 font-medium" style={{ fontSize: '12px' }}>{anomaly.title}</span>
                      <span className="px-1.5 py-0.5 rounded font-medium flex-shrink-0" style={{ background: sc.bg, color: sc.color, fontSize: '10px', border: `1px solid ${sc.border}` }}>{sc.label}</span>
                      <span className="px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: '#F1F5F9', color: '#64748B', fontSize: '10px' }}>{anomaly.type}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1" style={{ fontSize: '11px', color: '#94A3B8' }}>
                      <span>{anomaly.distributor}</span>
                      <span>·</span>
                      <span>{anomaly.time}</span>
                      <span>·</span>
                      <span style={{ color: sc.color }}>Est. loss: {anomaly.estimatedLoss}</span>
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className="flex-shrink-0 mt-0.5 transition-transform"
                    style={{ color: '#94A3B8', transform: isSelected ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  />
                </button>

                {isSelected && (
                  <div className="px-5 pb-4">
                    <AnomalyDetailPanel anomaly={anomaly} onClose={() => setSelectedAnomaly(null)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
