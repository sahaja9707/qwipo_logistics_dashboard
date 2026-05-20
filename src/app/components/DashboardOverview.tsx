import { useMemo } from 'react';
import KPICard from './KPICard';
import type { Role } from '../App';
import type { GlobalFilters } from '../data/filterData';
import {
  getSnapshotForFilters, getWeeklyTrend, getCategoryData, getFilteredDistributorPerf,
} from '../data/filterData';
import {
  ShoppingCart, Truck, CheckCircle, AlertTriangle, Users, Package,
  DollarSign, MapPin, BarChart2, Zap, Clock,
} from 'lucide-react';
import {
  ComposedChart, Bar, Area, PieChart, Pie, Cell, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Shared static data ────────────────────────────────────────────────────────

const STATIC_ORDER_TREND = [
  { day: 'Mon', orders: 245, delivered: 220, returned: 15, price: 2.8 },
  { day: 'Tue', orders: 312, delivered: 290, returned: 18, price: 3.6 },
  { day: 'Wed', orders: 280, delivered: 265, returned: 12, price: 3.2 },
  { day: 'Thu', orders: 390, delivered: 370, returned: 22, price: 4.5 },
  { day: 'Fri', orders: 420, delivered: 395, returned: 19, price: 4.9 },
  { day: 'Sat', orders: 350, delivered: 330, returned: 14, price: 4.0 },
  { day: 'Sun', orders: 285, delivered: 260, returned: 11, price: 3.3 },
];

const recentAlerts = [
  { id: 1, type: 'Delayed Delivery',  severity: 'high',   message: '14 orders past D2 threshold in Andheri — 3 approaching D4+', time: '8 min ago' },
  { id: 2, type: 'High Return Rate',  severity: 'medium', message: 'Malad branch return rate at 18.1% — threshold is 12%',         time: '23 min ago' },
  { id: 3, type: 'SIM Card Changed',  severity: 'high',   message: 'Tamper alert on TS-09-T-3312 mid-trip — halted for review',    time: '3h 05m ago' },
  { id: 4, type: 'Runtime Exceeded',  severity: 'medium', message: 'TRP-3847 exceeded planned 6h window by 2.4 hrs',               time: '1h 23m ago' },
];

// ─── Super Admin Dashboard ────────────────────────────────────────────────────

function SuperAdminDashboard({ filters }: { filters: GlobalFilters }) {
  const snap = useMemo(() => getSnapshotForFilters(filters), [filters]);

  const deliveryStatus = useMemo(() => [
    { name: 'Delivered',     value: snap.fulfilledOrders,                    color: '#10B981' },
    { name: 'In Planning',   value: snap.pendingOrders,                      color: '#6366F1' },
    { name: 'Returned',      value: snap.returnedOrders,                     color: '#F59E0B' },
    { name: 'Partial Return',value: Math.round(snap.returnedOrders * 0.41),  color: '#FB923C' },
    { name: 'Cancelled',     value: snap.cancelledOrders,                    color: '#EF4444' },
  ], [snap]);

  const totalDeliveries = deliveryStatus.reduce((s, x) => s + x.value, 0);

  const agingCounts = useMemo(() => {
    const total = snap.totalOrders;
    return [
      { label: 'D0',  value: Math.round(total * 0.406), color: '#10B981', bg: '#ECFDF5' },
      { label: 'D1',  value: Math.round(total * 0.194), color: '#6366F1', bg: '#EEF2FF' },
      { label: 'D2',  value: Math.round(total * 0.098), color: '#F59E0B', bg: '#FFFBEB' },
      { label: 'D3',  value: Math.round(total * 0.028), color: '#FB923C', bg: '#FFF7ED' },
      { label: 'D4+', value: Math.round(total * 0.014), color: '#EF4444', bg: '#FEF2F2' },
    ];
  }, [snap]);

  return (
    <div className="space-y-4">
      {/* KPI Row 1 — logistics SKUs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Total Orders"     value={snap.totalOrders.toLocaleString()} icon={ShoppingCart} trend={{ value: 12.5, isPositive: true }} subtitle="This week" accentColor="#6366F1" sparkData={[245,312,280,390,420,350,285]} />
        <KPICard title="Active Trips"     value={Math.round(snap.totalOrders * 0.058).toString()} icon={Truck} trend={{ value: 8.1, isPositive: true }} subtitle="Currently running" accentColor="#0891B2" sparkData={[82,91,88,105,120,118,124]} />
        <KPICard title="Delivery Success" value={`${((snap.fulfilledOrders / snap.totalOrders) * 100).toFixed(1)}%`} icon={CheckCircle} trend={{ value: 2.3, isPositive: true }} subtitle="Last 7 days" accentColor="#10B981" sparkData={[92,94.5,93,95,94.2,95.1,94.2]} />
        <KPICard title="Invoice Value"    value={snap.invoiceValue} icon={DollarSign} trend={{ value: 14.2, isPositive: true }} subtitle="This week" accentColor="#059669" sparkData={[22,24,23,26,26,28,28]} />
      </div>

      {/* KPI Row 2 — operations SKUs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Planned vs Live Dist." value="±4.2 km" icon={MapPin} trend={{ value: 3.1, isPositive: false }} subtitle="Avg deviation" accentColor="#7C3AED" />
        <KPICard title="Vehicle Utilization"   value={`${snap.vehicleUtil}%`} icon={Truck} trend={{ value: 3.4, isPositive: true }} subtitle="Fleet efficiency" accentColor="#8B5CF6" sparkData={[72,78,75,82,85,88,snap.vehicleUtil]} />
        <KPICard title="Unique Customers"      value={snap.uniqueCustomers.toLocaleString()} icon={Users} trend={{ value: 7.8, isPositive: true }} subtitle="Active this month" accentColor="#F59E0B" />
        <KPICard title="Delayed Deliveries"    value={Math.round(snap.totalOrders * 0.032).toString()} icon={AlertTriangle} trend={{ value: 5.2, isPositive: false }} subtitle="Exceeding SLA" accentColor="#EF4444" />
      </div>

      {/* SKU metric strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Time Utilization %"     value={`${snap.timeUtil}%`} icon={Clock} trend={{ value: 2.1, isPositive: true }} subtitle="This week" accentColor="#0891B2" />
        <KPICard title="Delivery Point Util. %" value={`${snap.dpUtil}%`}   icon={Zap}   trend={{ value: 1.8, isPositive: true }} subtitle="This week" accentColor="#10B981" />
        <KPICard title="Returned : Cancelled"   value={`${snap.returnedOrders}:${snap.cancelledOrders}`} icon={Package} subtitle="This week" accentColor="#FB923C" />
        <KPICard title="Avg Run Time"           value={snap.avgRunTime} icon={Clock} trend={{ value: 0.4, isPositive: false }} subtitle="Per trip" accentColor="#6366F1" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-slate-800 text-sm font-semibold">Order Volume Trend</div>
              <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Orders vs Deliveries — last 7 days</div>
            </div>
            <div className="flex items-center gap-3" style={{ fontSize: '11px', color: '#94A3B8' }}>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-indigo-500 rounded" /> Orders</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-emerald-500 rounded" /> Delivered</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-amber-400 rounded" /> Returned</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart id="sa-order-area" data={STATIC_ORDER_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} />
              <Area type="monotone" dataKey="orders"    stroke="#6366F1" strokeWidth={2} fill="#6366F1" fillOpacity={0.12} name="Orders"    dot={false} isAnimationActive={false} />
              <Area type="monotone" dataKey="delivered" stroke="#10B981" strokeWidth={2} fill="#10B981" fillOpacity={0.10} name="Delivered" dot={false} isAnimationActive={false} />
              <Line  type="monotone" dataKey="returned"  stroke="#F59E0B" strokeWidth={1.5} dot={false} name="Returned" isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Donut */}
        <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
          <div className="text-slate-800 text-sm font-semibold mb-0.5">Order Status</div>
          <div className="text-slate-400 mb-3" style={{ fontSize: '11px' }}>Today's distribution</div>
          <ResponsiveContainer width="100%" height={145}>
            <PieChart id="sa-delivery-pie">
              <Pie data={deliveryStatus} cx="50%" cy="50%" innerRadius={44} outerRadius={64} dataKey="value" strokeWidth={2} stroke="white" isAnimationActive={false}>
                {deliveryStatus.map(e => <Cell key={`sa-cell-${e.name}`} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {deliveryStatus.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-slate-500" style={{ fontSize: '11px' }}>{s.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-700 font-medium" style={{ fontSize: '11px' }}>{s.value}</span>
                  <span className="text-slate-400" style={{ fontSize: '10px' }}>({((s.value / totalDeliveries) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Aging SKU summary */}
      <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="text-slate-800 text-sm font-semibold mb-0.5">Delivery Aging Overview</div>
        <div className="text-slate-400 mb-4" style={{ fontSize: '11px' }}>Platform-wide D0–D4+ aging summary</div>
        <div className="grid grid-cols-5 gap-3">
          {agingCounts.map(d => (
            <div key={d.label} className="rounded-xl p-4 text-center" style={{ background: d.bg }}>
              <div className="font-bold" style={{ fontSize: '1.5rem', color: d.color }}>{d.value}</div>
              <div className="font-semibold mt-0.5" style={{ fontSize: '12px', color: d.color }}>{d.label}</div>
              <div className="text-slate-400 mt-0.5" style={{ fontSize: '10px' }}>orders</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-slate-800 text-sm font-semibold">Recent Alerts</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Operational exceptions</div>
          </div>
          <span className="text-indigo-600 cursor-pointer hover:underline" style={{ fontSize: '11px' }}>View all →</span>
        </div>
        <div className="space-y-2.5">
          {recentAlerts.map(a => (
            <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: a.severity === 'high' ? '#EF4444' : '#F59E0B' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-slate-700 font-medium" style={{ fontSize: '11px' }}>{a.type}</span>
                  <span className="text-slate-400 flex-shrink-0 ml-2" style={{ fontSize: '10px' }}>{a.time}</span>
                </div>
                <p className="text-slate-500 leading-snug" style={{ fontSize: '11px' }}>{a.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Company Admin Dashboard ──────────────────────────────────────────────────

function CompanyAdminDashboard({ filters }: { filters: GlobalFilters }) {
  const snap      = useMemo(() => getSnapshotForFilters(filters),        [filters]);
  const weekly    = useMemo(() => getWeeklyTrend(filters),               [filters]);
  const categories= useMemo(() => getCategoryData(filters),              [filters]);
  const distPerf  = useMemo(() => getFilteredDistributorPerf(filters),   [filters]);

  const deliveryStatus = useMemo(() => [
    { name: 'Delivered',     value: snap.fulfilledOrders,                   color: '#10B981' },
    { name: 'In Planning',   value: snap.pendingOrders,                     color: '#6366F1' },
    { name: 'Returned',      value: snap.returnedOrders,                    color: '#F59E0B' },
    { name: 'Partial Return',value: Math.round(snap.returnedOrders * 0.41), color: '#FB923C' },
    { name: 'Cancelled',     value: snap.cancelledOrders,                   color: '#EF4444' },
  ], [snap]);

  const maxOrders  = Math.max(...weekly.map(d => d.orders), 1);
  const maxInvoice = Math.max(...weekly.map(d => d.invoiceL), 1);
  const minOrders  = Math.max(0, Math.round(Math.min(...weekly.map(d => d.orders)) * 0.85));
  const minInvoice = Math.max(0, parseFloat((Math.min(...weekly.map(d => d.invoiceL)) * 0.85).toFixed(1)));

  const companyLabel = filters.company || 'All Companies';
  const totalReturns = snap.returnedOrders;
  const cancelledReturns = Math.round(totalReturns * 0.42);
  const retryReturns     = Math.round(totalReturns * 0.35);
  const partialReturns   = totalReturns - cancelledReturns - retryReturns;

  return (
    <div className="space-y-4">
      {/* Role context banner */}
      <div className="rounded-xl px-5 py-3 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #7C3AED15 0%, #6366F115 100%)', border: '1px solid #C4B5FD40' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#7C3AED' }}>
          <BarChart2 size={15} className="text-white" />
        </div>
        <div>
          <div className="text-slate-800 font-semibold" style={{ fontSize: '13px' }}>{companyLabel} — Company Admin View</div>
          <div className="text-slate-500" style={{ fontSize: '11px' }}>Aggregated performance across distributor network · May 2026</div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {[
            { label: 'Distributors', value: distPerf.length.toString() },
            { label: 'States',       value: [...new Set(distPerf.map(d => d.state))].length.toString() },
            { label: 'Cities',       value: [...new Set(distPerf.map(d => d.city))].length.toString()  },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-slate-800 font-bold" style={{ fontSize: '1rem' }}>{s.value}</div>
              <div className="text-slate-400" style={{ fontSize: '10px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Total Orders"     value={snap.totalOrders.toLocaleString()}   icon={ShoppingCart} trend={{ value: 12.5, isPositive: true }} subtitle="This week" accentColor="#7C3AED" sparkData={[245,312,280,390,420,350,285]} />
        <KPICard title="Invoice Value"    value={snap.invoiceValue}                   icon={DollarSign}   trend={{ value: 14.2, isPositive: true }} subtitle="This week" accentColor="#059669" sparkData={[22,24,23,26,26,28,28]} />
        <KPICard title="Unique Customers" value={snap.uniqueCustomers.toLocaleString()} icon={Users}      trend={{ value: 7.8, isPositive: true }}  subtitle="Active this month" accentColor="#0891B2" />
        <KPICard title="Delivery Rate"    value={`${((snap.fulfilledOrders / snap.totalOrders) * 100).toFixed(1)}%`} icon={CheckCircle} trend={{ value: 2.3, isPositive: true }} subtitle="Platform-wide" accentColor="#10B981" sparkData={[92,94.5,93,95,94.2,95.1,94.2]} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Return Rate"       value={`${snap.returnRate}%`} icon={Package}       trend={{ value: 0.8, isPositive: false }} subtitle="This week"         accentColor="#FB923C" />
        <KPICard title="Avg Vehicles Used" value={snap.avgVehicles}      icon={Truck}         trend={{ value: 3.4, isPositive: true }}  subtitle={`${snap.vehicleUtil}% utilization`} accentColor="#6366F1" sparkData={[82,91,88,94,96,78,92]} />
        <KPICard title="Delivery Cost"     value={`₹${(snap.invoiceValueNum * 0.087).toFixed(1)}L`} icon={DollarSign} trend={{ value: 2.1, isPositive: false }} subtitle="Logistics cost" accentColor="#D97706" />
        <KPICard title="Anomalies"         value="5"                     icon={AlertTriangle} trend={{ value: 2, isPositive: false }}   subtitle="Open incidents"    accentColor="#EF4444" />
      </div>

      {/* Invoice & Orders Weekly Trend */}
      <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-slate-800 text-sm font-semibold">Weekly Performance Trend</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Invoice value (₹L) & order volume — Apr–May 2026</div>
          </div>
          <div className="flex items-center gap-3" style={{ fontSize: '11px', color: '#94A3B8' }}>
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded inline-block" style={{ background: '#7C3AED', opacity: 0.7 }} /> Orders</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded inline-block" style={{ background: '#10B981' }} /> Invoice (₹L)</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart id="ca-weekly-trend" data={weekly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left"  tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[minOrders, Math.ceil(maxOrders * 1.1)]} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[minInvoice, parseFloat((maxInvoice * 1.15).toFixed(1))]} tickFormatter={v => `₹${v}L`} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} formatter={(v: number, n: string) => n === 'Invoice (₹L)' ? [`₹${v}L`, n] : [v, n]} />
            <Bar yAxisId="left" dataKey="orders" fill="#7C3AED" fillOpacity={0.7} radius={[3,3,0,0]} name="Orders" isAnimationActive={false} />
            <Line yAxisId="right" type="monotone" dataKey="invoiceL" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 3 }} name="Invoice (₹L)" isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Category Contribution + Distributor Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category contribution panel */}
        <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
          <div className="text-slate-800 text-sm font-semibold mb-0.5">Category Contribution</div>
          <div className="text-slate-400 mb-4" style={{ fontSize: '11px' }}>Sales by product category{filters.company ? ` · ${filters.company}` : ''}</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart id="ca-category-pie">
              <Pie data={categories} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="revenue" strokeWidth={2} stroke="white" isAnimationActive={false}>
                {categories.map((c, i) => <Cell key={`cat-cell-${i}`} fill={c.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} formatter={(v: number) => [`₹${v}L`, 'Revenue']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categories.map(c => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-slate-500 truncate" style={{ fontSize: '10px', maxWidth: 110 }}>{c.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-700 font-medium" style={{ fontSize: '10px' }}>₹{c.revenue}L</span>
                  <span className="text-slate-400" style={{ fontSize: '10px' }}>({c.share}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distributor Performance Comparison */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
          <div className="p-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
            <div className="text-slate-800 text-sm font-semibold">Distributor Performance Comparison</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Delivery rate, returns, invoice value</div>
          </div>
          {distPerf.length === 0 ? (
            <div className="p-8 text-center text-slate-400" style={{ fontSize: '12px' }}>No distributors match current filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Distributor', 'City', 'Orders', 'Delivery %', 'Return %', 'Invoice (₹L)', 'Status'].map(h => (
                      <th key={h} className={`px-4 py-2.5 text-slate-400 font-medium ${h === 'Distributor' || h === 'City' ? 'text-left' : 'text-right'}`} style={{ fontSize: '11px' }}>{h}</th>
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
                        <td className="px-4 py-2.5 text-slate-500">{d.city}</td>
                        <td className="px-4 py-2.5 text-right text-slate-700">{d.orders}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="font-semibold" style={{ color: deliveryPct >= 92 ? '#059669' : deliveryPct >= 85 ? '#D97706' : '#DC2626' }}>{deliveryPct}%</span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="font-semibold" style={{ color: d.returnRate > 12 ? '#DC2626' : d.returnRate > 8 ? '#D97706' : '#059669' }}>{d.returnRate}%</span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-700 font-medium">₹{d.invoiceL}L</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="px-2 py-0.5 rounded-full font-medium" style={{
                            fontSize: '10px',
                            background: status === 'good' ? '#ECFDF5' : status === 'warn' ? '#FFFBEB' : '#FEF2F2',
                            color:      status === 'good' ? '#059669' : status === 'warn' ? '#D97706' : '#DC2626',
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
      </div>

      {/* Order Status + Returned breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
          <div className="text-slate-800 text-sm font-semibold mb-0.5">Order Status Distribution</div>
          <div className="text-slate-400 mb-3" style={{ fontSize: '11px' }}>Delivered · In Planning · Returned · Partial Return · Cancelled</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart id="ca-status-pie">
              <Pie data={deliveryStatus} cx="50%" cy="50%" innerRadius={42} outerRadius={62} dataKey="value" strokeWidth={2} stroke="white" isAnimationActive={false}>
                {deliveryStatus.map(e => <Cell key={`ca-status-cell-${e.name}`} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
            {deliveryStatus.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-slate-500" style={{ fontSize: '10px' }}>{s.name}</span>
                </div>
                <span className="text-slate-700 font-medium" style={{ fontSize: '10px' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Returned breakdown */}
        <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
          <div className="text-slate-800 text-sm font-semibold mb-0.5">Returns Breakdown</div>
          <div className="text-slate-400 mb-4" style={{ fontSize: '11px' }}>Returned : Cancelled vs Delivery Retry</div>
          <div className="space-y-3">
            {[
              { label: 'Returned : Cancelled',      value: cancelledReturns, pct: 42.0, color: '#EF4444', bg: '#FEF2F2' },
              { label: 'Returned : Delivery Retry', value: retryReturns,     pct: 35.2, color: '#F59E0B', bg: '#FFFBEB' },
              { label: 'Returned : Partial',        value: partialReturns,   pct: 22.8, color: '#FB923C', bg: '#FFF7ED' },
            ].map(r => (
              <div key={r.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-600" style={{ fontSize: '11px' }}>{r.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ fontSize: '13px', color: r.color }}>{r.value}</span>
                    <span className="text-slate-400" style={{ fontSize: '10px' }}>({r.pct}%)</span>
                  </div>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: '#F1F5F9' }}>
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium" style={{ fontSize: '12px' }}>Total Returns</span>
              <span className="text-slate-800 font-bold" style={{ fontSize: '14px' }}>{totalReturns}</span>
            </div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '10px' }}>{snap.returnRate}% of {snap.totalOrders.toLocaleString()} total orders</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function DashboardOverview({ role, filters }: { role: Role; filters: GlobalFilters }) {
  if (role === 'company_admin') return <CompanyAdminDashboard filters={filters} />;
  return <SuperAdminDashboard filters={filters} />;
}
