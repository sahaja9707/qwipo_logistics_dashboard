import { useState, useEffect } from 'react';
import { X, Building2, AlertCircle, Check } from 'lucide-react';
import type { CompanyRecord } from '../data/filterData';

// ─── Preset brand colours ─────────────────────────────────────────────────────

const BRAND_PRESETS: Array<{ label: string; gradient: string; swatch: string }> = [
  { label: 'Amber',   gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', swatch: '#F59E0B' },
  { label: 'Blue',    gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', swatch: '#3B82F6' },
  { label: 'Indigo',  gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', swatch: '#6366F1' },
  { label: 'Emerald', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', swatch: '#10B981' },
  { label: 'Rose',    gradient: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)', swatch: '#F43F5E' },
  { label: 'Violet',  gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', swatch: '#8B5CF6' },
  { label: 'Cyan',    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)', swatch: '#06B6D4' },
  { label: 'Orange',  gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', swatch: '#F97316' },
];

// Auto-generate a 2–3 char short code from a company name
function autoShortCode(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  if (words.length === 2) return (words[0][0] + words[1].slice(0, 2)).toUpperCase();
  return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateCompanyModalProps {
  onClose: () => void;
  onCreated: (company: CompanyRecord) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateCompanyModal({ onClose, onCreated }: CreateCompanyModalProps) {
  const [name, setName]           = useState('');
  const [shortCode, setShortCode] = useState('');
  const [logoBg, setLogoBg]       = useState(BRAND_PRESETS[0].gradient);
  const [onboarded, setOnboarded] = useState(() => new Date().toISOString().slice(0, 10));
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [codeEdited, setCodeEdited] = useState(false);

  // Auto-derive shortCode from name until the user manually edits it
  useEffect(() => {
    if (!codeEdited) setShortCode(autoShortCode(name));
  }, [name, codeEdited]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim())              errs.name      = 'Company name is required.';
    if (!shortCode.trim())         errs.shortCode = 'Short code is required.';
    if (shortCode.trim().length > 3) errs.shortCode = 'Max 3 characters.';
    if (!onboarded)                errs.onboarded = 'Onboarding date is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    const newCompany: CompanyRecord = {
      id:         name.trim(),
      name:       name.trim(),
      shortCode:  shortCode.trim().toUpperCase(),
      logoBg,
      onboarded,
      status:     'Active',
    };
    onCreated(newCompany);
    onClose();
  };

  const selectedPreset = BRAND_PRESETS.find(p => p.gradient === logoBg) ?? BRAND_PRESETS[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ width: 480, border: '1px solid #E2E8F0' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#6366F1' }}>
              <Building2 size={15} className="text-white" />
            </div>
            <div>
              <div className="text-slate-800 font-semibold text-sm">Add Company</div>
              <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Onboard a new client company to the platform</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Live preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-inner flex-shrink-0"
              style={{ background: logoBg }}
            >
              {shortCode.toUpperCase() || '??'}
            </div>
            <div>
              <div className="text-slate-700 font-semibold text-sm">{name || <span className="text-slate-300">Company name…</span>}</div>
              <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>
                Onboarded: {onboarded || '—'} &nbsp;·&nbsp;
                <span className="text-emerald-600 font-medium">● Active</span>
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-slate-600 font-medium mb-1.5" style={{ fontSize: '11px' }}>Company Name *</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
              placeholder="e.g. Britannia Industries"
              className="w-full px-3 py-2 rounded-lg text-slate-700 outline-none transition-colors"
              style={{
                fontSize: '12px',
                border: `1px solid ${errors.name ? '#FCA5A5' : '#E2E8F0'}`,
                background: errors.name ? '#FFF5F5' : '#FAFAFA',
              }}
            />
            {errors.name && <p className="text-red-500 mt-1 flex items-center gap-1" style={{ fontSize: '10px' }}><AlertCircle size={10} />{errors.name}</p>}
          </div>

          {/* Short Code + Brand Color row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Short Code */}
            <div>
              <label className="block text-slate-600 font-medium mb-1.5" style={{ fontSize: '11px' }}>
                Short Code *
                <span className="ml-1 font-normal text-slate-400">(2–3 chars, avatar)</span>
              </label>
              <input
                type="text"
                value={shortCode}
                maxLength={3}
                onChange={e => {
                  setShortCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                  setCodeEdited(true);
                  setErrors(p => ({ ...p, shortCode: '' }));
                }}
                placeholder="e.g. BRI"
                className="w-full px-3 py-2 rounded-lg text-slate-700 outline-none transition-colors"
                style={{
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  border: `1px solid ${errors.shortCode ? '#FCA5A5' : '#E2E8F0'}`,
                  background: errors.shortCode ? '#FFF5F5' : '#FAFAFA',
                }}
              />
              {errors.shortCode && <p className="text-red-500 mt-1 flex items-center gap-1" style={{ fontSize: '10px' }}><AlertCircle size={10} />{errors.shortCode}</p>}
            </div>

            {/* Onboarding Date */}
            <div>
              <label className="block text-slate-600 font-medium mb-1.5" style={{ fontSize: '11px' }}>Onboarding Date *</label>
              <input
                type="date"
                value={onboarded}
                onChange={e => { setOnboarded(e.target.value); setErrors(p => ({ ...p, onboarded: '' })); }}
                className="w-full px-3 py-2 rounded-lg text-slate-700 outline-none transition-colors"
                style={{
                  fontSize: '12px',
                  border: `1px solid ${errors.onboarded ? '#FCA5A5' : '#E2E8F0'}`,
                  background: errors.onboarded ? '#FFF5F5' : '#FAFAFA',
                }}
              />
              {errors.onboarded && <p className="text-red-500 mt-1 flex items-center gap-1" style={{ fontSize: '10px' }}><AlertCircle size={10} />{errors.onboarded}</p>}
            </div>
          </div>

          {/* Brand Colour picker */}
          <div>
            <label className="block text-slate-600 font-medium mb-2" style={{ fontSize: '11px' }}>
              Brand Colour
              <span className="ml-1.5 font-normal text-slate-400">— {selectedPreset.label}</span>
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {BRAND_PRESETS.map(preset => {
                const isSelected = preset.gradient === logoBg;
                return (
                  <button
                    key={preset.label}
                    title={preset.label}
                    onClick={() => setLogoBg(preset.gradient)}
                    className="w-7 h-7 rounded-full transition-all hover:scale-110 flex items-center justify-center"
                    style={{
                      background: preset.swatch,
                      outline: isSelected ? `3px solid ${preset.swatch}` : '3px solid transparent',
                      outlineOffset: 2,
                      boxShadow: isSelected ? '0 0 0 1px white inset' : 'none',
                    }}
                  >
                    {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid #F1F5F9' }}>
          <p className="text-slate-400" style={{ fontSize: '10px' }}>
            New company starts with <strong>0 distributors</strong>. Assign them from the Dashboard.
          </p>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-5 py-1.5 rounded-lg text-white text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: '#6366F1' }}
            >
              Add Company
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
