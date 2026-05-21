import { useState, useRef, useEffect } from 'react';
import type { Role } from '../App';
import { Download, Calendar, Filter, BarChart2, Truck, ShoppingCart, Users, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Date Range Picker ───────────────────────────────────────────────────────

function formatDate(d: Date) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBetween(d: Date, start: Date, end: Date) {
  return d > start && d < end;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
  onClose: () => void;
}

function DateRangePicker({ startDate, endDate, onChange, onClose }: DateRangePickerProps) {
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

  function daysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }
  function firstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  function handleDayClick(d: Date) {
    if (selecting === 'start') {
      setTempStart(d);
      setTempEnd(d);
      setSelecting('end');
    } else {
      if (d < tempStart) {
        setTempStart(d);
        setSelecting('end');
      } else {
        setTempEnd(d);
        setSelecting('start');
      }
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const days = daysInMonth(viewYear, viewMonth);
  const firstDay = firstDayOfMonth(viewYear, viewMonth);
  const effectiveEnd = selecting === 'end' && hoverDate ? (hoverDate >= tempStart ? hoverDate : tempStart) : tempEnd;

  const presets = [
    { label: 'Last 7 days', fn: () => { const s = new Date(today); s.setDate(today.getDate()-6); return [s, today]; } },
    { label: 'This month',  fn: () => { return [new Date(today.getFullYear(), today.getMonth(), 1), today]; } },
    { label: 'Last month',  fn: () => { const s = new Date(today.getFullYear(), today.getMonth()-1, 1); const e = new Date(today.getFullYear(), today.getMonth(), 0); return [s, e]; } },
    { label: 'Last 3 months', fn: () => { const s = new Date(today); s.setMonth(today.getMonth()-3); return [s, today]; } },
  ] as const;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-10 bg-white rounded-2xl shadow-2xl z-50 flex overflow-hidden"
      style={{ border: '1px solid #E2E8F0', minWidth: 340 }}
    >
      {/* Presets */}
      <div className="flex flex-col gap-0.5 p-3 border-r border-slate-100" style={{ minWidth: 130 }}>
        <div className="px-2 py-1 mb-1" style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Select</div>
        {presets.map(p => (
          <button
            key={p.label}
            className="text-left px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
            style={{ fontSize: '12px', color: '#475569' }}
            onClick={() => { const [s, e] = p.fn(); setTempStart(s); setTempEnd(e); setViewYear(s.getFullYear()); setViewMonth(s.getMonth()); setSelecting('start'); }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="p-4" style={{ minWidth: 230 }}>
        {/* Month nav */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-slate-100 transition-colors"><ChevronLeft size={14} style={{ color: '#64748B' }} /></button>
          <span className="font-semibold text-slate-700" style={{ fontSize: '13px' }}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
          <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-slate-100 transition-colors"><ChevronRight size={14} style={{ color: '#64748B' }} /></button>
        </div>
        {/* Day names */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map(d => <div key={d} className="text-center text-slate-400 font-medium" style={{ fontSize: '10px', padding: '2px 0' }}>{d}</div>)}
        </div>
        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`pad-${i}`} />)}
          {Array.from({ length: days }).map((_, i) => {
            const d = new Date(viewYear, viewMonth, i + 1);
            const isStart = sameDay(d, tempStart);
            const isEnd = sameDay(d, effectiveEnd);
            const inRange = isBetween(d, tempStart, effectiveEnd);
            const isToday = sameDay(d, today);
            return (
              <button
                key={i}
                onClick={() => handleDayClick(d)}
                onMouseEnter={() => setHoverDate(d)}
                onMouseLeave={() => setHoverDate(null)}
                className="relative flex items-center justify-center transition-colors"
                style={{
                  height: 30,
                  fontSize: '12px',
                  fontWeight: isStart || isEnd ? 700 : 400,
                  color: isStart || isEnd ? '#fff' : inRange ? '#4F46E5' : isToday ? '#6366F1' : '#374151',
                  background: isStart || isEnd ? '#6366F1' : inRange ? '#EEF2FF' : 'transparent',
                  borderRadius: isStart ? '8px 0 0 8px' : isEnd ? '0 8px 8px 0' : inRange ? '0' : '8px',
                  outline: isToday && !isStart && !isEnd ? '1.5px solid #6366F1' : 'none',
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Selection hint */}
        <div className="mt-3 text-center" style={{ fontSize: '11px', color: '#94A3B8' }}>
          {selecting === 'start' ? 'Select start date' : 'Select end date'}
        </div>

        {/* Footer */}
        <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
          <div className="flex-1 rounded-lg px-2 py-1.5 text-center" style={{ background: '#F8FAFC', fontSize: '11px', color: '#475569' }}>
            {formatDate(tempStart)}
          </div>
          <span className="text-slate-300 self-center">→</span>
          <div className="flex-1 rounded-lg px-2 py-1.5 text-center" style={{ background: '#F8FAFC', fontSize: '11px', color: '#475569' }}>
            {formatDate(effectiveEnd)}
          </div>
        </div>
        <button
          className="w-full mt-2 py-2 rounded-xl text-white font-medium transition-colors"
          style={{ background: '#6366F1', fontSize: '12px' }}
          onClick={() => { onChange(tempStart, effectiveEnd); onClose(); }}
        >
          Apply Range
        </button>
      </div>
    </div>
  );
}

const reports = [
  {
    id: 1,
    name: 'Daily Operations Summary',
    type: 'Operations',
    generated: '17 May 2026, 7:00 AM',
    format: 'PDF',
    size: '1.2 MB',
    icon: BarChart2,
    fields: [
      'Trip Date', 'Number of Trips', 'Number of Vehicles', 'Total Trip (Km)',
      'Delivered', 'Returned', 'Returned : Cancelled', 'Returned : Delivery Retry',
      'Total Delivery Attempt', 'Net Sale Value', 'Total Net Sale',
      'Total Delivery Weight', 'Time Utilization', 'Delivery Point Utilization',
    ],
  },
  {
    id: 2,
    name: 'Driver Performance Report',
    type: 'Fleet',
    generated: '17 May 2026, 6:00 AM',
    format: 'Excel',
    size: '348 KB',
    icon: Truck,
    fields: [
      'Trip Date', 'Number of Trips', 'Total Delivery Attempt',
      'Delivered', 'Returned', 'Net Sale Value', 'Return Value', 'Total Net Sale',
      'Average Run Time (Min)', 'Average Run Time (Hr)',
    ],
  },
  {
    id: 3,
    name: 'Orders Summary Report',
    type: 'Orders',
    generated: '16 May 2026, 11:00 PM',
    format: 'PDF',
    size: '2.1 MB',
    icon: ShoppingCart,
    fields: [
      'Trip Date', 'Delivered', 'Returned',
      'Returned : Cancelled', 'Returned : Delivery Retry',
      'Total Delivery Attempt', 'Net Sale Value', 'Return Value', 'Total Net Sale',
    ],
  },
  {
    id: 4,
    name: 'Return Rate Analysis',
    type: 'Operations',
    generated: '16 May 2026, 6:00 PM',
    format: 'Excel',
    size: '410 KB',
    icon: BarChart2,
    fields: [
      'Trip Date', 'Delivered', 'Returned',
      'Returned : Cancelled', 'Returned : Delivery Retry',
      'Return Value', 'Total Net Sale', 'Net Sale Value',
    ],
  },
  {
    id: 5,
    name: 'Fleet Utilization Monthly',
    type: 'Fleet',
    generated: '01 May 2026, 6:00 AM',
    format: 'PDF',
    size: '3.4 MB',
    icon: Truck,
    fields: [
      'Trip Date', 'Number of Trips', 'Number of Vehicles', 'Total Trip (Km)',
      'Vehicle Vol. Capacity', 'Total Delivery Weight',
      'Weight Utilization', 'Delivery Point Utilization', 'Time Utilization',
      'Average Run Time (Min)', 'Average Run Time (Hr)',
    ],
  },
  {
    id: 6,
    name: 'Customer Delivery Report',
    type: 'Orders',
    generated: '17 May 2026, 12:00 PM',
    format: 'Excel',
    size: '892 KB',
    icon: Users,
    fields: [
      'Trip Date', 'Delivered', 'Returned', 'Total Delivery Attempt',
      'Net Sale Value', 'Return Value', 'Total Net Sale', 'Total Delivery Weight',
    ],
  },
];

// All 19 columns from the export spec
export const ALL_FIELDS = [
  'Trip Date', 'Number of Trips', 'Number of Vehicles', 'Total Trip (Km)',
  'Delivered', 'Returned', 'Returned : Cancelled', 'Returned : Delivery Retry',
  'Total Delivery Attempt', 'Net Sale Value', 'Return Value', 'Total Net Sale',
  'Total Delivery Weight', 'Vehicle Vol. Capacity',
  'Average Run Time (Min)', 'Average Run Time (Hr)',
  'Weight Utilization', 'Delivery Point Utilization', 'Time Utilization',
];

const typeColors: Record<string, { color: string; bg: string }> = {
  Operations: { color: '#6366F1', bg: '#EEF2FF' },
  Fleet: { color: '#0891B2', bg: '#F0F9FF' },
  Orders: { color: '#059669', bg: '#ECFDF5' },
};

type Report = typeof reports[0];

interface DownloadModalProps {
  report: Report;
  onClose: () => void;
}

function DownloadModal({ report, onClose }: DownloadModalProps) {
  const [sent, setSent] = useState(false);
  const [format, setFormat] = useState(report.format);
  const tc = typeColors[report.type];
  const Icon = report.icon;

  const handleAction = () => {
    setSent(true);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center" style={{ border: '1px solid #E2E8F0' }}>
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check size={26} className="text-emerald-600" />
          </div>
          <div className="text-slate-800 font-semibold mb-1" style={{ fontSize: '15px' }}>Downloading</div>
          <p className="text-slate-400 mb-6" style={{ fontSize: '12px' }}>
            {report.name} ({format}) is downloading.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-white font-medium"
            style={{ background: '#6366F1', fontSize: '13px' }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col" style={{ border: '1px solid #E2E8F0' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 flex-shrink-0" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tc.bg }}>
              <Icon size={16} style={{ color: tc.color }} />
            </div>
            <div>
              <div className="text-slate-800 font-semibold" style={{ fontSize: '13px' }}>{report.name}</div>
              <div className="text-slate-400" style={{ fontSize: '11px' }}>{report.generated} · {report.size}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Format selector */}
          <div>
            <label className="text-slate-600 font-medium mb-1.5 block" style={{ fontSize: '12px' }}>Export Format</label>
            <div className="flex gap-2">
              {['PDF', 'Excel', 'CSV'].map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className="flex-1 py-2 rounded-lg font-medium transition-all"
                  style={{
                    background: format === f ? '#6366F1' : '#F8FAFC',
                    color: format === f ? 'white' : '#64748B',
                    border: `1px solid ${format === f ? '#6366F1' : '#E2E8F0'}`,
                    fontSize: '12px',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Fields included */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-600 font-medium" style={{ fontSize: '12px' }}>
                Included Fields
              </label>
              <span className="text-slate-400" style={{ fontSize: '11px' }}>
                {report.fields.length} / {ALL_FIELDS.length} columns
              </span>
            </div>
            <div className="rounded-xl p-3 flex flex-wrap gap-1.5" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              {ALL_FIELDS.map(field => {
                const included = report.fields.includes(field);
                return (
                  <span
                    key={field}
                    className="px-2 py-0.5 rounded-md font-medium"
                    style={{
                      fontSize: '10px',
                      background: included ? tc.bg : '#F1F5F9',
                      color: included ? tc.color : '#94A3B8',
                      border: `1px solid ${included ? tc.color + '30' : 'transparent'}`,
                    }}
                  >
                    {included && <span className="mr-1">✓</span>}
                    {field}
                  </span>
                );
              })}
            </div>
            <div className="flex items-center gap-3 mt-2" style={{ fontSize: '10px', color: '#94A3B8' }}>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded" style={{ background: tc.bg, border: `1px solid ${tc.color}30`, display: 'inline-block' }} />
                Included in this report
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-slate-100 inline-block" />
                Not in this report
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center gap-2.5 p-5 pt-0 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-medium transition-colors"
            style={{ background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', fontSize: '13px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleAction}
            className="flex-1 py-2.5 rounded-xl font-medium text-white transition-colors flex items-center justify-center gap-2"
            style={{ background: '#6366F1', fontSize: '13px' }}
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Scheduled Reports Data ───────────────────────────────────────────────────

const scheduledReports = [
  { id: 1, name: 'Daily Operations Summary',  frequency: 'Daily',   nextRun: 'Today 11:30 PM', format: 'PDF',   lastRun: '20 May 2026', status: 'Active',  reportRef: reports[0] },
  { id: 2, name: 'Driver Performance Report', frequency: 'Weekly',  nextRun: 'Mon 9:00 AM',    format: 'Excel', lastRun: '18 May 2026', status: 'Active',  reportRef: reports[1] },
  { id: 3, name: 'Orders Summary Report',     frequency: 'Daily',   nextRun: 'Today 11:30 PM', format: 'PDF',   lastRun: '20 May 2026', status: 'Active',  reportRef: reports[2] },
  { id: 4, name: 'Return Rate Analysis',      frequency: 'Weekly',  nextRun: 'Mon 9:00 AM',    format: 'Excel', lastRun: '18 May 2026', status: 'Active',  reportRef: reports[3] },
  { id: 5, name: 'Fleet Utilization Monthly', frequency: 'Monthly', nextRun: '1 Jun 2026',     format: 'PDF',   lastRun: '1 May 2026',  status: 'Active',  reportRef: reports[4] },
  { id: 6, name: 'Customer Delivery Report',  frequency: 'Weekly',  nextRun: 'Mon 9:00 AM',    format: 'Excel', lastRun: '18 May 2026', status: 'Paused',  reportRef: reports[5] },
];

const freqColors: Record<string, { color: string; bg: string }> = {
  Daily:   { color: '#6366F1', bg: '#EEF2FF' },
  Weekly:  { color: '#0891B2', bg: '#F0F9FF' },
  Monthly: { color: '#059669', bg: '#ECFDF5' },
};

export default function ReportsModule({ role }: { role: Role }) {
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reportStart, setReportStart] = useState(new Date(2026, 4, 1));
  const [reportEnd, setReportEnd] = useState(new Date(2026, 4, 17));

  return (
    <div className="space-y-4">
      {activeReport && (
        <DownloadModal report={activeReport} onClose={() => setActiveReport(null)} />
      )}

      {/* Generate CTA */}
      <div
        className="bg-white rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4"
        style={{ border: '1px solid #E2E8F0' }}
      >
        <div>
          <div className="text-slate-800 text-sm font-semibold">Generate Custom Report</div>
          <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Select date range, module, and export format</div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Functional date range trigger */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(p => !p)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              style={{ border: `1px solid ${showDatePicker ? '#6366F1' : '#E2E8F0'}`, fontSize: '12px', color: showDatePicker ? '#6366F1' : '#64748B' }}
            >
              <Calendar size={13} style={{ color: showDatePicker ? '#6366F1' : '#94A3B8' }} />
              {formatDate(reportStart)} – {formatDate(reportEnd)}
            </button>
            {showDatePicker && (
              <DateRangePicker
                startDate={reportStart}
                endDate={reportEnd}
                onChange={(s, e) => { setReportStart(s); setReportEnd(e); }}
                onClose={() => setShowDatePicker(false)}
              />
            )}
          </div>
          <select className="px-3 py-1.5 rounded-lg outline-none bg-white" style={{ border: '1px solid #E2E8F0', fontSize: '12px', color: '#64748B' }}>
            <option>All Modules</option>
            <option>Orders</option>
            <option>Fleet</option>
            <option>Trips</option>
            <option>Distribution</option>
          </select>
          <select className="px-3 py-1.5 rounded-lg outline-none bg-white" style={{ border: '1px solid #E2E8F0', fontSize: '12px', color: '#64748B' }}>
            <option>PDF</option>
            <option>Excel</option>
            <option>CSV</option>
          </select>
          <button className="px-4 py-1.5 rounded-lg text-white font-medium" style={{ background: '#6366F1', fontSize: '12px' }}>
            Generate
          </button>
        </div>
      </div>

      {/* Scheduled Reports Table */}
      <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between p-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div className="text-slate-800 text-sm font-semibold">Scheduled Reports</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Automated reports running on schedule</div>
          </div>
          <span
            className="px-2.5 py-1 rounded-full font-semibold"
            style={{ background: '#ECFDF5', color: '#059669', fontSize: '11px' }}
          >
            {scheduledReports.filter(r => r.status === 'Active').length} active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 720 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                {['Report Name', 'Frequency', 'Next Run', 'Format', 'Last Run', 'Status', 'Actions'].map(col => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-slate-500 font-semibold"
                    style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scheduledReports.map((r, idx) => {
                const fc = freqColors[r.frequency] ?? { color: '#6366F1', bg: '#EEF2FF' };
                const isActive = r.status === 'Active';
                return (
                  <tr
                    key={r.id}
                    style={{
                      background: idx % 2 === 0 ? '#fff' : '#FAFAFA',
                      borderBottom: '1px solid #F1F5F9',
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="text-slate-700 font-medium" style={{ fontSize: '12px' }}>{r.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded font-medium"
                        style={{ fontSize: '10px', background: fc.bg, color: fc.color }}
                      >
                        {r.frequency}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600" style={{ fontSize: '12px' }}>{r.nextRun}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-500"
                        style={{ fontSize: '11px' }}
                      >
                        {r.format}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500" style={{ fontSize: '11px' }}>{r.lastRun}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2.5 py-1 rounded-full font-semibold"
                        style={{
                          fontSize: '10px',
                          background: isActive ? '#ECFDF5' : '#FEF3C7',
                          color: isActive ? '#059669' : '#D97706',
                          border: `1px solid ${isActive ? '#A7F3D0' : '#FDE68A'}`,
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setActiveReport(r.reportRef)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:bg-indigo-50 font-medium"
                        style={{ color: '#6366F1', fontSize: '11px', border: '1px solid #E0E7FF' }}
                      >
                        <Download size={12} /> Download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
