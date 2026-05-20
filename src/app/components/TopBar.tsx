import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, RefreshCw, Calendar, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import type { Role } from '../App';
import { type GlobalFilters, COMPANIES, STATE_CITIES, CITY_STATE, ALL_CITIES, getDistributorsForCity, getDistributorsForState } from '../data/filterData';

interface TopBarProps {
  role: Role;
  onRoleChange: (role: Role) => void;
  activeView: string;
  filters: GlobalFilters;
  onFiltersChange: (f: GlobalFilters) => void;
}

const pageTitles: Record<string, { title: string; sub: string }> = {
  orders:       { title: 'Orders',              sub: 'Order tracking, delivery aging and fulfillment' },
  distribution: { title: 'Distribution',        sub: 'Branch performance and driver analytics' },
  trips:        { title: 'Trips Monitoring',    sub: 'Live trips, KM tracking and anomalies' },
  alerts:       { title: 'Alerts & Exceptions', sub: 'Operational alerts and exception management' },
  reports:      { title: 'Reports',             sub: 'Scheduled and on-demand reports' },
  users:        { title: 'User Management',     sub: 'Manage users, roles and permissions' },
};

const dashboardTitles: Partial<Record<Role, { title: string; sub: string }>> = {
  company_admin: { title: 'Company Dashboard', sub: 'ITC — aggregated performance across distributor network' },
};

const roleMeta: Record<Role, { label: string; color: string; bg: string }> = {
  super_admin:      { label: 'Super Admin',      color: '#6366F1', bg: '#EEF2FF' },
  company_admin:    { label: 'Company Admin',    color: '#7C3AED', bg: '#F5F3FF' },
  distributor_admin:{ label: 'Distributor Admin',color: '#0891B2', bg: '#F0F9FF' },
  branch_manager:   { label: 'Branch Manager',   color: '#059669', bg: '#ECFDF5' },
  admin_support:    { label: 'Admin Support',    color: '#D97706', bg: '#FFFBEB' },
};

const allRoles: Role[] = ['super_admin', 'company_admin', 'distributor_admin', 'branch_manager', 'admin_support'];

// ─── Date Range Picker (same design as CustomReports section) ────────────────

function formatDate(d: Date) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isBetween(d: Date, start: Date, end: Date) {
  return d > start && d < end;
}
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function DateRangePicker({ startDate, endDate, onChange, onClose }: {
  startDate: Date; endDate: Date;
  onChange: (s: Date, e: Date) => void; onClose: () => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(startDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(startDate.getMonth());
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
  const effectiveEnd = selecting === 'end' && hoverDate ? (hoverDate >= tempStart ? hoverDate : tempStart) : tempEnd;

  function handleDayClick(d: Date) {
    if (selecting === 'start') { setTempStart(d); setTempEnd(d); setSelecting('end'); }
    else { if (d < tempStart) { setTempStart(d); setSelecting('end'); } else { setTempEnd(d); setSelecting('start'); } }
  }
  function prevMonth() { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }
  function nextMonth() { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }

  const presets = [
    { label: 'Last 7 days', fn: () => { const s = new Date(today); s.setDate(today.getDate()-6); return [s, today]; } },
    { label: 'This month',  fn: () => [new Date(today.getFullYear(), today.getMonth(), 1), today] },
    { label: 'Last month',  fn: () => { const s = new Date(today.getFullYear(), today.getMonth()-1, 1); const e = new Date(today.getFullYear(), today.getMonth(), 0); return [s, e]; } },
    { label: 'Last 3 months', fn: () => { const s = new Date(today); s.setMonth(today.getMonth()-3); return [s, today]; } },
  ] as const;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-10 bg-white rounded-2xl shadow-2xl z-50 flex overflow-hidden"
      style={{ border: '1px solid #E2E8F0', minWidth: 340 }}
    >
      <div className="flex flex-col gap-0.5 p-3 border-r border-slate-100" style={{ minWidth: 120 }}>
        <div className="px-2 py-1 mb-1" style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Select</div>
        {presets.map(p => (
          <button key={p.label} className="text-left px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors" style={{ fontSize: '12px', color: '#475569' }}
            onClick={() => { const [s, e] = p.fn(); setTempStart(s as Date); setTempEnd(e as Date); setViewYear((s as Date).getFullYear()); setViewMonth((s as Date).getMonth()); setSelecting('start'); }}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="p-4" style={{ minWidth: 230 }}>
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
            const isEnd = sameDay(d, effectiveEnd);
            const inRange = isBetween(d, tempStart, effectiveEnd);
            const isToday = sameDay(d, today);
            return (
              <button key={i} onClick={() => handleDayClick(d)} onMouseEnter={() => setHoverDate(d)} onMouseLeave={() => setHoverDate(null)}
                className="relative flex items-center justify-center transition-colors"
                style={{ height: 28, fontSize: '12px', fontWeight: isStart || isEnd ? 700 : 400,
                  color: isStart || isEnd ? '#fff' : inRange ? '#4F46E5' : isToday ? '#6366F1' : '#374151',
                  background: isStart || isEnd ? '#6366F1' : inRange ? '#EEF2FF' : 'transparent',
                  borderRadius: isStart ? '6px 0 0 6px' : isEnd ? '0 6px 6px 0' : inRange ? '0' : '6px',
                  outline: isToday && !isStart && !isEnd ? '1.5px solid #6366F1' : 'none' }}>
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
          <div className="flex-1 rounded-lg px-2 py-1.5 text-center" style={{ background: '#F8FAFC', fontSize: '11px', color: '#475569' }}>{formatDate(tempStart)}</div>
          <span className="text-slate-300 self-center">→</span>
          <div className="flex-1 rounded-lg px-2 py-1.5 text-center" style={{ background: '#F8FAFC', fontSize: '11px', color: '#475569' }}>{formatDate(effectiveEnd)}</div>
        </div>
        <button className="w-full mt-2 py-2 rounded-xl text-white font-medium" style={{ background: '#6366F1', fontSize: '12px' }}
          onClick={() => { onChange(tempStart, effectiveEnd); onClose(); }}>
          Apply Range
        </button>
      </div>
    </div>
  );
}

// ─── Global Filter Bar ────────────────────────────────────────────────────────

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
      {/* Labeled border label */}
      <span
        className="absolute -top-2 left-2 bg-white px-1"
        style={{ fontSize: '9px', color: value ? '#6366F1' : '#94A3B8', fontWeight: 600, pointerEvents: 'none' }}
      >
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

// ─── Main TopBar ──────────────────────────────────────────────────────────────

export default function TopBar({ role, onRoleChange, activeView, filters, onFiltersChange }: TopBarProps) {
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const page = activeView === 'dashboard'
    ? (dashboardTitles[role] ?? { title: 'Dashboard', sub: 'Overview' })
    : (pageTitles[activeView] ?? { title: 'Dashboard', sub: 'Overview' });
  const meta = roleMeta[role];

  const cityOptions = filters.state ? (STATE_CITIES[filters.state] ?? []) : ALL_CITIES;
  const distributorOptions = filters.city
    ? getDistributorsForCity(filters.city)
    : filters.state
    ? getDistributorsForState(filters.state)
    : [];
  // Show all distributors only when no city/state filter; otherwise show scoped list
  const effectiveDistributorOptions = distributorOptions.length > 0 ? distributorOptions : [];
  const activeFilterCount = [filters.company, filters.state, filters.city, filters.distributor].filter(Boolean).length;

  function updateFilter<K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) {
    const next = { ...filters, [key]: value };
    // When state changes, clear city and distributor
    if (key === 'state') { next.city = ''; next.distributor = ''; }
    // When city changes, auto-select its state and clear distributor
    if (key === 'city' && value) {
      const autoState = CITY_STATE[value as string];
      if (autoState) next.state = autoState;
      next.distributor = '';
    }
    // When city is cleared, also clear distributor
    if (key === 'city' && !value) next.distributor = '';
    onFiltersChange(next);
  }

  const dateLabel = `${formatDate(filters.dateFrom)} – ${formatDate(filters.dateTo)}`;

  return (
    <div className="bg-white flex-shrink-0 relative z-30" style={{ borderBottom: '1px solid #E2E8F0' }}>
      {/* Top row: page title + role/actions */}
      <div className="flex items-center justify-between px-6 py-2.5">
        <div>
          <div className="text-slate-800 text-sm font-semibold leading-none">{page.title}</div>
          <div className="text-slate-400 leading-none mt-0.5" style={{ fontSize: '11px' }}>{page.sub}</div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button className="p-1.5 rounded-lg transition-colors hover:bg-slate-50" style={{ border: '1px solid #E2E8F0', color: '#94A3B8' }}>
            <RefreshCw size={13} />
          </button>

          {/* Notifications */}
          <button className="relative p-1.5 rounded-lg transition-colors hover:bg-slate-50" style={{ border: '1px solid #E2E8F0', color: '#94A3B8' }}>
            <Bell size={13} />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full flex items-center justify-center" style={{ fontSize: '8px' }}>12</span>
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
          <FilterDropdown label="Company" value={filters.company} options={COMPANIES} onChange={v => updateFilter('company', v)} placeholder="Company" />
          <FilterDropdown label="State" value={filters.state} options={Object.keys(STATE_CITIES)} onChange={v => updateFilter('state', v)} placeholder="State" />
          <FilterDropdown label="City" value={filters.city} options={cityOptions} onChange={v => updateFilter('city', v)} placeholder="City" />
          <FilterDropdown
            label="Distributor"
            value={filters.distributor}
            options={effectiveDistributorOptions}
            onChange={v => updateFilter('distributor', v)}
            placeholder={filters.city || filters.state ? 'Distributor' : 'Select city first'}
          />

          {/* Date Range */}
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
              <ChevronDown size={10} style={{ flexShrink: 0 }} />
            </button>
            <span className="absolute -top-2 left-2 bg-white px-1" style={{ fontSize: '9px', color: '#6366F1', fontWeight: 600, pointerEvents: 'none' }}>
              Date Range
            </span>
            {showDatePicker && (
              <DateRangePicker
                startDate={filters.dateFrom}
                endDate={filters.dateTo}
                onChange={(s, e) => { updateFilter('dateFrom', s); updateFilter('dateTo', e); }}
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
