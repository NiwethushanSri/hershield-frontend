import { NavLink } from 'react-router-dom';
import { Home, AlertCircle, Users, Map, Grid } from 'lucide-react';

const tabs = [
  { to: '/',       icon: Home,        label: 'Home'   },
  { to: '/sos',    icon: AlertCircle, label: 'SOS'    },
  { to: '/circle', icon: Users,       label: 'Circle' },
  { to: '/map',    icon: Map,         label: 'Map'    },
  { to: '/more',   icon: Grid,        label: 'More'   },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 safe-bottom z-50">
      <div className="flex">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-medium transition-colors
               ${isActive
                 ? label === 'SOS' ? 'text-red-500' : 'text-violet-600'
                 : 'text-gray-400'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all ${
                  isActive && label !== 'SOS' ? 'bg-violet-50'
                  : isActive && label === 'SOS' ? 'bg-red-50' : ''
                }`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
