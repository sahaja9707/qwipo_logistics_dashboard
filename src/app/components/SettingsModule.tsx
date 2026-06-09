import { useState, useMemo } from 'react';
import {
  Users, UserPlus, X, Search, ChevronDown,
  Building2, Shield, AlertCircle, Check,
} from 'lucide-react';
import CreateCompanyModal from './CreateCompanyModal';
import {
  platformUsers as _platformUsers,
  COMPANIES,
  companyDistributorMappings,
  ALL_DISTRIBUTORS,
  COMPANY_RECORDS,
  addCompanyRecord,
} from '../data/filterData';
import type { PlatformUser, PlatformUserRole, CompanyRecord } from '../data/filterData';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROLE_META: Record<PlatformUserRole, { label: string; color: string; bg: string; border: string }> = {
  distributor_user:  { label: 'Distributor User',  color: '#0891B2', bg: '#EFF6FF', border: '#BAE6FD' },
  distributor_admin: { label: 'Distributor Admin', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  company_admin:     { label: 'Company Admin',     color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
};

function RoleBadge({ role }: { role: PlatformUserRole }) {
  const m = ROLE_META[role];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium"
      style={{ fontSize: '10px', color: m.color, background: m.bg, border: `1px solid ${m.border}` }}
    >
      <Shield size={9} />
      {m.label}
    </span>
  );
}

function getDistributorAccess(user: PlatformUser): string {
  if (user.role === 'company_admin') return 'All company distributors';
  if (user.distributorIds.length === 0) return '—';
  if (user.distributorIds.length === 1) {
    const d = ALL_DISTRIBUTORS.find(x => x.code === user.distributorIds[0]);
    return d ? d.name : user.distributorIds[0];
  }
  return `${user.distributorIds.length} Distributors`;
}

function getCompanyDistributorIds(companyId: string): string[] {
  return companyDistributorMappings.find(m => m.companyId === companyId)?.distributorIds ?? [];
}

function maskMobile(m: string): string {
  return m.slice(0, 2) + 'xxxxxxxx'.slice(0, m.length - 4) + m.slice(-2);
}

// ─── Create User Modal ────────────────────────────────────────────────────────

// Only distributor_admin can be created manually; distributor_user is SSO-provisioned
type NewUserType = 'distributor_admin';

interface CreateUserModalProps {
  onClose: () => void;
  onCreated: (user: PlatformUser) => void;
}

function CreateUserModal({ onClose, onCreated }: CreateUserModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [userType, setUserType] = useState<NewUserType | null>(null);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [selectedDistIds, setSelectedDistIds] = useState<Set<string>>(new Set());
  const [distSearch, setDistSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableDistributors = useMemo(() => {
    if (!companyId) return [];
    const ids = getCompanyDistributorIds(companyId);
    return ids
      .map(id => ALL_DISTRIBUTORS.find(d => d.code === id))
      .filter((d): d is NonNullable<typeof d> => !!d)
      .filter(d =>
        !distSearch ||
        d.code.toLowerCase().includes(distSearch.toLowerCase()) ||
        d.name.toLowerCase().includes(distSearch.toLowerCase())
      );
  }, [companyId, distSearch]);

  const toggleDist = (id: string) => {
    setSelectedDistIds(prev => {
      const next = new Set(prev);
      if (userType === 'distributor_user') {
        // Single select only
        return next.has(id) ? new Set<string>() : new Set([id]);
      }
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required.';
    if (!mobile.trim() || !/^\d{10}$/.test(mobile.trim())) errs.mobile = 'Enter a valid 10-digit mobile number.';
    if (!companyId) errs.company = 'Select a company.';
    if (selectedDistIds.size === 0) errs.distributors = userType === 'distributor_user' ? 'Select a distributor.' : 'Select at least one distributor.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = () => {
    if (!validate() || !userType) return;
    const newUser: PlatformUser = {
      id: `USR-${Date.now()}`,
      name: name.trim(),
      mobile: mobile.trim(),
      role: userType,
      companyId,
      distributorIds: [...selectedDistIds],
    };
    onCreated(newUser);
    onClose();
  };

  const handleTypeSelect = (t: NewUserType) => {
    setUserType(t);
    setSelectedDistIds(new Set());
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setUserType(null);
    setErrors({});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ width: 520, maxHeight: '88vh', border: '1px solid #E2E8F0' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#6366F1' }}>
              <UserPlus size={15} className="text-white" />
            </div>
            <div>
              <div className="text-slate-800 font-semibold text-sm">Create User</div>
              <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>
                {step === 1 ? 'Step 1 of 2 — Select user type' : 'Step 2 of 2 — Distributor Admin details'}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 w-full" style={{ background: '#F1F5F9' }}>
          <div
            className="h-full transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%', background: '#6366F1' }}
          />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {step === 1 ? (
            // ── Step 1: Choose user type
            <div className="px-6 py-6 space-y-3">
              <p className="text-slate-500 text-xs mb-4">Choose the type of user to create. Each type has different access scope.</p>

              {/* Distributor Admin card — manually creatable */}
              <button
                onClick={() => handleTypeSelect('distributor_admin')}
                className="w-full text-left p-4 rounded-xl border-2 transition-all hover:border-violet-400 hover:bg-violet-50 group"
                style={{ border: '2px solid #E2E8F0' }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#F5F3FF' }}>
                    <Building2 size={16} style={{ color: '#7C3AED' }} />
                  </div>
                  <div>
                    <div className="text-slate-800 font-semibold text-sm">Distributor Admin</div>
                    <div className="text-slate-400 mt-1 leading-relaxed" style={{ fontSize: '11px' }}>
                      Multi-distributor access. Can view Orders, Trips, and Reports for all assigned distributors and switch between them. Cannot create users or modify mappings.
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-slate-300 group-hover:text-violet-500 mt-1 ml-auto -rotate-90 flex-shrink-0" />
                </div>
              </button>

              {/* SSO notice — distributor_user is not manually creatable */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(8,145,178,0.05)', border: '1px solid rgba(8,145,178,0.18)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(8,145,178,0.12)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold" style={{ fontSize: '12px', color: '#0891B2' }}>Distributor User — SSO Only</div>
                    <div className="text-slate-500 mt-1 leading-relaxed" style={{ fontSize: '11px' }}>
                      Distributor Users are authenticated automatically via <strong>SSO</strong>. They access the platform through:
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {['Main Application', 'Dashboard Option', 'Logistics Dashboard'].map((s, i, arr) => (
                        <span key={s} className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded text-slate-600" style={{ fontSize: '10px', background: '#F1F5F9', border: '1px solid #E2E8F0' }}>{s}</span>
                          {i < arr.length - 1 && <span className="text-slate-400" style={{ fontSize: '11px' }}>→</span>}
                        </span>
                      ))}
                    </div>
                    <div className="text-slate-400 mt-2" style={{ fontSize: '10px' }}>No manual creation required. Access is provisioned by the backend.</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // ── Step 2: Fill in details
            <div className="px-6 py-5 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-slate-600 font-medium mb-1.5" style={{ fontSize: '11px' }}>Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                  placeholder="e.g. Rajesh Malhotra"
                  className="w-full px-3 py-2 rounded-lg text-slate-700 outline-none transition-colors"
                  style={{
                    fontSize: '12px',
                    border: `1px solid ${errors.name ? '#FCA5A5' : '#E2E8F0'}`,
                    background: errors.name ? '#FFF5F5' : '#FAFAFA',
                  }}
                />
                {errors.name && <p className="text-red-500 mt-1 flex items-center gap-1" style={{ fontSize: '10px' }}><AlertCircle size={10} />{errors.name}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-slate-600 font-medium mb-1.5" style={{ fontSize: '11px' }}>Mobile Number *</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={e => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors(p => ({ ...p, mobile: '' })); }}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 rounded-lg text-slate-700 outline-none transition-colors"
                  style={{
                    fontSize: '12px',
                    border: `1px solid ${errors.mobile ? '#FCA5A5' : '#E2E8F0'}`,
                    background: errors.mobile ? '#FFF5F5' : '#FAFAFA',
                  }}
                />
                {errors.mobile && <p className="text-red-500 mt-1 flex items-center gap-1" style={{ fontSize: '10px' }}><AlertCircle size={10} />{errors.mobile}</p>}
              </div>

              {/* Company */}
              <div>
                <label className="block text-slate-600 font-medium mb-1.5" style={{ fontSize: '11px' }}>Company *</label>
                <div className="relative">
                  <select
                    value={companyId}
                    onChange={e => {
                      setCompanyId(e.target.value);
                      setSelectedDistIds(new Set());
                      setErrors(p => ({ ...p, company: '', distributors: '' }));
                    }}
                    className="w-full px-3 py-2 rounded-lg text-slate-700 outline-none appearance-none transition-colors"
                    style={{
                      fontSize: '12px',
                      border: `1px solid ${errors.company ? '#FCA5A5' : '#E2E8F0'}`,
                      background: errors.company ? '#FFF5F5' : '#FAFAFA',
                    }}
                  >
                    <option value="">Select a company…</option>
                    {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {errors.company && <p className="text-red-500 mt-1 flex items-center gap-1" style={{ fontSize: '10px' }}><AlertCircle size={10} />{errors.company}</p>}
              </div>

              {/* Distributor selection */}
              <div>
                <label className="block text-slate-600 font-medium mb-1.5" style={{ fontSize: '11px' }}>
                  Distributors *
                  <span className="ml-1 font-normal text-slate-400">(select one or more)</span>
                </label>

                {!companyId ? (
                  <div className="rounded-lg px-3 py-3 text-slate-400 text-center" style={{ fontSize: '11px', border: '1px dashed #E2E8F0', background: '#FAFAFA' }}>
                    Select a company first to see available distributors.
                  </div>
                ) : (
                  <>
                    {/* Search within distributors */}
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-2" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <Search size={12} style={{ color: '#94A3B8', flexShrink: 0 }} />
                      <input
                        type="text"
                        placeholder="Search distributors…"
                        value={distSearch}
                        onChange={e => setDistSearch(e.target.value)}
                        className="flex-1 bg-transparent text-slate-700 outline-none placeholder-slate-400"
                        style={{ fontSize: '11px' }}
                      />
                    </div>

                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {availableDistributors.length === 0 ? (
                        <div className="text-slate-400 text-center py-4" style={{ fontSize: '11px' }}>
                          {getCompanyDistributorIds(companyId).length === 0
                            ? 'No distributors are assigned to this company yet.'
                            : 'No distributors match your search.'}
                        </div>
                      ) : (
                        availableDistributors.map(d => {
                          const checked = selectedDistIds.has(d.code);
                          return (
                            <label
                              key={d.code}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                              style={{
                                background: checked ? 'rgba(99,102,241,0.06)' : '#FAFAFA',
                                border: `1px solid ${checked ? '#C7D2FE' : '#F1F5F9'}`,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => { toggleDist(d.code); setErrors(p => ({ ...p, distributors: '' })); }}
                                className="w-4 h-4 cursor-pointer flex-shrink-0 accent-indigo-600"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-slate-700 font-medium" style={{ fontSize: '11px', fontFamily: 'monospace' }}>{d.code}</div>
                                <div className="text-slate-400 truncate" style={{ fontSize: '10px' }}>{d.name} · {d.city}</div>
                              </div>
                              {checked && <Check size={12} style={{ color: '#6366F1', flexShrink: 0 }} />}
                            </label>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
                {errors.distributors && (
                  <p className="text-red-500 mt-1 flex items-center gap-1" style={{ fontSize: '10px' }}>
                    <AlertCircle size={10} />{errors.distributors}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid #F1F5F9' }}>
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="px-4 py-1.5 rounded-lg text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors"
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          {step === 2 && (
            <button
              onClick={handleCreate}
              className="px-5 py-1.5 rounded-lg text-white text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: '#6366F1' }}
            >
              Create User
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Permission Reference Card ────────────────────────────────────────────────

function PermissionReferenceCard() {
  const rows = [
    { role: 'Qwipo Admin',       dashboard: true,  orders: true,  trips: true,  reports: true,  settings: true,  note: 'Full platform access' },
    { role: 'Company Admin',     dashboard: true,  orders: true,  trips: true,  reports: true,  settings: false, note: 'All company distributors' },
    { role: 'Distributor Admin', dashboard: false, orders: true,  trips: true,  reports: true,  settings: false, note: 'Assigned distributors only' },
    { role: 'Distributor User',  dashboard: false, orders: true,  trips: true,  reports: true,  settings: false, note: 'One distributor, no switching' },
  ];

  const cols = ['Dashboard', 'Orders', 'Trips', 'Reports', 'Settings'];
  const keys = ['dashboard', 'orders', 'trips', 'reports', 'settings'] as const;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
        <div className="text-slate-800 text-sm font-semibold">Role Permissions Reference</div>
        <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>Read-only overview of access capabilities per role</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              <th className="px-5 py-2.5 text-left text-slate-400 font-medium" style={{ fontSize: '10px' }}>Role</th>
              {cols.map(c => (
                <th key={c} className="px-4 py-2.5 text-center text-slate-400 font-medium" style={{ fontSize: '10px' }}>{c}</th>
              ))}
              <th className="px-5 py-2.5 text-left text-slate-400 font-medium" style={{ fontSize: '10px' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.role} style={{ borderTop: '1px solid #F1F5F9' }}>
                <td className="px-5 py-2.5 text-slate-700 font-medium whitespace-nowrap">{row.role}</td>
                {keys.map(k => (
                  <td key={k} className="px-4 py-2.5 text-center">
                    {row[k]
                      ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full" style={{ background: '#ECFDF5' }}><Check size={11} style={{ color: '#059669' }} /></span>
                      : <span className="text-slate-300" style={{ fontSize: '14px' }}>—</span>
                    }
                  </td>
                ))}
                <td className="px-5 py-2.5 text-slate-400" style={{ fontSize: '10px' }}>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Settings Module ─────────────────────────────────────────────────────

export default function SettingsModule() {
  const [users, setUsers] = useState<PlatformUser[]>([..._platformUsers]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<PlatformUserRole | ''>('');

  // Company management state
  const [companies, setCompanies] = useState<CompanyRecord[]>(() => [...COMPANY_RECORDS]);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);

  const handleCompanyCreated = (company: CompanyRecord) => {
    addCompanyRecord(company);
    setCompanies([...COMPANY_RECORDS]);
  };

  const getDistributorCount = (companyId: string) =>
    companyDistributorMappings.find(m => m.companyId === companyId)?.distributorIds.length ?? 0;

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.mobile.includes(search) ||
        u.companyId.toLowerCase().includes(search.toLowerCase());
      const matchRole = !roleFilter || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const handleCreated = (user: PlatformUser) => {
    setUsers(prev => [...prev, user]);
    // Also push to the module-level array so it persists in session
    _platformUsers.push(user);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800 font-bold" style={{ fontSize: '18px' }}>Settings</h1>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: '12px' }}>Platform administration and user management</p>
        </div>
      </div>

      {/* ── Company Management Section ── */}
      <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        {/* Section header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#EEF2FF' }}>
              <Building2 size={15} style={{ color: '#6366F1' }} />
            </div>
            <div>
              <div className="text-slate-800 font-semibold text-sm">Company Management</div>
              <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>{companies.length} client companies onboarded</div>
            </div>
          </div>
          <button
            id="settings-add-company-btn"
            onClick={() => setShowAddCompanyModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: '#6366F1', fontSize: '12px' }}
          >
            <Building2 size={13} />
            Add Company
          </button>
        </div>

        {/* Company list */}
        <div className="divide-y" style={{ borderColor: '#F1F5F9' }}>
          {companies.map(c => {
            const distCount = getDistributorCount(c.id);
            return (
              <div key={c.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: c.logoBg, fontSize: '11px' }}
                >
                  {c.shortCode}
                </div>

                {/* Name + date */}
                <div className="flex-1 min-w-0">
                  <div className="text-slate-700 font-semibold" style={{ fontSize: '13px' }}>{c.name}</div>
                  <div className="text-slate-400 mt-0.5" style={{ fontSize: '10px' }}>Onboarded: {c.onboarded}</div>
                </div>

                {/* Distributor count badge */}
                <div className="text-center flex-shrink-0">
                  <div className="text-slate-700 font-bold" style={{ fontSize: '14px' }}>{distCount}</div>
                  <div className="text-slate-400" style={{ fontSize: '9px' }}>Distributors</div>
                </div>

                {/* Status */}
                <div
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: c.status === 'Active' ? '#ECFDF5' : '#F1F5F9',
                    border: `1px solid ${c.status === 'Active' ? '#A7F3D0' : '#E2E8F0'}`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: c.status === 'Active' ? '#10B981' : '#94A3B8' }}
                  />
                  <span
                    className="font-bold"
                    style={{ fontSize: '9px', color: c.status === 'Active' ? '#059669' : '#64748B' }}
                  >
                    {c.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
        {/* Section header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#EEF2FF' }}>
              <Users size={15} style={{ color: '#6366F1' }} />
            </div>
            <div>
              <div className="text-slate-800 font-semibold text-sm">User Management</div>
              <div className="text-slate-400 mt-0.5" style={{ fontSize: '11px' }}>{users.length} platform users</div>
            </div>
          </div>
          <button
            id="settings-create-user-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: '#6366F1', fontSize: '12px' }}
          >
            <UserPlus size={13} />
            Create User
          </button>
        </div>

        {/* Filters row */}
        <div className="px-5 py-3 flex items-center gap-3 flex-wrap" style={{ borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }}>
          {/* Search */}
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 flex-1 min-w-48" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', maxWidth: 320 }}>
            <Search size={13} style={{ color: '#94A3B8', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by name, mobile or company…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-slate-700 outline-none placeholder-slate-400"
              style={{ fontSize: '12px' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                <X size={11} />
              </button>
            )}
          </div>

          {/* Role filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as PlatformUserRole | '')}
              className="rounded-lg px-3 py-2 text-slate-600 appearance-none outline-none transition-colors pr-7"
              style={{ fontSize: '11px', border: '1px solid #E2E8F0', background: '#FFFFFF' }}
            >
              <option value="">All roles</option>
              <option value="distributor_user">Distributor User</option>
              <option value="distributor_admin">Distributor Admin</option>
              <option value="company_admin">Company Admin</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <span className="text-slate-400 ml-auto" style={{ fontSize: '11px' }}>
            {filtered.length} of {users.length} users
          </span>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Full Name', 'Mobile', 'Role', 'Company', 'Distributor Access'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-slate-400 font-medium" style={{ fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400" style={{ fontSize: '12px' }}>
                    No users match your search or filter.
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} style={{ borderTop: '1px solid #F1F5F9' }} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                          style={{ background: ROLE_META[user.role].color, fontSize: '10px' }}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <span className="text-slate-700 font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                      {maskMobile(user.mobile)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <RoleBadge role={user.role} />
                        {user.role === 'distributor_user' && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold"
                            style={{ fontSize: '9px', background: 'rgba(8,145,178,0.1)', color: '#0891B2', border: '1px solid rgba(8,145,178,0.25)' }}
                          >
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            SSO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{user.companyId}</td>
                    <td className="px-5 py-3 text-slate-500" style={{ fontSize: '11px' }}>
                      {getDistributorAccess(user)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Reference */}
      <PermissionReferenceCard />

      {/* Add Company Modal */}
      {showAddCompanyModal && (
        <CreateCompanyModal
          onClose={() => setShowAddCompanyModal(false)}
          onCreated={handleCompanyCreated}
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
