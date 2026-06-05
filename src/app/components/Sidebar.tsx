import {
  LayoutDashboard, ShoppingCart, Truck,
  FileText, Settings, ChevronRight, LogOut
} from 'lucide-react';
import type { Role } from '../App';
import qwipoLogo from '../../imports/image-4.png';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  role: Role;
}

const roleConfig: Record<string, { name: string; color: string; initial: string; scope: string }> = {
  super_admin:       { name: 'Qwipo Admin',       color: '#6366F1', initial: 'QA', scope: 'All companies & regions' },
  company_admin:     { name: 'Company Admin',     color: '#7C3AED', initial: 'CA', scope: 'ITC · All distributors' },
  distributor_admin: { name: 'Distributor Admin', color: '#0891B2', initial: 'DA', scope: 'Assigned distributors' },
};

const menuGroups = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Summary', icon: LayoutDashboard, roles: ['super_admin', 'company_admin'] as string[], badge: null },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'orders', label: 'Orders', icon: ShoppingCart, roles: ['super_admin', 'company_admin', 'distributor_admin'] as string[], badge: null },
      { id: 'trips',  label: 'Trips',  icon: Truck,        roles: ['super_admin', 'company_admin', 'distributor_admin'] as string[], badge: null },
    ],
  },
  {
    label: 'Management',
    items: [
      { id: 'reports', label: 'Reports', icon: FileText, roles: ['super_admin', 'company_admin', 'distributor_admin'] as string[], badge: null },
    ],
  },
];

export default function Sidebar({ activeView, onViewChange, role }: SidebarProps) {
  const cfg = roleConfig[role];

  return (
    <div className="w-56 flex flex-col flex-shrink-0 h-full select-none" style={{ background: '#0C1220' }}>
      {/* Logo */}
      <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Circular icon — show only the left purple circle portion of the Qwipo logo */}
        <div className="flex-shrink-0 rounded-full overflow-hidden" style={{ width: 34, height: 34 }}>
          <img
            src={qwipoLogo}
            alt="Qwipo"
            style={{ height: '34px', width: 'auto', display: 'block' }}
          />
        </div>
        <div>
          <div className="text-white text-sm font-semibold leading-none">Qwipo</div>
          <div className="text-slate-500 leading-none mt-0.5" style={{ fontSize: '10px' }}>Analytics Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-5">
        {menuGroups.map(group => {
          const visible = group.items.filter(i => i.roles.includes(role));
          if (!visible.length) return null;
          return (
            <div key={group.label}>
              <div
                className="px-3 mb-1.5"
                style={{ color: 'rgba(255,255,255,0.22)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase' }}
              >
                {group.label}
              </div>
              {visible.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 transition-colors text-left"
                    style={{
                      background: isActive ? 'rgba(99,102,241,0.18)' : 'transparent',
                      color: isActive ? '#A5B4FC' : 'rgba(255,255,255,0.45)',
                    }}
                  >
                    <Icon size={15} />
                    <span className="flex-1" style={{ fontSize: '13px' }}>{item.label}</span>
                    {item.badge != null && (
                      <span
                        className="text-white rounded-full px-1.5"
                        style={{ background: '#EF4444', fontSize: '10px', lineHeight: '18px' }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight size={12} style={{ color: '#818CF8' }} />}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1.5 transition-colors"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <Settings size={15} />
          <span style={{ fontSize: '13px' }}>Settings</span>
        </button>
        <div
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ background: cfg.color, fontSize: '10px' }}
          >
            {cfg.initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white leading-none truncate" style={{ fontSize: '12px' }}>{cfg.name}</div>
            <div className="truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>{cfg.scope}</div>
          </div>
          <LogOut size={13} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}
