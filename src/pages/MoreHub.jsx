import { useNavigate } from 'react-router-dom';
import { MessageCircle, Lock, Search, Scale, Monitor, Heart, Store, Mic } from 'lucide-react';

const MODULES = [
  { to:'/chat',      icon: MessageCircle, label: 'AI Companion',      desc: 'Safety advice & support',       color: 'bg-violet-500', shadow: 'shadow-violet-200' },
  { to:'/vault',     icon: Lock,          label: 'Evidence Vault',     desc: 'Encrypted file storage',        color: 'bg-blue-500',   shadow: 'shadow-blue-200'   },
  { to:'/dv-mode',   icon: Monitor,       label: 'DV Mode',            desc: 'Disguise this app',             color: 'bg-gray-700',   shadow: 'shadow-gray-200'   },
  { to:'/missing',   icon: Search,        label: 'Missing Alerts',     desc: 'Report & find missing persons', color: 'bg-red-500',    shadow: 'shadow-red-200'    },
  { to:'/legal',     icon: Scale,         label: 'Legal Help',         desc: 'Lawyers, NGOs & your rights',   color: 'bg-emerald-500',shadow: 'shadow-emerald-200'},
  { to:'/cyber',     icon: Monitor,       label: 'Cyber Safety',       desc: 'Online threat protection',      color: 'bg-orange-500', shadow: 'shadow-orange-200' },
  { to:'/mental',    icon: Heart,         label: 'Mental Health',      desc: 'Check-in & breathing tools',    color: 'bg-pink-500',   shadow: 'shadow-pink-200'   },
  { to:'/businesses',icon: Store,         label: 'Safe Businesses',    desc: 'Verified safe places',          color: 'bg-teal-500',   shadow: 'shadow-teal-200'   },
];

export default function MoreHub() {
  const navigate = useNavigate();
  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold text-gray-900">All Features</h1>
        <p className="text-sm text-gray-500 mt-0.5">HerShield's complete safety ecosystem</p>
      </div>
      <div className="px-5 py-5">
        <div className="grid grid-cols-2 gap-3">
          {MODULES.map(({ to, icon: Icon, label, desc, color, shadow }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`flex flex-col items-start gap-3 p-4 rounded-2xl text-white ${color} shadow-lg ${shadow} active:scale-[0.97] transition-all text-left`}
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">{label}</p>
                <p className="text-[11px] opacity-75 mt-0.5 leading-tight">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
