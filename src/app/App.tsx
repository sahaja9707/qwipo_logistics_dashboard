import { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardOverview from './components/DashboardOverview';
import DistributorAnalytics from './components/DistributorAnalytics';
import OrdersManagement from './components/OrdersManagement';
import TripsMonitoring from './components/TripsMonitoring';
import AlertsExceptions from './components/AlertsExceptions';
import UserManagement from './components/UserManagement';
import ReportsModule from './components/ReportsModule';
import qwipoLogo from '../imports/image-3.png';
import { type GlobalFilters, defaultFilters } from './data/filterData';

export type Role = 'super_admin' | 'company_admin' | 'distributor_admin' | 'branch_manager' | 'admin_support';

const rolesMeta: Array<{ id: Role; name: string; desc: string; tag: string; color: string }> = [
  { id: 'super_admin', name: 'Super Admin', desc: 'Full platform visibility across all distributors & branches', tag: 'SA', color: '#6366F1' },
  { id: 'company_admin', name: 'Company Admin', desc: 'Company-level analytics across distributor network', tag: 'CA', color: '#7C3AED' },
  { id: 'distributor_admin', name: 'Distributor Admin', desc: 'Full operational access within assigned distributor scope', tag: 'DA', color: '#0891B2' },
  { id: 'branch_manager', name: 'Branch Manager', desc: 'Branch-level trips, deliveries, delays and returns', tag: 'BM', color: '#059669' },
  { id: 'admin_support', name: 'Admin Support', desc: 'Read-only operational interface, no sensitive data', tag: 'AS', color: '#D97706' },
];

// Each role lands directly on their primary operational view after login
const roleDefaultView: Record<Role, string> = {
  super_admin:       'orders',     // lands directly on orders
  company_admin:     'dashboard',  // company-level analytics overview
  distributor_admin: 'orders',     // distributor's primary concern
  branch_manager:    'trips',      // branch's primary concern
  admin_support:     'reports',    // support staff: reports & downloads
};

function LoginScreen({ onLogin }: { onLogin: (role: Role) => void }) {
  return (
    <div
      className="size-full flex"
      style={{ background: 'linear-gradient(135deg, #0B1222 0%, #111e35 100%)' }}
    >
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-14">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 rounded-full overflow-hidden" style={{ width: 38, height: 38 }}>
            <img src={qwipoLogo} alt="Qwipo" style={{ height: '38px', width: 'auto', display: 'block' }} />
          </div>
          <span className="text-white text-lg font-semibold tracking-tight">Qwipo</span>
        </div>

        <div>
          <div className="text-white mb-3" style={{ fontSize: '2.2rem', fontWeight: 700, lineHeight: 1.2 }}>
            Operational intelligence<br />for modern logistics
          </div>
          <p className="text-slate-400 leading-relaxed mb-10 max-w-sm">
            Real-time visibility into orders, trips, fleet, and delivery performance across your entire distribution network.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Orders Tracked', value: '2,700+' },
              { label: 'Active Distributors', value: '48' },
              { label: 'Delivery Rate', value: '94.2%' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-white text-xl font-bold mb-0.5">{s.value}</div>
                <div className="text-slate-400 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-slate-600 text-xs">Logistics Analytics Platform v2.4.1</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex-shrink-0 rounded-full overflow-hidden" style={{ width: 38, height: 38 }}>
              <img src={qwipoLogo} alt="Qwipo" style={{ height: '38px', width: 'auto', display: 'block' }} />
            </div>
            <span className="text-white text-lg font-semibold">Qwipo</span>
          </div>

          <div className="text-white text-xl font-semibold mb-1">Select your role</div>
          <div className="text-slate-400 text-sm mb-6">Enter the wireframe demo as any role</div>

          <div className="space-y-2.5">
            {rolesMeta.map(r => (
              <button
                key={r.id}
                onClick={() => onLogin(r.id)}
                className="w-full p-4 rounded-xl text-left transition-all group hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: r.color, fontSize: '11px' }}
                  >
                    {r.tag}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{r.name}</div>
                    <div className="text-slate-400 text-xs leading-snug mt-0.5">{r.desc}</div>
                  </div>
                  <div className="text-slate-500 group-hover:text-white transition-colors text-sm">→</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [filters, setFilters] = useState<GlobalFilters>(defaultFilters());

  if (!role) return <LoginScreen onLogin={r => { setRole(r); setActiveView(roleDefaultView[r]); }} />;

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':    return <DashboardOverview role={role} filters={filters} />;
      case 'orders':       return <OrdersManagement role={role} filters={filters} />;
      case 'distribution': return <DistributorAnalytics role={role} filters={filters} />;
      case 'trips':        return <TripsMonitoring role={role} />;
      case 'alerts':       return <AlertsExceptions role={role} />;
      case 'reports':      return <ReportsModule role={role} />;
      case 'users':        return <UserManagement role={role} />;
      default:             return <DashboardOverview role={role} filters={filters} />;
    }
  };

  return (
    <div className="size-full flex" style={{ background: '#F1F5F9' }}>
      <Sidebar activeView={activeView} onViewChange={setActiveView} role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          role={role}
          onRoleChange={r => { setRole(r); setActiveView(roleDefaultView[r]); }}
          activeView={activeView}
          filters={filters}
          onFiltersChange={setFilters}
        />
        <main className="flex-1 overflow-y-auto p-5">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
