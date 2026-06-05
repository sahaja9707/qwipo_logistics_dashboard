import { useState } from 'react';
import type { Role } from '../App';
import { Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

const SKU_DATA = [
  { sku: 'SKU-ITC-001', name: 'Sunfeast Dark Fantasy Choco Fills 75g', category: 'Biscuits', brand: 'Sunfeast', price: '₹30', stock: 1240 },
  { sku: 'SKU-ITC-002', name: 'Bingo Mad Angles Achaari Masti 60g', category: 'Snacks', brand: 'Bingo', price: '₹20', stock: 890 },
  { sku: 'SKU-ITC-003', name: 'Aashirvaad Atta 5kg', category: 'Staples', brand: 'Aashirvaad', price: '₹250', stock: 430 },
  { sku: 'SKU-ITC-004', name: 'Fiama Shower Gel 200ml', category: 'Personal Care', brand: 'Fiama', price: '₹175', stock: 610 },
  { sku: 'SKU-ITC-005', name: 'Engage Deo Spray 150ml', category: 'Personal Care', brand: 'Engage', price: '₹220', stock: 780 },
  { sku: 'SKU-ITC-006', name: 'Sunfeast Marie Light 250g', category: 'Biscuits', brand: 'Sunfeast', price: '₹25', stock: 1120 },
  { sku: 'SKU-ITC-007', name: 'Classmate Notebook 192 Pages', category: 'Stationery', brand: 'Classmate', price: '₹60', stock: 2100 },
  { sku: 'SKU-ITC-008', name: 'Wills Lifestyle Denim Shirt', category: 'Apparel', brand: 'Wills Lifestyle', price: '₹1,499', stock: 95 },
  { sku: 'SKU-ITC-009', name: 'Bingo Original Style 70g', category: 'Snacks', brand: 'Bingo', price: '₹20', stock: 960 },
  { sku: 'SKU-ITC-010', name: 'Savlon Antiseptic Liquid 500ml', category: 'Healthcare', brand: 'Savlon', price: '₹180', stock: 340 },
  { sku: 'SKU-HUL-001', name: 'Surf Excel Easy Wash 500g', category: 'Detergent', brand: 'Surf Excel', price: '₹95', stock: 820 },
  { sku: 'SKU-HUL-002', name: 'Dove Beauty Bar 100g', category: 'Personal Care', brand: 'Dove', price: '₹55', stock: 1450 },
  { sku: 'SKU-HUL-003', name: 'Lux Body Wash 240ml', category: 'Personal Care', brand: 'Lux', price: '₹190', stock: 670 },
  { sku: 'SKU-HUL-004', name: 'Rin Advanced Detergent Bar 250g', category: 'Detergent', brand: 'Rin', price: '₹20', stock: 1800 },
  { sku: 'SKU-HUL-005', name: 'Pepsodent Germicheck 200g', category: 'Oral Care', brand: 'Pepsodent', price: '₹75', stock: 930 },
];

function generateCSVContent(): string {
  const headers = ['SKU Code', 'Product Name', 'Category', 'Brand', 'Price', 'Stock Units'];
  const rows = SKU_DATA.map(s => [s.sku, `"${s.name}"`, s.category, s.brand, s.price, s.stock.toString()]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function downloadCSV() {
  const csv = generateCSVContent();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `qwipo_sku_report_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const roleMeta: Record<string, { label: string; color: string; bg: string }> = {
  super_admin:       { label: 'Qwipo Admin',       color: '#6366F1', bg: '#EEF2FF' },
  company_admin:     { label: 'Company Admin',      color: '#7C3AED', bg: '#F5F3FF' },
  distributor_admin: { label: 'Distributor Admin',  color: '#0891B2', bg: '#F0F9FF' },
};

export default function ReportsModule({ role }: { role: string }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const meta = roleMeta[role] ?? { label: 'Admin', color: '#6366F1', bg: '#EEF2FF' };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      downloadCSV();
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto">

      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-800">Reports</h2>
        <p className="text-slate-400 text-xs mt-0.5">Download the complete SKU report for your scope.</p>
      </div>

      {/* Role context badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: meta.bg, border: `1px solid ${meta.color}22` }}>
        <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
        <span className="font-semibold" style={{ fontSize: '12px', color: meta.color }}>{meta.label}</span>
        <span className="text-slate-400" style={{ fontSize: '11px' }}>— All SKUs included in report</span>
      </div>

      {/* Download card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F0F9FF 100%)', border: '1px solid #C7D2FE' }}>
            <FileSpreadsheet size={22} style={{ color: '#6366F1' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-800 font-bold" style={{ fontSize: '14px' }}>Full SKU Report</div>
            <div className="text-slate-400 mt-0.5" style={{ fontSize: '12px' }}>
              All {SKU_DATA.length} SKUs · Product details, categories, pricing & stock
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#F1F5F9', color: '#64748B' }}>CSV</span>
              <span className="text-slate-300 text-xs">·</span>
              <span className="text-slate-400 text-xs">Updated today</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4" style={{ borderTop: '1px solid #F1F5F9' }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all active:scale-[0.98]"
            style={{
              background: downloading
                ? '#E2E8F0'
                : downloaded
                ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                : 'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)',
              color: downloading ? '#94A3B8' : '#fff',
              fontSize: '13px',
              boxShadow: !downloading && !downloaded ? '0 4px 12px rgba(99,102,241,0.35)' : 'none',
              cursor: downloading ? 'not-allowed' : 'pointer',
            }}
          >
            {downloaded ? (
              <>
                <CheckCircle2 size={16} />
                Report Downloaded!
              </>
            ) : (
              <>
                <Download size={15} style={{ animation: downloading ? 'bounce 0.6s infinite' : 'none' }} />
                {downloading ? 'Generating Report…' : 'Download All SKUs'}
              </>
            )}
          </button>
          {!downloading && !downloaded && (
            <p className="text-center text-slate-400 mt-2" style={{ fontSize: '11px' }}>
              Includes all {SKU_DATA.length} SKUs across all categories
            </p>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-xl p-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <div className="text-slate-600 font-semibold mb-2" style={{ fontSize: '12px' }}>Report Contents</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'SKU Code', desc: 'Unique product identifier' },
            { label: 'Product Name', desc: 'Full product description' },
            { label: 'Category', desc: 'Product category group' },
            { label: 'Brand', desc: 'Parent brand name' },
            { label: 'Price', desc: 'MRP / selling price' },
            { label: 'Stock Units', desc: 'Current inventory count' },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#6366F1' }} />
              <div>
                <div className="text-slate-700 font-medium" style={{ fontSize: '11px' }}>{item.label}</div>
                <div className="text-slate-400" style={{ fontSize: '10px' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
