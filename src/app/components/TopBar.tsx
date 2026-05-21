import { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, ChevronDown, RefreshCw, Calendar, X, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import type { Role } from '../App';
import { type GlobalFilters, COMPANIES, STATE_CITIES, CITY_STATE, ALL_CITIES, getDistributorsForCity, getDistributorsForState, getDistributorsByZone, ALL_DISTRIBUTORS, ALL_DRIVERS } from '../data/filterData';

interface TopBarProps {
  role: Role;
  onRoleChange: (role: Role) => void;
  activeView: string;
  onViewChange: (view: string) => void;
  filters: GlobalFilters;
  onFiltersChange: (f: GlobalFilters) => void;
}

const pageTitles: Record<string, { title: string; sub: string }> = {
  orders:       { title: 'Orders',             sub: 'Order tracking, delivery aging and fulfillment' },
  distribution: { title: 'Distribution',       sub: 'Branch performance and driver analytics' },
  trips:        { title: 'Trips Monitoring',   sub: 'Live trips, KM tracking and anomalies' },
  reports:      { title: 'Reports',            sub: 'Scheduled and on-demand reports' },
  users:        { title: 'User Management',    sub: 'Manage users, roles and permissions' },
};

const dashboardTitles: Partial<Record<Role, { title: string; sub: string }>> = {
  company_admin: { title: 'Operations Command', sub: 'ITC — aggregated performance across distributor network' },
};

const roleMeta: Record<Role, { label: string; color: string; bg: string }> = {
  super_admin:      { label: 'Super Admin',      color: '#6366F1', bg: '#EEF2FF' },
  company_admin:    { label: 'Company Admin',    color: '#7C3AED', bg: '#F5F3FF' },
  distributor_admin:{ label: 'Distributor Admin',color: '#0891B2', bg: '#F0F9FF' },
  branch_manager:   { label: 'Branch Manager',   color: '#059669', bg: '#ECFDF5' },
  admin_support:    { label: 'Admin Support',    color: '#D97706', bg: '#FFFBEB' },
};

const allRoles: Role[] = ['super_admin', 'distributor_admin', 'branch_manager', 'admin_support'];

// ─── Date Picker (supports single-day and range) ──────────────────────────────

function formatDate(d: Date) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatDateShort(d: Date) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isBetween(d: Date, start: Date, end: Date) {
  return d > start && d < end;
}
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function DatePicker({ startDate, endDate, isSingleDay, onChange, onClose }: {
  startDate: Date; endDate: Date; isSingleDay: boolean;
  onChange: (s: Date, e: Date, single: boolean) => void; onClose: () => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(startDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(startDate.getMonth());
  const [mode, setMode] = useState<'single' | 'range'>(isSingleDay ? 'single' : 'range');
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const days = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const effectiveEnd = mode === 'range' && selecting === 'end' && hoverDate
    ? (hoverDate >= tempStart ? hoverDate : tempStart)
    : tempEnd;

  function handleDayClick(d: Date) {
    if (mode === 'single') {
      setTempStart(d);
      setTempEnd(d);
    } else {
      if (selecting === 'start') { setTempStart(d); setTempEnd(d); setSelecting('end'); }
      else { if (d < tempStart) { setTempStart(d); setSelecting('end'); } else { setTempEnd(d); setSelecting('start'); } }
    }
  }

  function prevMonth() { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }
  function nextMonth() { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }

  const presets = [
    { label: 'Today',        fn: () => [today, today, true]  as [Date, Date, boolean] },
    { label: 'Yesterday',    fn: () => { const d = new Date(today); d.setDate(today.getDate()-1); return [d, d, true] as [Date, Date, boolean]; } },
    { label: 'Last 7 days',  fn: () => { const s = new Date(today); s.setDate(today.getDate()-6); return [s, today, false] as [Date, Date, boolean]; } },
    { label: 'This month',   fn: () => [new Date(today.getFullYear(), today.getMonth(), 1), today, false] as [Date, Date, boolean] },
    { label: 'Last month',   fn: () => { const s = new Date(today.getFullYear(), today.getMonth()-1, 1); const e = new Date(today.getFullYear(), today.getMonth(), 0); return [s, e, false] as [Date, Date, boolean]; } },
    { label: 'Last 3 months',fn: () => { const s = new Date(today); s.setMonth(today.getMonth()-3); return [s, today, false] as [Date, Date, boolean]; } },
  ] as const;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-10 bg-white rounded-2xl shadow-2xl z-50 flex overflow-hidden"
      style={{ border: '1px solid #E2E8F0', minWidth: 360 }}
    >
      {/* Left panel: mode toggle + presets */}
      <div className="flex flex-col gap-0 p-3 border-r border-slate-100" style={{ minWidth: 130 }}>
        {/* Mode toggle */}
        <div className="flex rounded-lg overflow-hidden mb-3" style={{ border: '1px solid #E2E8F0' }}>
          {(['single', 'range'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setSelecting('start'); }}
              className="flex-1 py-1.5 transition-colors"
              style={{ fontSize: '10px', fontWeight: 600, background: mode === m ? '#6366F1' : '#fff', color: mode === m ? '#fff' : '#64748B' }}
            >
              {m === 'single' ? 'Single Day' : 'Range'}
            </button>
          ))}
        </div>
        <div className="px-2 py-1 mb-1" style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Select</div>
        {presets.map(p => (
          <button key={p.label} className="text-left px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors" style={{ fontSize: '11px', color: '#475569' }}
            onClick={() => {
              const [s, e, single] = p.fn();
              setTempStart(s as Date); setTempEnd(e as Date);
              setMode(single ? 'single' : 'range');
              setViewYear((s as Date).getFullYear()); setViewMonth((s as Date).getMonth()); setSelecting('start');
            }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Right panel: calendar */}
      <div className="p-4" style={{ minWidth: 240 }}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-slate-100"><ChevronLeft size={14} style={{ color: '#64748B' }} /></button>
          <span className="font-semibold text-slate-700" style={{ fontSize: '13px' }}>{FULL_MONTHS[viewMonth]} {viewYear}</span>
          <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-slate-100"><ChevronRight size={14} style={{ color: '#64748B' }} /></button>
        </div>
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map(d => <div key={d} className="text-center text-slate-400 font-medium" style={{ fontSize: '10px', padding: '2px 0' }}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`pad-${i}`} />)}
          {Array.from({ length: days }).map((_, i) => {
            const d = new Date(viewYear, viewMonth, i + 1);
            const isStart = sameDay(d, tempStart);
            const isEnd = mode === 'range' ? sameDay(d, effectiveEnd) : isStart;
            const inRange = mode === 'range' && isBetween(d, tempStart, effectiveEnd);
            const isToday = sameDay(d, today);
            return (
              <button key={i} onClick={() => handleDayClick(d)} onMouseEnter={() => setHoverDate(d)} onMouseLeave={() => setHoverDate(null)}
                className="relative flex items-center justify-center transition-colors"
                style={{ height: 28, fontSize: '12px', fontWeight: isStart || isEnd ? 700 : 400,
                  color: isStart || isEnd ? '#fff' : inRange ? '#4F46E5' : isToday ? '#6366F1' : '#374151',
                  background: isStart || isEnd ? '#6366F1' : inRange ? '#EEF2FF' : 'transparent',
                  borderRadius: isStart && mode === 'range' ? '6px 0 0 6px' : isEnd && mode === 'range' ? '0 6px 6px 0' : inRange ? '0' : '6px',
                  outline: isToday && !isStart && !isEnd ? '1.5px solid #6366F1' : 'none' }}>
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Selected range display */}
        <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
          {mode === 'single' ? (
            <div className="flex-1 rounded-lg px-2 py-1.5 text-center" style={{ background: '#F8FAFC', fontSize: '11px', color: '#475569' }}>
              {formatDate(tempStart)}
            </div>
          ) : (
            <>
              <div className="flex-1 rounded-lg px-2 py-1.5 text-center" style={{ background: '#F8FAFC', fontSize: '11px', color: '#475569' }}>{formatDate(tempStart)}</div>
              <span className="text-slate-300 self-center">→</span>
              <div className="flex-1 rounded-lg px-2 py-1.5 text-center" style={{ background: '#F8FAFC', fontSize: '11px', color: '#475569' }}>{formatDate(effectiveEnd)}</div>
            </>
          )}
        </div>

        <button className="w-full mt-2 py-2 rounded-xl text-white font-medium" style={{ background: '#6366F1', fontSize: '12px' }}
          onClick={() => {
            const isSingle = mode === 'single' || sameDay(tempStart, effectiveEnd);
            onChange(tempStart, isSingle ? tempStart : effectiveEnd, isSingle);
            onClose();
          }}>
          Apply {mode === 'single' ? 'Day' : 'Range'}
        </button>
      </div>
    </div>
  );
}

// ─── Grouped Distributor Dropdown (by zone) ───────────────────────────────────

function GroupedDistributorDropdown({ city, state, value, onChange }: {
  city: string; state: string; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Build grouped options
  const groups = city
    ? getDistributorsByZone(city)
    : state
    ? (() => {
        const dists = getDistributorsForState(state);
        return dists.reduce((acc, d) => {
          const key = `${d.city} · ${d.zone}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(d);
          return acc;
        }, {} as Record<string, typeof dists>);
      })()
    : null;

  const hasOptions = groups && Object.keys(groups).length > 0;
  const selectedDist = hasOptions
    ? Object.values(groups!).flat().find(d => d.code === value)
    : null;

  const placeholder = !city && !state ? 'Select city first' : 'Distributor';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => hasOptions && setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors"
        style={{
          border: `1px solid ${value ? '#6366F1' : '#E2E8F0'}`,
          fontSize: '11px',
          color: value ? '#4F46E5' : '#64748B',
          background: value ? '#F5F3FF' : '#fff',
          minWidth: 110,
          cursor: hasOptions ? 'pointer' : 'not-allowed',
          opacity: hasOptions ? 1 : 0.6,
        }}
      >
        <span className="truncate max-w-[90px]">{selectedDist ? selectedDist.code : placeholder}</span>
        {value ? (
          <X size={10} onClick={e => { e.stopPropagation(); onChange(''); }} style={{ color: '#94A3B8', flexShrink: 0 }} />
        ) : (
          <ChevronDown size={10} style={{ flexShrink: 0 }} />
        )}
      </button>
      <span className="absolute -top-2 left-2 bg-white px-1"
        style={{ fontSize: '9px', color: value ? '#6366F1' : '#94A3B8', fontWeight: 600, pointerEvents: 'none' }}>
        Distributor
      </span>

      {open && hasOptions && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-10 bg-white rounded-xl shadow-xl z-50 overflow-y-auto" style={{ border: '1px solid #E2E8F0', minWidth: 220, maxHeight: 280 }}>
            <div
              className="px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors"
              style={{ fontSize: '11px', color: '#94A3B8', borderBottom: '1px solid #F1F5F9' }}
              onClick={() => { onChange(''); setOpen(false); }}
            >
              All Distributors
            </div>
            {Object.entries(groups!).map(([zone, dists]) => (
              <div key={zone}>
                <div className="px-3 py-1.5 flex items-center gap-1.5" style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#0891B2', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{zone}</span>
                </div>
                {dists.map(d => (
                  <div
                    key={d.code}
                    className="px-3 py-2 cursor-pointer hover:bg-indigo-50 transition-colors"
                    style={{ fontSize: '11px', color: d.code === value ? '#4F46E5' : '#374151', background: d.code === value ? '#EEF2FF' : 'transparent' }}
                    onClick={() => { onChange(d.code); setOpen(false); }}
                  >
                    {d.code === value && <span className="mr-1.5" style={{ color: '#6366F1' }}>✓</span>}
                    <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>{d.code}</span>
                    <span className="block text-slate-400" style={{ fontSize: '10px' }}>{d.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Filter Dropdown ───────────────────────────────────────────────────────────

function FilterDropdown({ label, value, options, onChange, placeholder }: {
  label: string; value: string; options: string[];
  onChange: (v: string) => void; placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
        style={{
          border: `1px solid ${value ? '#6366F1' : '#E2E8F0'}`,
          fontSize: '11px',
          color: value ? '#4F46E5' : '#64748B',
          background: value ? '#F5F3FF' : '#fff',
          minWidth: 90,
        }}
      >
        <span className="truncate max-w-[80px]">{value || placeholder}</span>
        {value ? (
          <X size={10} onClick={e => { e.stopPropagation(); onChange(''); }} style={{ color: '#94A3B8', flexShrink: 0 }} />
        ) : (
          <ChevronDown size={10} style={{ flexShrink: 0 }} />
        )}
      </button>
      <span className="absolute -top-2 left-2 bg-white px-1" style={{ fontSize: '9px', color: value ? '#6366F1' : '#94A3B8', fontWeight: 600, pointerEvents: 'none' }}>
        {label}
      </span>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-10 bg-white rounded-xl shadow-xl z-50 overflow-hidden" style={{ border: '1px solid #E2E8F0', minWidth: 160 }}>
            <div
              className="px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors"
              style={{ fontSize: '12px', color: '#94A3B8' }}
              onClick={() => { onChange(''); setOpen(false); }}
            >
              All {label}s
            </div>
            {options.map(opt => (
              <div
                key={opt}
                className="px-3 py-2 cursor-pointer hover:bg-indigo-50 transition-colors"
                style={{ fontSize: '12px', color: opt === value ? '#4F46E5' : '#374151', background: opt === value ? '#EEF2FF' : 'transparent' }}
                onClick={() => { onChange(opt); setOpen(false); }}
              >
                {opt === value && <span className="mr-1.5" style={{ color: '#6366F1' }}>✓</span>}{opt}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Global Search Bar ────────────────────────────────────────────────────────

interface SearchItem {
  type: string;
  label: string;
  sub: string;
  view: string;
  code?: string;
  distributorCode?: string;
}

const typeColor: Record<string, string> = {
  Page: '#7C3AED', Order: '#6366F1', Distributor: '#0891B2', Trip: '#F59E0B', Driver: '#10B981', Report: '#64748B',
};

function GlobalSearch({ onSelect }: { onSelect: (item: SearchItem) => void }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const searchItems = useMemo(() => {
    const items: SearchItem[] = [];

    // 1. Pages / Views (Navigation options)
    items.push(
      { type: 'Page', label: 'Operations Command Dashboard', sub: 'Main operational metrics, utilization and KPIs', view: 'dashboard' },
      { type: 'Page', label: 'Dashboard', sub: 'Main operational metrics, utilization and KPIs', view: 'dashboard' },
      { type: 'Page', label: 'Orders Management', sub: 'Order status, delivery aging, returns and anomalies', view: 'orders' },
      { type: 'Page', label: 'Distribution Analytics', sub: 'Branch performance, driver analysis, distributor comparison', view: 'distribution' },
      { type: 'Page', label: 'Trips Monitoring', sub: 'Live trip status, KM tracking, runtime logs and driver leaderboard', view: 'trips' },
      { type: 'Page', label: 'Reports Module', sub: 'Scheduled auto-reports and custom downloads', view: 'reports' }
    );

    // 2. Distributors (from ALL_DISTRIBUTORS)
    ALL_DISTRIBUTORS.forEach(d => {
      items.push({
        type: 'Distributor',
        label: d.code,
        sub: `${d.name} · ${d.city}, ${d.state} (${d.zone})`,
        view: 'distribution',
        code: d.code,
      });
      items.push({
        type: 'Distributor',
        label: d.name,
        sub: `${d.code} · ${d.city}, ${d.state} (${d.zone})`,
        view: 'distribution',
        code: d.code,
      });
    });

    // 3. Drivers (from ALL_DRIVERS)
    ALL_DRIVERS.forEach(dr => {
      items.push({
        type: 'Driver',
        label: dr.name,
        sub: `${dr.vehicle} · Trips: ${dr.trips} · Km: ${dr.distanceKm} · Distributor: ${dr.distributor}`,
        view: 'trips',
        distributorCode: dr.distributor,
      });
    });

    // 4. Mock Orders
    const orderCodes = [
      { code: 'ORD-HYD-004-2291', dist: 'DIS-HYD-004', city: 'Hyderabad' },
      { code: 'ORD-MUM-012-8847', dist: 'DIS-MUM-012', city: 'Mumbai' },
      { code: 'ORD-BAN-007-3312', dist: 'DIS-BAN-007', city: 'Bengaluru' },
      { code: 'ORD-HYD-002-1188', dist: 'DIS-HYD-002', city: 'Hyderabad' },
      { code: 'ORD-CHN-003-9092', dist: 'DIS-CHN-003', city: 'Chennai' },
      { code: 'ORD-DEL-009-4451', dist: 'DIS-DEL-009', city: 'New Delhi' },
    ];
    orderCodes.forEach(o => {
      items.push({
        type: 'Order',
        label: o.code,
        sub: `${o.city} · Distributor: ${o.dist}`,
        view: 'orders',
        distributorCode: o.dist,
      });
    });

    // 5. Mock Trips
    const tripCodes = [
      { code: 'TRP-3847', dist: 'DIS-HYD-004', status: 'Runtime exceeded — HIGH' },
      { code: 'TRP-3841', dist: 'DIS-MUM-012', status: 'Route deviation — MEDIUM' },
      { code: 'TRP-9021', dist: 'DIS-BAN-007', status: 'On Time' },
      { code: 'TRP-4412', dist: 'DIS-DEL-009', status: 'Delayed' },
    ];
    tripCodes.forEach(t => {
      items.push({
        type: 'Trip',
        label: t.code,
        sub: `${t.status} · Distributor: ${t.dist}`,
        view: 'trips',
        distributorCode: t.dist,
      });
    });

    // 6. Reports
    const reportNames = [
      { name: 'Daily Operations Summary', type: 'PDF' },
      { name: 'Driver Performance Report', type: 'Excel' },
      { name: 'Orders Summary Report', type: 'PDF' },
      { name: 'Return Rate Analysis', type: 'Excel' },
      { name: 'Fleet Utilization Monthly', type: 'PDF' },
      { name: 'Customer Delivery Report', type: 'Excel' },
    ];
    reportNames.forEach(r => {
      items.push({
        type: 'Report',
        label: r.name,
        sub: `${r.type} Format · Automated schedule`,
        view: 'reports',
      });
    });

    return items;
  }, []);

  const results = query.trim().length >= 1
    ? searchItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.sub.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const grouped = results.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, typeof results>);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ border: '1px solid #E2E8F0', background: '#F8FAFC', width: 220 }}>
        <Search size={11} style={{ color: '#94A3B8', flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search orders, distributors, pages..."
          className="flex-1 bg-transparent outline-none text-slate-700"
          style={{ fontSize: '11px', minWidth: 0 }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }}>
            <X size={10} style={{ color: '#94A3B8' }} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 bg-white rounded-xl shadow-2xl z-50 overflow-hidden" style={{ border: '1px solid #E2E8F0', minWidth: 320, maxHeight: 320, overflowY: 'auto' }}>
            {Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <div className="px-3 py-1.5" style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: typeColor[type], textTransform: 'uppercase', letterSpacing: '0.07em' }}>{type}s</span>
                </div>
                {items.map((item, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-3 py-2 hover:bg-indigo-50 transition-colors"
                    onClick={() => { onSelect(item); setOpen(false); setQuery(''); }}
                  >
                    <div className="text-slate-700 font-medium" style={{ fontSize: '12px' }}>{item.label}</div>
                    <div className="text-slate-400" style={{ fontSize: '10px' }}>{item.sub}</div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main TopBar ──────────────────────────────────────────────────────────────

export default function TopBar({ role, onRoleChange, activeView, onViewChange, filters, onFiltersChange }: TopBarProps) {
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const page = activeView === 'dashboard'
    ? (dashboardTitles[role] ?? { title: 'Operations Command', sub: 'Overview' })
    : (pageTitles[activeView] ?? { title: 'Operations Command', sub: 'Overview' });
  const meta = roleMeta[role];

  const cityOptions = filters.state ? (STATE_CITIES[filters.state] ?? []) : ALL_CITIES;
  const activeFilterCount = [filters.company, filters.state, filters.city, filters.distributor].filter(Boolean).length;

  function updateFilter<K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) {
    const next = { ...filters, [key]: value };
    if (key === 'state') { next.city = ''; next.distributor = ''; }
    if (key === 'city' && value) {
      const autoState = CITY_STATE[value as string];
      if (autoState) next.state = autoState;
      next.distributor = '';
    }
    if (key === 'city' && !value) next.distributor = '';
    onFiltersChange(next);
  }

  const isSingleDayEffective = filters.singleDay || sameDay(filters.dateFrom, filters.dateTo);

  const dateLabel = isSingleDayEffective
    ? formatDateShort(filters.dateFrom)
    : `${formatDateShort(filters.dateFrom)} – ${formatDateShort(filters.dateTo)}`;

  const handleSearchSelect = (item: SearchItem) => {
    // 1. Navigate to view
    onViewChange(item.view);

    // 2. Set filters if needed
    if (item.type === 'Distributor') {
      const code = item.code || item.label;
      const dist = ALL_DISTRIBUTORS.find(d => d.code === code);
      if (dist) {
        onFiltersChange({
          ...filters,
          state: dist.state,
          city: dist.city,
          distributor: dist.code,
        });
      }
    } else if (item.type === 'Driver') {
      const driver = ALL_DRIVERS.find(d => d.name === item.label);
      if (driver) {
        const dist = ALL_DISTRIBUTORS.find(d => d.code === driver.distributor);
        if (dist) {
          onFiltersChange({
            ...filters,
            state: dist.state,
            city: dist.city,
            distributor: dist.code,
          });
        }
      }
    } else if (item.type === 'Order' || item.type === 'Trip') {
      const distCode = item.distributorCode;
      if (distCode) {
        const dist = ALL_DISTRIBUTORS.find(d => d.code === distCode);
        if (dist) {
          onFiltersChange({
            ...filters,
            state: dist.state,
            city: dist.city,
            distributor: dist.code,
          });
        }
      }
    }
  };

  return (
    <div className="bg-white flex-shrink-0 relative z-30" style={{ borderBottom: '1px solid #E2E8F0' }}>
      {/* Top row: page title + search + role/actions */}
      <div className="flex items-center justify-between px-6 py-2.5 gap-3">
        <div className="min-w-0">
          <div className="text-slate-800 text-sm font-semibold leading-none truncate">{page.title}</div>
          <div className="text-slate-400 leading-none mt-0.5 truncate" style={{ fontSize: '11px' }}>{page.sub}</div>
        </div>

        {/* Global Search */}
        <GlobalSearch onSelect={handleSearchSelect} />

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Refresh */}
          <button className="p-1.5 rounded-lg transition-colors hover:bg-slate-50" style={{ border: '1px solid #E2E8F0', color: '#94A3B8' }}>
            <RefreshCw size={13} />
          </button>



          {/* Role switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRolePicker(!showRolePicker)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}25` }}
            >
              {meta.label}
              <ChevronDown size={10} />
            </button>
            {showRolePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowRolePicker(false)} />
                <div className="absolute right-0 top-9 bg-white rounded-xl shadow-xl overflow-hidden z-50 w-52" style={{ border: '1px solid #E2E8F0' }}>
                  <div className="p-2">
                    <div className="px-2 py-1.5 mb-1" style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Switch role (demo)
                    </div>
                    {allRoles.map(r => {
                      const m = roleMeta[r];
                      return (
                        <button key={r} onClick={() => { onRoleChange(r); setShowRolePicker(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-left transition-colors">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                          <span className="text-slate-700 flex-1" style={{ fontSize: '12px' }}>{m.label}</span>
                          {r === role && <span style={{ color: '#6366F1', fontSize: '14px' }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div
        className="flex items-center gap-2 px-6 py-2 flex-wrap"
        style={{ background: '#FAFBFC', borderTop: '1px solid #F1F5F9' }}
      >
        <div className="flex items-center gap-1.5 flex-shrink-0" style={{ fontSize: '11px', color: '#94A3B8' }}>
          <Filter size={11} />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#6366F1', color: '#fff', fontSize: '9px' }}>
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-1">
          {role === 'super_admin' && activeView !== 'dashboard' && (
            <FilterDropdown label="Company" value={filters.company} options={COMPANIES} onChange={v => updateFilter('company', v)} placeholder="Company" />
          )}
          
          {role !== 'branch_manager' && !(role === 'super_admin' && activeView === 'dashboard' && !filters.company) && (
            <>
              <FilterDropdown label="State" value={filters.state} options={Object.keys(STATE_CITIES)} onChange={v => updateFilter('state', v)} placeholder="State" />
              <FilterDropdown label="City" value={filters.city} options={cityOptions} onChange={v => updateFilter('city', v)} placeholder="City" />
              <GroupedDistributorDropdown
                city={filters.city}
                state={filters.state}
                value={filters.distributor}
                onChange={v => updateFilter('distributor', v)}
              />
            </>
          )}

          {/* Date filter */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(p => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              style={{
                border: `1px solid ${showDatePicker ? '#6366F1' : '#E2E8F0'}`,
                fontSize: '11px',
                color: showDatePicker ? '#4F46E5' : '#64748B',
                background: showDatePicker ? '#F5F3FF' : '#fff',
              }}
            >
              <Calendar size={11} style={{ color: '#6366F1', flexShrink: 0 }} />
              <span>{dateLabel}</span>
              {isSingleDayEffective && (
                <span className="px-1 rounded text-white" style={{ fontSize: '8px', background: '#6366F1', marginLeft: 2 }}>1D</span>
              )}
              <ChevronDown size={10} style={{ flexShrink: 0 }} />
            </button>
            <span className="absolute -top-2 left-2 bg-white px-1" style={{ fontSize: '9px', color: '#6366F1', fontWeight: 600, pointerEvents: 'none' }}>
              {isSingleDayEffective ? 'Single Day' : 'Date Range'}
            </span>
            {showDatePicker && (
              <DatePicker
                startDate={filters.dateFrom}
                endDate={filters.dateTo}
                isSingleDay={isSingleDayEffective}
                onChange={(s, e, single) => {
                  onFiltersChange({ ...filters, dateFrom: s, dateTo: e, singleDay: single });
                }}
                onClose={() => setShowDatePicker(false)}
              />
            )}
          </div>

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => onFiltersChange({ ...filters, company: '', state: '', city: '', distributor: '' })}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              style={{ fontSize: '11px', color: '#EF4444', border: '1px solid #FCA5A5' }}
            >
              <X size={10} /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
