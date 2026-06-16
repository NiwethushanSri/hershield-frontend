import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Shield, AlertCircle, Users, Navigation, Map,
  Bell, LogOut, MapPin, TrendingUp, ChevronRight,
  Sun, Moon, CloudRain, Zap, CheckCircle2, Route, TriangleAlert
} from 'lucide-react';

const MOCK_SCORE = { score: 72, level: 'caution', incidents_nearby: 3, is_night: false };

function ScoreRing({ score, level }) {
  const color = level === 'safe' ? '#22c55e' : level === 'caution' ? '#f59e0b' : '#ef4444';
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">{score}</span>
        <span className="text-[10px] text-gray-500 font-medium">/100</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout, demoMode } = useAuth();
  const navigate = useNavigate();
  const [safety, setSafety] = useState(MOCK_SCORE);
  const [location, setLocation] = useState(null);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const TimeIcon = hour >= 20 || hour < 6 ? Moon : hour >= 7 && hour < 18 ? Sun : CloudRain;

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });
        api.get(`/api/route/safety-score?lat=${lat}&lng=${lng}`)
          .then(r => setSafety(r.data))
          .catch(() => {});
      },
      () => {}
    );
  }, []);

  const levelColor = safety.level === 'safe'
    ? 'text-green-600 bg-green-50'
    : safety.level === 'caution'
    ? 'text-amber-600 bg-amber-50'
    : 'text-red-600 bg-red-50';

  const quickActions = [
    { icon: AlertCircle, label: 'SOS', desc: 'Emergency', to: '/sos', color: 'bg-red-500', textColor: 'text-white', shadow: 'shadow-red-200' },
    { icon: Users,       label: 'Circle', desc: 'Contacts',   to: '/circle', color: 'bg-violet-500', textColor: 'text-white', shadow: 'shadow-violet-200' },
    { icon: Navigation,  label: 'Route',  desc: 'Safe Path',  to: '/route',  color: 'bg-blue-500',   textColor: 'text-white', shadow: 'shadow-blue-200' },
    { icon: Map,         label: 'Map',    desc: 'Reports',    to: '/map',    color: 'bg-emerald-500', textColor: 'text-white', shadow: 'shadow-emerald-200' },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 px-5 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">HerShield</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Bell size={16} className="text-white" />
            </button>
            <button onClick={logout} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <LogOut size={16} className="text-white" />
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-sm flex items-center gap-1.5">
              <TimeIcon size={14} />
              {greeting}
            </p>
            <h2 className="text-white text-xl font-bold mt-0.5">{user?.name?.split(' ')[0]} 👋</h2>
            {location && (
              <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
                <MapPin size={11} /> Location active
              </p>
            )}
          </div>
          <div className="text-center">
            <ScoreRing score={safety.score} level={safety.level} />
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${levelColor}`}>
              {safety.level === 'safe' ? 'Safe Area' : safety.level === 'caution' ? 'Stay Alert' : 'Danger Zone'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Demo mode banner */}
        {demoMode && (
          <div className="flex items-center gap-2.5 bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3">
            <Zap size={15} className="text-violet-500 flex-shrink-0" />
            <p className="text-xs text-violet-700 font-medium">
              Demo Mode — start your backend to connect a real account.
            </p>
          </div>
        )}
        {/* Safety notice */}
        {safety.level !== 'safe' && (
          <div className={`rounded-2xl p-4 border ${safety.level === 'caution' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className={safety.level === 'caution' ? 'text-amber-500 mt-0.5' : 'text-red-500 mt-0.5'} />
              <div>
                <p className={`text-sm font-semibold ${safety.level === 'caution' ? 'text-amber-700' : 'text-red-700'}`}>
                  {safety.incidents_nearby} incidents reported nearby
                </p>
                <p className={`text-xs mt-0.5 ${safety.level === 'caution' ? 'text-amber-600' : 'text-red-600'}`}>
                  {safety.level === 'caution'
                    ? 'Stay on main roads and share your location.'
                    : 'Avoid travelling alone. Keep SOS ready.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map(({ icon: Icon, label, desc, to, color, textColor, shadow }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl ${color} ${textColor} shadow-lg ${shadow} active:scale-95 transition-all`}
              >
                <Icon size={22} strokeWidth={2} />
                <div className="text-center">
                  <p className="text-[11px] font-bold leading-tight">{label}</p>
                  <p className="text-[9px] opacity-75 leading-tight">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Safety tips */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-sm">Safety Recommendations</h3>
            <TrendingUp size={16} className="text-violet-500" />
          </div>
          <ul className="space-y-2.5">
            {(safety.level === 'safe'
              ? ['Area is relatively safe right now', 'Share your location with trusted contacts', 'Keep emergency contacts updated']
              : safety.level === 'caution'
              ? ['Stay on well-lit, busy roads', 'Share live location with your circle', 'Keep phone charged and SOS ready']
              : ['Avoid travelling alone', 'Activate trusted circle tracking', 'Call someone and stay on the line', 'Head to nearest public/police area']
            ).map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature cards */}
        {[
          { icon: CheckCircle2, color: 'bg-green-500', shadow: 'shadow-green-200', title: 'Share Safe Arrival', desc: 'Let your circle know you arrived safely', to: '/circle' },
          { icon: Route,        color: 'bg-blue-500',  shadow: 'shadow-blue-200',  title: 'Plan Safe Route',   desc: 'Get the safest path to your destination', to: '/route' },
          { icon: TriangleAlert,color: 'bg-amber-500', shadow: 'shadow-amber-200', title: 'Report Incident',   desc: 'Help the community stay safe', to: '/map' },
        ].map(({ icon: Icon, color, shadow, title, desc, to }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="card w-full flex items-center gap-4 active:scale-[0.99] transition-all text-left"
          >
            <div className={`w-12 h-12 rounded-2xl ${color} ${shadow} shadow-lg flex items-center justify-center flex-shrink-0`}>
              <Icon size={22} className="text-white" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
