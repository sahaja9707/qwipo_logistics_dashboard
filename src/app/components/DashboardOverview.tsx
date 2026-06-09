import { useMemo, useState } from 'react';
import KPICard from './KPICard';
import CreateCompanyModal from './CreateCompanyModal';
import type { Role } from '../App';
import type { GlobalFilters } from '../data/filterData';
import {
  getSnapshotForFilters, getWeeklyTrend, getCategoryData, getFilteredDistributorPerf,
  companyDistributorMappings, getUnassignedDistributors, assignDistributorsToCompany,
  ALL_DISTRIBUTORS, COMPANY_RECORDS, addCompanyRecord,
} from '../data/filterData';
import type { CompanyDistributorMapping, DistributorInfo, CompanyRecord } from '../data/filterData';
import {
  ShoppingCart, CheckCircle, Package,
  DollarSign, BarChart2, Clock, Building2, Building,
  Plus, Search, X,
} from 'lucide-react';
import {
  ComposedChart, Bar, PieChart, Pie, Cell, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Shared Gauge component ───────────────────────────────────────────────────
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

const UTIL_METRICS = [
  { name: 'Vehicle Utilization',  color: '#6366F1', target: 90, key: 'vehicleUtil' as const },
  { name: 'Time Utilization',     color: '#0891B2', target: 85, key: 'timeUtil'    as const },
  { name: 'Delivery Point Util.', color: '#10B981', target: 90, key: 'dpUtil'      as const },
];


interface SuperAdminProps {
  filters: GlobalFilters;
  onDistributorDrillDown: (code: string) => void;
}

// ─── Assign Distributor Modal ─────────────────────────────────────────────────

interface AssignDistributorModalProps {
  companyName: string;
  companyCode: string;
  onClose: () => void;
  onAssigned: () => void;
}

function AssignDistributorModal({ companyName, companyCode, onClose, onAssigned }: AssignDistributorModalProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const available = useMemo(
    () => getUnassignedDistributors(companyCode),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [companyCode]
  );

  const filtered = useMemo(
    () => available.filter(d =>
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.city.toLowerCase().includes(search.toLowerCase())
    ),
    [available, search]
  );

  const toggle = (code: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const handleAssign = () => {
    if (selected.size === 0) return;
    assignDistributorsToCompany(companyCode, [...selected]);
    onAssigned();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ width: 480, maxHeight: '80vh', border: '1px solid #E2E8F0' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div className="text-slate-800 font-semibold text-sm">Assign Distributor</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Adding to: {companyName}</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Search size={13} style={{ color: '#94A3B8', flexShrink: 0 }} />
            <input
              autoFocus
              type="text"
              placeholder="Search by code, name or city…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-slate-700 outline-none placeholder-slate-400"
              style={{ fontSize: '12px' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1.5">
          {filtered.length === 0 ? (
            <div className="text-center text-slate-400 py-8" style={{ fontSize: '12px' }}>
              {available.length === 0
                ? 'All distributors are already assigned to this company.'
                : 'No distributors match your search.'}
            </div>
          ) : (
            filtered.map(d => {
              const checked = selected.has(d.code);
              return (
                <label
                  key={d.code}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                  style={{
                    background: checked ? 'rgba(99,102,241,0.06)' : '#FAFAFA',
                    border: `1px solid ${checked ? '#C7D2FE' : '#F1F5F9'}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(d.code)}
                    className="w-4 h-4 rounded accent-indigo-600 cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-700 font-medium" style={{ fontSize: '12px', fontFamily: 'monospace' }}>{d.code}</div>
                    <div className="text-slate-400 truncate" style={{ fontSize: '11px' }}>{d.name} · {d.city}</div>
                  </div>
                  <span className="text-slate-400 text-xs px-1.5 py-0.5 rounded" style={{ background: '#F1F5F9', fontSize: '10px' }}>{d.state}</span>
                </label>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid #F1F5F9' }}>
          <span className="text-slate-400" style={{ fontSize: '11px' }}>
            {selected.size > 0 ? `${selected.size} distributor${selected.size > 1 ? 's' : ''} selected` : 'None selected'}
          </span>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={selected.size === 0}
              className="px-4 py-1.5 rounded-lg text-white text-xs font-semibold transition-all"
              style={{
                background: selected.size > 0 ? '#6366F1' : '#CBD5E1',
                cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Super Admin Dashboard ────────────────────────────────────────────────────

function SuperAdminDashboard({ filters, onDistributorDrillDown }: SuperAdminProps) {
  const [activeDistributorListCompany, setActiveDistributorListCompany] = useState<string | null>(null);
  const [assignModalCompany, setAssignModalCompany] = useState<{ name: string; code: string } | null>(null);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);

  // Local copy of mappings so React re-renders on assignment
  const [mappings, setMappings] = useState<CompanyDistributorMapping[]>(
    () => companyDistributorMappings.map(m => ({ ...m, distributorIds: [...m.distributorIds] }))
  );

  // Company cards driven by COMPANY_RECORDS (includes newly added ones)
  const [companyRecords, setCompanyRecords] = useState<CompanyRecord[]>(() => [...COMPANY_RECORDS]);

  const getCompanyDistributors = (companyCode: string): DistributorInfo[] => {
    const mapping = mappings.find(m => m.companyId === companyCode);
    if (!mapping) return [];
    return mapping.distributorIds
      .map(id => ALL_DISTRIBUTORS.find(d => d.code === id))
      .filter((d): d is DistributorInfo => !!d);
  };

  const handleAssigned = () => {
    // Sync local state from the mutated module-level array
    setMappings(companyDistributorMappings.map(m => ({ ...m, distributorIds: [...m.distributorIds] })));
  };

  const handleCompanyCreated = (company: CompanyRecord) => {
    addCompanyRecord(company);                  // mutate module-level arrays
    setCompanyRecords([...COMPANY_RECORDS]);    // re-read to trigger re-render
    setMappings(companyDistributorMappings.map(m => ({ ...m, distributorIds: [...m.distributorIds] })));
  };

  const totalDistributors = mappings.reduce((sum, m) => sum + m.distributorIds.length, 0);

  // Static metrics for the 3 original companies; new ones get placeholders
  const STATIC_METRICS: Record<string, Array<{ label: string; value: string; sub: string }>> = {
    'ITC': [
      { label: 'Distributors', value: '17 / 17', sub: 'Active' },
      { label: 'Beats', value: '167', sub: 'Assigned beats' },
      { label: 'Vehicles', value: '327', sub: 'Fleet size' },
      { label: 'Deliveries', value: '18,275', sub: 'Last 30 days' },
      { label: 'Revenue', value: '₹8.03 Cr', sub: 'Last 30 days' },
      { label: 'Avg Time Util.', value: '83.2%', sub: 'Time-based' },
    ],
    'HUL (Hindustan Unilever)': [
      { label: 'Distributors', value: '3 / 3', sub: 'Active' },
      { label: 'Beats', value: '34', sub: 'Assigned beats' },
      { label: 'Vehicles', value: '76', sub: 'Fleet size' },
      { label: 'Deliveries', value: '4,407', sub: 'Last 30 days' },
      { label: 'Revenue', value: '₹1.95 Cr', sub: 'Last 30 days' },
      { label: 'Avg Time Util.', value: '83.0%', sub: 'Time-based' },
    ],
    'Qwipo 3PL Logistics': [
      { label: 'Distributors', value: '5 / 5', sub: 'Active' },
      { label: 'Beats', value: '48', sub: 'Assigned beats' },
      { label: 'Vehicles', value: '92', sub: 'Fleet size' },
      { label: 'Deliveries', value: '5,812', sub: 'Last 30 days' },
      { label: 'Revenue', value: '₹2.24 Cr', sub: 'Last 30 days' },
      { label: 'Avg Time Util.', value: '80.4%', sub: 'Time-based' },
    ],
  };

  const PLACEHOLDER_METRICS = [
    { label: 'Distributors', value: '0 / 0', sub: 'None assigned yet' },
    { label: 'Beats',        value: '—',     sub: 'Not yet active' },
    { label: 'Vehicles',     value: '—',     sub: 'Not yet active' },
    { label: 'Deliveries',   value: '—',     sub: 'Last 30 days' },
    { label: 'Revenue',      value: '—',     sub: 'Last 30 days' },
    { label: 'Avg Time Util.', value: '—',   sub: 'Not yet active' },
  ];




  return (
    <div className="space-y-4">
      {/* Top 5 KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard title="Companies" value={`${companyRecords.length} / ${companyRecords.length}`} icon={Building2} subtitle="Active / Total" accentColor="#6366F1" />
        <KPICard title="Distributors" value={`${totalDistributors} / ${totalDistributors}`} icon={Building} subtitle="Active / Total" accentColor="#0891B2" />
        <KPICard title="Deliveries" value="28,494" icon={CheckCircle} trend={{ value: 4.8, isPositive: true }} subtitle="Last 30 days" accentColor="#10B981" sparkData={[680, 712, 790, 890, 920, 850, 942]} />
        <KPICard title="Invoice Value" value="₹12.21 Cr" icon={DollarSign} trend={{ value: 12.3, isPositive: true }} subtitle="Last 30 days" accentColor="#059669" sparkData={[24,26,25,29,31,28,32]} />
        <KPICard title="Avg Utilization" value="83.1%" icon={Clock} trend={{ value: 1.5, isPositive: true }} subtitle="Time-based" accentColor="#8B5CF6" />
      </div>

      {/* Customer Companies Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5 mt-2">
          <div>
            <h2 className="text-slate-800 text-sm font-semibold">Customer Companies</h2>
            <p className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Onboarded client companies and operational distribution metrics</p>
          </div>
          <button
            onClick={() => setShowAddCompanyModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: '#6366F1', fontSize: '12px' }}
          >
            <Plus size={13} />
            Add Company
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {companyRecords.map(cr => {
            const metrics = STATIC_METRICS[cr.id] ?? PLACEHOLDER_METRICS;
            const company = { name: cr.name, logo: cr.shortCode, logoBg: cr.logoBg, onboarded: cr.onboarded, status: cr.status, companyCode: cr.id, metrics };
            const assignedDistributors = getCompanyDistributors(company.companyCode);
            const isExpanded = activeDistributorListCompany === company.companyCode;

            return (
              <div key={company.name} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200" style={{ border: '1px solid #E2E8F0' }}>
                {/* Header */}
                <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-inner" style={{ background: company.logoBg }}>
                      {company.logo}
                    </div>
                    <div>
                      <h3 className="text-slate-800 text-sm font-bold leading-none">{company.name}</h3>
                      <span className="text-slate-400 inline-block mt-1" style={{ fontSize: '10px' }}>Onboarded: {company.onboarded}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-emerald-700 font-bold" style={{ fontSize: '9px' }}>{company.status}</span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-y-4 gap-x-2 py-4">
                  {company.metrics.map(metric => (
                    <div key={metric.label}>
                      <div className="text-slate-400 font-semibold uppercase tracking-wider" style={{ fontSize: '9px' }}>{metric.label}</div>
                      <div className="text-slate-700 font-extrabold mt-0.5" style={{ fontSize: '13px' }}>{metric.value}</div>
                      <div className="text-slate-400" style={{ fontSize: '10px' }}>{metric.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Actions Footer */}
                <div className="pt-3 flex justify-end gap-2.5" style={{ borderTop: '1px solid #F1F5F9' }}>
                  <button
                    onClick={() => {
                      setActiveDistributorListCompany(isExpanded ? null : company.companyCode);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    {isExpanded ? 'Hide Distributors' : 'View Distributors'}
                  </button>
                </div>

                {/* Distributor Mapping Panel */}
                {isExpanded && (
                  <div className="mt-3 rounded-lg p-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-slate-700 font-semibold text-xs">Distributors — {company.name}</span>
                      <button
                        onClick={() => setAssignModalCompany({ name: company.name, code: company.companyCode })}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white font-semibold transition-colors"
                        style={{ background: '#6366F1', fontSize: '10px' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#4F46E5')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#6366F1')}
                      >
                        <Plus size={10} />
                        Add Distributor
                      </button>
                    </div>

                    {assignedDistributors.length === 0 ? (
                      <div className="text-slate-400 text-center py-3" style={{ fontSize: '11px' }}>
                        No distributors assigned yet. Click "Add Distributor" to assign.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        {assignedDistributors.map(d => (
                          <button
                            key={d.code}
                            onClick={() => onDistributorDrillDown(d.code)}
                            className="rounded-md px-2 py-1 text-slate-600 text-xs text-left transition-all hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 active:scale-[0.98]"
                            style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', cursor: 'pointer' }}
                            title={`View orders for ${d.code}`}
                          >
                            <span className="flex items-center justify-between gap-1">
                              <span>{d.code}</span>
                              <span style={{ fontSize: '9px', opacity: 0.5 }}>→</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Assign Distributor Modal */}
      {assignModalCompany && (
        <AssignDistributorModal
          companyName={assignModalCompany.name}
          companyCode={assignModalCompany.code}
          onClose={() => setAssignModalCompany(null)}
          onAssigned={handleAssigned}
        />
      )}

      {/* Add Company Modal */}
      {showAddCompanyModal && (
        <CreateCompanyModal
          onClose={() => setShowAddCompanyModal(false)}
          onCreated={handleCompanyCreated}
        />
      )}
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <KPICard title="Total Orders"     value={snap.totalOrders.toLocaleString()}   icon={ShoppingCart} trend={{ value: 12.5, isPositive: true }} subtitle="This week" accentColor="#7C3AED" sparkData={[245,312,280,390,420,350,285]} />
        <KPICard title="Invoice Value"    value={snap.invoiceValue}                   icon={DollarSign}   trend={{ value: 14.2, isPositive: true }} subtitle="This week" accentColor="#059669" sparkData={[22,24,23,26,26,28,28]} />
        <KPICard title="Delivery Rate"    value={`${((snap.fulfilledOrders / snap.totalOrders) * 100).toFixed(1)}%`} icon={CheckCircle} trend={{ value: 2.3, isPositive: true }} subtitle="Platform-wide" accentColor="#10B981" sparkData={[92,94.5,93,95,94.2,95.1,94.2]} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <KPICard title="Return Rate" value={`${snap.returnRate}%`} icon={Package} trend={{ value: 0.8, isPositive: false }} subtitle="This week" accentColor="#FB923C" />
      </div>

      {/* Fleet Utilization Gauges — compact inline strip */}
      <div className="flex">
        <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #E2E8F0', maxWidth: 460, width: '100%' }}>
          <div className="text-slate-800 text-sm font-semibold mb-0.5">Fleet Utilization</div>
          <div className="text-slate-400 mb-3" style={{ fontSize: '11px' }}>Vehicle · time · delivery point efficiency against targets</div>
          <div className="grid grid-cols-3 gap-2">
            {UTIL_METRICS.map(u => (
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

export default function DashboardOverview({
  role,
  filters,
  onFiltersChange,
  onViewChange,
  onDistributorDrillDown,
}: {
  role: Role;
  filters: GlobalFilters;
  onFiltersChange: (f: GlobalFilters) => void;
  onViewChange: (v: string) => void;
  onDistributorDrillDown: (code: string) => void;
}) {
  if (role === 'super_admin') {
    return (
      <SuperAdminDashboard
        filters={filters}
        onDistributorDrillDown={onDistributorDrillDown}
      />
    );
  }
  return <CompanyAdminDashboard filters={filters} />;
}
