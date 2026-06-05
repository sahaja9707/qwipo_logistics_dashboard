import { useState } from 'react';
import type { Role } from '../App';
import { Download, CheckCircle2, X } from 'lucide-react';

const REPORT_ITEMS = [
  { id: 'kpi-summary',       label: 'KPI Summary'              },
  { id: 'order-status',      label: 'Order Status'             },
  { id: 'weekly-trend',      label: 'Weekly Trend'             },
  { id: 'fleet-utilization', label: 'Fleet Utilization'        },
  { id: 'delivery-aging',    label: 'Delivery Aging Matrix'    },
  { id: 'category-contrib',  label: 'Category Contribution'    },
  { id: 'dist-performance',  label: 'Distributor Performance'  },
  { id: 'retailer-returns',  label: 'Retailer Returns'         },
  { id: 'returns-breakdown', label: 'Returns Breakdown'        },
  { id: 'order-trend',       label: 'Order Volume Trend'       },
  { id: 'sales-digital',     label: 'Sales vs Digital'         },
  { id: 'company-overview',  label: 'Companies Overview'       },
];

const RECENT_HISTORY = [
  { id: 1, name: 'KPI + Order Status + Weekly Trend',    time: '2h ago',    sections: 3  },
  { id: 2, name: 'Fleet Util + Distributor Performance', time: 'Yesterday', sections: 2  },
  { id: 3, name: 'Full Export — All Sections',           time: '2 days ago', sections: 12 },
];

export default function ReportsModule({ role }: { role: Role }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);

  const toggle = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleDownload = () => {
    if (!selected.size) return;
    setDownloading(true);
    setTimeout(() => setDownloading(false), 1600);
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-800">Reports</h2>
        <p className="text-slate-400 text-xs mt-0.5">Pick the sections you want, then download as a PDF.</p>
      </div>

      {/* Section selector card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">

        {/* Toolbar row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sections</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelected(new Set(REPORT_ITEMS.map(r => r.id)))}
              className="text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
            >
              All
            </button>
            <span className="text-slate-200">|</span>
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-slate-400 font-medium hover:text-slate-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Breadcrumb chips */}
        <div className="flex flex-wrap gap-2">
          {REPORT_ITEMS.map(item => {
            const active = selected.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {item.label}
                {active && <X size={10} strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>

        {/* Download row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            {selected.size === 0
              ? 'No sections selected'
              : `${selected.size} section${selected.size > 1 ? 's' : ''} selected`}
          </span>
          <button
            onClick={handleDownload}
            disabled={selected.size === 0 || downloading}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              selected.size === 0 || downloading
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
            }`}
          >
            <Download size={13} />
            {downloading ? 'Generating…' : 'Download'}
          </button>
        </div>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent History</span>
        </div>
        {RECENT_HISTORY.map((rpt, i) => (
          <div
            key={rpt.id}
            className={`px-5 py-3 flex items-center justify-between gap-3 ${i !== 0 ? 'border-t border-slate-100' : ''}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{rpt.name}</p>
                <p className="text-xs text-slate-400">{rpt.sections} sections · {rpt.time}</p>
              </div>
            </div>
            <button className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors flex-shrink-0 font-medium">
              <Download size={12} />
              Re-download
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
