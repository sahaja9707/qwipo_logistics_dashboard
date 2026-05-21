import { useState } from 'react';
import type { Role } from '../App';
import { Bell, Clock, Filter, ChevronDown, ChevronRight, AlertOctagon, MapPin, TrendingDown, Zap, AlertTriangle, TrendingUp, X } from 'lucide-react';


const allAlerts = [
  { id: 1, type: 'Delayed Delivery', severity: 'critical', category: 'delivery', title: '14 orders past D2 threshold in Andheri', detail: 'Andheri branch has 14 orders past D2 aging — 3 approaching D4+. Immediate driver reassignment recommended.', time: '8 min ago', branch: 'Andheri', actionable: true },
  { id: 2, type: 'High Return Rate', severity: 'high', category: 'delivery', title: 'Malad branch return rate at 18.1%', detail: 'Return rate exceeded 12% threshold. Top return driver: Vikram Nair (16.7%). Review routing and customer addresses.', time: '23 min ago', branch: 'Malad', actionable: true },
  { id: 3, type: 'SIM Card Changed', severity: 'critical', category: 'vehicle', title: 'Device tamper alert — TRP-3839 / MH-04-T-3312', detail: 'SIM card replaced mid-trip on vehicle MH-04-T-3312. Possible unauthorized activity. Trip halted for review.', time: '3h 05m ago', branch: 'Goregaon', actionable: true },
  { id: 4, type: 'Runtime Exceeded', severity: 'high', category: 'trip', title: 'TRP-3847 exceeded planned runtime by 2.4 hrs', detail: 'Trip with 38 stops planned for 6h window is now at 8.4h. Driver: Ramesh Kumar. Vehicle: MH-04-T-7823.', time: '1h 23m ago', branch: 'Andheri', actionable: false },
  { id: 5, type: 'Route Deviation', severity: 'medium', category: 'vehicle', title: 'MH-04-AB-5678 deviated 4.2 km from planned route', detail: 'Vehicle detected off-route near Goregaon West. No customer stops recorded in deviation zone. Driver: Anand Singh.', time: '2h 11m ago', branch: 'Goregaon', actionable: false },
  { id: 6, type: 'Vehicle Underutilization', severity: 'low', category: 'fleet', title: '3 vehicles below 60% utilization today', detail: 'Vehicles MH-04-T-0012, MH-04-AB-4411, MH-04-T-8877 have utilization below 60% threshold. Consider rebalancing.', time: '4h 30m ago', branch: 'Bhandup', actionable: false },
  { id: 7, type: 'Engine Idle', severity: 'low', category: 'vehicle', title: 'MH-04-T-4421 idle for 47 min at Malad West', detail: 'Vehicle idle time exceeded 30-minute threshold. Driver: Suresh Patil. No delivery recorded at stop.', time: '4h 40m ago', branch: 'Malad', actionable: false },
  { id: 8, type: 'Delivery Failure Spike', severity: 'high', category: 'delivery', title: 'Thane branch delivery failures +40% vs last week', detail: 'Delivery failure rate spiked to 8.9% vs 6.4% last week. Peak failure hour: 14:00–16:00.', time: '6h 12m ago', branch: 'Thane', actionable: true },
];

const severityConfig: Record<string, { color: string; bg: string; dot: string; border: string }> = {
  critical: { color: '#DC2626', bg: '#FEF2F2', dot: '#EF4444', border: '#FECACA' },
  high:     { color: '#D97706', bg: '#FFFBEB', dot: '#F59E0B', border: '#FDE68A' },
  medium:   { color: '#2563EB', bg: '#EFF6FF', dot: '#3B82F6', border: '#BFDBFE' },
  low:      { color: '#6B7280', bg: '#F9FAFB', dot: '#9CA3AF', border: '#E5E7EB' },
};

const categories = ['All', 'delivery', 'vehicle', 'trip', 'fleet'];
const severities  = ['All', 'critical', 'high', 'medium', 'low'];
type AlertItem = typeof allAlerts[0];

function ExpandedAnomalyPanel({ alert, onClose }: { alert: AlertItem; onClose: () => void }) {
  const sc = severityConfig[alert.severity];
  const estimatedLoss = alert.severity === 'critical' ? '₹2.1L' : alert.severity === 'high' ? '₹84K' : alert.severity === 'medium' ? '₹31K' : '₹9K';
  const source = alert.category === 'delivery' ? 'Delivery Aging Monitor' : alert.category === 'vehicle' ? 'Vehicle Telemetry' : alert.category === 'trip' ? 'Trip Monitor' : 'Fleet Utilization Engine';
  const recommendedAction = alert.actionable
    ? 'Escalate to operations lead, assign owner, and execute corrective action within SLA.'
    : 'Monitor for one more cycle and escalate only if recurrence persists.';

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: `1.5px solid ${sc.border}` }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ background: sc.bg, borderBottom: `1px solid ${sc.border}` }}>
        <div className="flex items-center gap-2.5">
          <AlertOctagon size={15} style={{ color: sc.color }} />
          <span className="font-semibold" style={{ fontSize: '13px', color: sc.color }}>{alert.title}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold capitalize" style={{ background: sc.color, color: '#fff' }}>{alert.severity}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/60 text-slate-400 transition-colors"><X size={15} /></button>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, label: 'Distributor', value: alert.branch },
              { icon: Clock, label: 'Detected', value: alert.time },
              { icon: TrendingDown, label: 'Est. Financial Loss', value: estimatedLoss },
              { icon: Zap, label: 'Source', value: source },
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
            <p className="text-slate-600 leading-relaxed" style={{ fontSize: '12px' }}>{alert.detail}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg p-3" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <TrendingUp size={11} style={{ color: '#6366F1' }} />
              <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details & Root Cause</span>
            </div>
            <p className="text-slate-600 leading-relaxed" style={{ fontSize: '12px' }}>{alert.detail}</p>
          </div>

          <div className="rounded-lg p-3" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <ChevronRight size={11} style={{ color: '#059669' }} />
              <span style={{ fontSize: '10px', color: '#059669', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended Action</span>
            </div>
            <p className="text-emerald-800 leading-relaxed" style={{ fontSize: '12px' }}>{recommendedAction}</p>
          </div>

          <div className="flex gap-2 pt-1">
            <button className="flex-1 py-2 rounded-lg font-medium text-white transition-colors" style={{ background: '#DC2626', fontSize: '12px' }}>
              Escalate
            </button>
            <button className="flex-1 py-2 rounded-lg font-medium transition-colors" style={{ background: '#F1F5F9', color: '#475569', fontSize: '12px' }}>
              Mark Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Alert type options for the dropdown
const alertTypeOptions = ['All Types', ...Array.from(new Set(allAlerts.map(a => a.type)))];

export default function AlertsExceptions({ role: _role }: { role: Role }) {

  const [activeCat,  setActiveCat]  = useState('All');
  const [activeSev,  setActiveSev]  = useState('All');
  const [activeType, setActiveType] = useState('All Types');

  // Dropdown states
  const [catDropOpen,  setCatDropOpen]  = useState(false);
  const [sevDropOpen,  setSevDropOpen]  = useState(false);
  const [typeDropOpen, setTypeDropOpen] = useState(false);
  const [expandedAlertId, setExpandedAlertId] = useState<number | null>(null);

  const filtered = allAlerts.filter(a => {
    const catOk  = activeCat  === 'All'       || a.category === activeCat;
    const sevOk  = activeSev  === 'All'       || a.severity === activeSev;
    const typeOk = activeType === 'All Types' || a.type     === activeType;
    return catOk && sevOk && typeOk;
  });

  const counts = {
    critical: allAlerts.filter(a => a.severity === 'critical').length,
    high:     allAlerts.filter(a => a.severity === 'high').length,
    medium:   allAlerts.filter(a => a.severity === 'medium').length,
    low:      allAlerts.filter(a => a.severity === 'low').length,
  };

  function DropdownFilter({
    label, value, options, onChange, open, onToggle,
  }: {
    label: string; value: string; options: string[];
    onChange: (v: string) => void; open: boolean; onToggle: () => void;
  }) {
    const isActive = value !== options[0];
    return (
      <div className="relative">
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
          style={{
            border: `1px solid ${isActive ? '#6366F1' : '#E2E8F0'}`,
            fontSize: '11px',
            color: isActive ? '#4F46E5' : '#64748B',
            background: isActive ? '#F5F3FF' : '#fff',
          }}
        >
          <span className="truncate" style={{ maxWidth: 90 }}>
            {value === options[0] ? label : value.length > 12 ? value.slice(0, 12) + '…' : value}
          </span>
          <ChevronDown size={10} style={{ flexShrink: 0 }} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={onToggle} />
            <div className="absolute left-0 top-9 bg-white rounded-xl shadow-xl z-50 overflow-hidden" style={{ border: '1px solid #E2E8F0', minWidth: 160 }}>
              {options.map(opt => (
                <div
                  key={opt}
                  className="px-3 py-2 cursor-pointer hover:bg-indigo-50 transition-colors capitalize"
                  style={{ fontSize: '12px', color: opt === value ? '#4F46E5' : '#374151', background: opt === value ? '#EEF2FF' : 'transparent' }}
                  onClick={() => { onChange(opt); onToggle(); }}
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

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.entries(counts) as Array<[string, number]>).map(([sev, count]) => {
          const sc = severityConfig[sev];
          const isActive = activeSev === sev;
          return (
            <button
              key={sev}
              onClick={() => setActiveSev(isActive ? 'All' : sev)}
              className="bg-white rounded-xl p-4 shadow-sm text-left transition-all hover:shadow-md"
              style={{
                border: `1px solid ${isActive ? sc.dot : '#E2E8F0'}`,
                borderLeftWidth: '3px',
                borderLeftColor: sc.dot,
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-500 capitalize" style={{ fontSize: '11px' }}>{sev}</span>
                <div className="w-2 h-2 rounded-full" style={{ background: sc.dot }} />
              </div>
              <div className="text-slate-800 font-bold" style={{ fontSize: '1.5rem' }}>{count}</div>
              <div className="text-slate-400" style={{ fontSize: '10px' }}>active alerts</div>
            </button>
          );
        })}
      </div>

      {/* Filter bar — now with dropdowns */}
      <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-3" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-slate-400" />
          <span className="text-slate-500 font-medium" style={{ fontSize: '11px' }}>Filters</span>
        </div>

        <DropdownFilter
          label="Category"
          value={activeCat === 'All' ? 'All' : activeCat}
          options={categories.map(c => c)}
          onChange={v => setActiveCat(v)}
          open={catDropOpen}
          onToggle={() => { setCatDropOpen(o => !o); setSevDropOpen(false); setTypeDropOpen(false); }}
        />

        <DropdownFilter
          label="Severity"
          value={activeSev === 'All' ? 'All' : activeSev}
          options={severities}
          onChange={v => setActiveSev(v)}
          open={sevDropOpen}
          onToggle={() => { setSevDropOpen(o => !o); setCatDropOpen(false); setTypeDropOpen(false); }}
        />

        <DropdownFilter
          label="Alert Type"
          value={activeType}
          options={alertTypeOptions}
          onChange={v => setActiveType(v)}
          open={typeDropOpen}
          onToggle={() => { setTypeDropOpen(o => !o); setCatDropOpen(false); setSevDropOpen(false); }}
        />

        {/* Active filters pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {activeCat !== 'All' && (
            <span
              className="px-2 py-0.5 rounded-full capitalize cursor-pointer hover:opacity-80"
              style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '11px', border: '1px solid #C7D2FE' }}
              onClick={() => setActiveCat('All')}
            >
              {activeCat} ×
            </span>
          )}
          {activeSev !== 'All' && (
            <span
              className="px-2 py-0.5 rounded-full capitalize cursor-pointer hover:opacity-80"
              style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '11px', border: '1px solid #C7D2FE' }}
              onClick={() => setActiveSev('All')}
            >
              {activeSev} ×
            </span>
          )}
          {activeType !== 'All Types' && (
            <span
              className="px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80"
              style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '11px', border: '1px solid #C7D2FE' }}
              onClick={() => setActiveType('All Types')}
            >
              {activeType.length > 16 ? activeType.slice(0, 16) + '…' : activeType} ×
            </span>
          )}
        </div>

        <div className="ml-auto text-slate-400" style={{ fontSize: '11px' }}>{filtered.length} alerts</div>
      </div>

      {/* Alert timeline */}
      <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between p-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div className="text-slate-800 text-sm font-semibold">Alert Timeline</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Operational exceptions and anomalies</div>
          </div>
          <button className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors" style={{ fontSize: '11px' }}>
            <Bell size={12} /> Mark all read
          </button>
        </div>

        {filtered.length === 0 && (
          <div className="p-10 text-center text-slate-400" style={{ fontSize: '13px' }}>No alerts match current filters</div>
        )}

        {filtered.map((alert, i) => {
          const sc = severityConfig[alert.severity];
          const isOpen = expandedAlertId === alert.id;
          return (
            <div
              key={alert.id}
              className="p-5 hover:bg-slate-50 transition-colors"
              style={{ borderTop: i === 0 ? 'none' : '1px solid #F8FAFC' }}
            >
              <button className="w-full text-left" onClick={() => setExpandedAlertId(isOpen ? null : alert.id)}>
              <div className="flex items-start gap-4">
                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-1 flex-shrink-0" style={{ width: 16 }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: sc.dot }} />
                  {i < filtered.length - 1 && <div className="w-px flex-1 mt-2" style={{ background: '#F1F5F9', minHeight: 20 }} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1.5">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="px-1.5 py-0.5 rounded font-medium"
                          style={{ background: sc.bg, color: sc.color, fontSize: '10px', border: `1px solid ${sc.border}` }}
                        >
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-slate-400" style={{ fontSize: '11px' }}>{alert.type}</span>
                        <span className="text-slate-300" style={{ fontSize: '11px' }}>·</span>
                        <span className="text-slate-400" style={{ fontSize: '11px' }}>{alert.branch}</span>
                      </div>
                      <div className="text-slate-700 font-medium" style={{ fontSize: '13px' }}>{alert.title}</div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 flex-shrink-0" style={{ fontSize: '11px' }}>
                      <span className="flex items-center gap-1"><Clock size={10} />{alert.time}</span>
                      <ChevronRight size={14} className="transition-transform" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                    </div>
                  </div>

                  <p className="text-slate-500 leading-snug mb-2" style={{ fontSize: '11px' }}>{alert.detail}</p>

                  {alert.actionable && (
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 rounded-lg font-medium transition-colors"
                        style={{ background: '#EEF2FF', color: '#6366F1', fontSize: '11px' }}
                      >
                        Take Action
                      </button>
                      <button
                        className="px-3 py-1 rounded-lg font-medium transition-colors"
                        style={{ background: '#F1F5F9', color: '#64748B', fontSize: '11px' }}
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div> 
              </div>
              </button>
              {isOpen && (
                <div className="mt-2 ml-5">
                  <ExpandedAnomalyPanel alert={alert} onClose={() => setExpandedAlertId(null)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
