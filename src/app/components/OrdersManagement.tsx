import { useState, useMemo } from 'react';
import KPICard from './KPICard';
import type { Role } from '../App';
import type { GlobalFilters } from '../data/filterData';
import { getSnapshotForFilters, getAgingHeatmapData, getOrderTrend } from '../data/filterData';
import { ShoppingCart, DollarSign, ArrowLeft } from 'lucide-react';
import {
  PieChart, Pie, Cell, ComposedChart, Line, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function heatColor(value: number, heatMax: number): { bg: string; text: string } {
  const ratio = value / (heatMax || 1);
  if (ratio < 0.1) return { bg: '#ECFDF5', text: '#065F46' };
  if (ratio < 0.25) return { bg: '#D1FAE5', text: '#065F46' };
  if (ratio < 0.45) return { bg: '#FEF9C3', text: '#713F12' };
  if (ratio < 0.65) return { bg: '#FED7AA', text: '#7C2D12' };
  if (ratio < 0.82) return { bg: '#FECACA', text: '#7F1D1D' };
  return { bg: '#EF4444', text: '#fff' };
}

export default function OrdersManagement({
  role,
  filters,
  distributorContext,
  onBackToDashboard,
}: {
  role: Role;
  filters: GlobalFilters;
  distributorContext?: { code: string; fromDashboard: boolean } | null;
  onBackToDashboard?: () => void;
}) {
  const showFinancial = role !== 'distributor_admin';

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

  // Trend domain helpers
  const maxOrders   = Math.max(...orderTrend.map(d => d.orders),   1);
  const maxPrice    = Math.max(...orderTrend.map(d => d.totalPrice),1);
  const trendMinO   = Math.max(0, Math.round(Math.min(...orderTrend.map(d => d.orders))   * 0.85));
  const trendMinP   = Math.max(0, Math.round(Math.min(...orderTrend.map(d => d.totalPrice)) * 0.85 * 10) / 10);


  return (
    <div className="space-y-4">
      {/* Back button — shown when drilled in from a distributor tile */}
      {distributorContext?.fromDashboard && onBackToDashboard && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F0F9FF 100%)', border: '1px solid #C7D2FE' }}>
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all hover:bg-indigo-100 active:scale-95"
            style={{ background: '#fff', border: '1px solid #A5B4FC', color: '#4F46E5', fontSize: '12px' }}
          >
            <ArrowLeft size={13} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <span className="text-slate-400" style={{ fontSize: '11px' }}>Viewing orders for</span>
            <span className="font-bold text-indigo-700 rounded-md px-2 py-0.5" style={{ background: '#EEF2FF', fontSize: '12px', fontFamily: 'monospace' }}>{distributorContext.code}</span>
          </div>
        </div>
      )}

      {/* KPIs Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <KPICard title="Total Orders" value={snap.totalOrders.toLocaleString()} icon={ShoppingCart} trend={{ value: 9.4, isPositive: true }} subtitle="This week" accentColor="#6366F1" sparkData={[280, 312, 290, 390, 420, 350, 285]} />
        <KPICard title="Orders in Progress" value={snap.pendingOrders.toLocaleString()} icon={ShoppingCart} trend={{ value: 5.2, isPositive: true }} subtitle="In progress" accentColor="#0891B2" />
        <KPICard title="Delivered Orders" value={snap.fulfilledOrders.toLocaleString()} icon={ShoppingCart} trend={{ value: 8.3, isPositive: true }} subtitle={`${((snap.fulfilledOrders / snap.totalOrders) * 100).toFixed(1)}% success`} accentColor="#059669" />
      </div>

      {/* KPIs Row 2 — Invoice Value + Sales vs Digital */}
      {showFinancial && (() => {
        const salesVal   = Math.round(snap.totalOrders * 0.715);
        const digitalVal = snap.totalOrders - salesVal;
        const salesPct   = Number(((salesVal / snap.totalOrders) * 100).toFixed(0));
        const digitalPct = 100 - salesPct;
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Invoice Value */}
            <KPICard title="Invoice Value" value={snap.invoiceValue} icon={DollarSign} trend={{ value: 14.2, isPositive: true }} subtitle="This week" accentColor="#059669" />

            {/* Sales vs Digital */}
            <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-slate-700 font-semibold" style={{ fontSize: '12px' }}>Sales vs Digital</div>
                  <div className="text-slate-400" style={{ fontSize: '10px' }}>Order type split this week</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Sales stat */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#4F46E5' }} />
                  <div>
                    <div className="font-extrabold text-slate-800" style={{ fontSize: '1.1rem', lineHeight: 1 }}>{salesVal.toLocaleString()}</div>
                    <div style={{ fontSize: '9px', color: '#4F46E5', fontWeight: 600, marginTop: 2 }}>Sales · {salesPct}%</div>
                  </div>
                </div>
                {/* Segmented bar */}
                <div className="flex-1">
                  <div className="w-full rounded-full overflow-hidden flex" style={{ height: 8, background: '#F1F5F9' }}>
                    <div className="h-full rounded-l-full" style={{ width: `${salesPct}%`, background: 'linear-gradient(to right, #4F46E5, #7C3AED)' }} />
                    <div className="h-full rounded-r-full flex-1" style={{ background: 'linear-gradient(to right, #0EA5E9, #38BDF8)' }} />
                  </div>
                  <div className="flex justify-between mt-1" style={{ fontSize: '9px', color: '#94A3B8' }}>
                    <span>{salesPct}%</span>
                    <span>{digitalPct}%</span>
                  </div>
                </div>
                {/* Digital stat */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#0EA5E9' }} />
                  <div>
                    <div className="font-extrabold text-slate-800" style={{ fontSize: '1.1rem', lineHeight: 1 }}>{digitalVal.toLocaleString()}</div>
                    <div style={{ fontSize: '9px', color: '#0EA5E9', fontWeight: 600, marginTop: 2 }}>Digital · {digitalPct}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
              <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>
                {showFinancial ? 'Daily orders & total price' : 'Daily orders'} — {orderTrend.length} days
              </div>
            </div>
            <div className="flex items-center gap-3" style={{ fontSize: '11px', color: '#94A3B8' }}>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded inline-block" style={{ background: '#6366F1', opacity: 0.7 }} /> Orders</span>
              {showFinancial && (
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded inline-block" style={{ background: '#10B981' }} /> Price (₹L)</span>
              )}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <ComposedChart id="orders-trend-composed" data={orderTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[trendMinO, Math.ceil(maxOrders * 1.1)]} />
              {showFinancial && (
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[trendMinP, parseFloat((maxPrice * 1.15).toFixed(1))]} tickFormatter={v => `₹${v}L`} />
              )}
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }}
                formatter={(value: number, name: string) => name === 'Price (₹L)' ? [`₹${value}L`, name] : [value, name]}
              />
              <Bar yAxisId="left" dataKey="orders" fill="#6366F1" fillOpacity={0.75} radius={[3, 3, 0, 0]} name="Orders" isAnimationActive={false} />
              {showFinancial && (
                <Line yAxisId="right" type="monotone" dataKey="totalPrice" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 3 }} name="Price (₹L)" isAnimationActive={false} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Donut */}
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



    </div>
  );
}
