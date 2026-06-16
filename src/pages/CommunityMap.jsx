import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Map, Plus, AlertTriangle, Flag, X, MapPin, Calendar, MessageCircleWarning, Eye, Car, TriangleAlert, Siren, Home, ShoppingBag, MoreHorizontal, Pin } from 'lucide-react';

const TYPES = [
  { id: 'harassment',        label: 'Harassment',        Icon: MessageCircleWarning, color: 'bg-pink-500',   shadow: 'shadow-pink-200'   },
  { id: 'stalking',          label: 'Stalking',           Icon: Eye,                  color: 'bg-purple-500', shadow: 'shadow-purple-200' },
  { id: 'unsafe_taxi',       label: 'Unsafe Taxi',        Icon: Car,                  color: 'bg-orange-500', shadow: 'shadow-orange-200' },
  { id: 'unsafe_area',       label: 'Unsafe Area',        Icon: TriangleAlert,        color: 'bg-amber-500',  shadow: 'shadow-amber-200'  },
  { id: 'assault_attempt',   label: 'Assault Attempt',    Icon: Siren,                color: 'bg-red-500',    shadow: 'shadow-red-200'    },
  { id: 'domestic_violence', label: 'Domestic Violence',  Icon: Home,                 color: 'bg-rose-500',   shadow: 'shadow-rose-200'   },
  { id: 'theft',             label: 'Theft',              Icon: ShoppingBag,          color: 'bg-yellow-500', shadow: 'shadow-yellow-200' },
  { id: 'other',             label: 'Other',              Icon: MoreHorizontal,       color: 'bg-gray-500',   shadow: 'shadow-gray-200'   },
];

const SEVERITY = ['low', 'medium', 'high'];

const DEMO_INCIDENTS = [
  { id: '1', type: 'harassment', description: 'Group of men harassing women near bus stop', latitude: 6.9271, longitude: 79.8612, severity: 'high', reported_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '2', type: 'unsafe_area', description: 'Very dark and isolated after 9 PM', latitude: 6.9150, longitude: 79.8550, severity: 'medium', reported_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: '3', type: 'stalking', description: 'Man followed woman for several blocks', latitude: 6.9300, longitude: 79.8650, severity: 'high', reported_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: '4', type: 'unsafe_taxi', description: 'Driver took wrong route and was rude', latitude: 6.9200, longitude: 79.8580, severity: 'medium', reported_at: new Date(Date.now() - 48 * 3600000).toISOString() },
];

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CommunityMap() {
  const [incidents, setIncidents] = useState(DEMO_INCIDENTS);
  const [showReport, setShowReport] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ type: 'harassment', description: '', severity: 'medium' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      try {
        const { data } = await api.get(`/api/community/incidents?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
        if (data.length) setIncidents(data);
      } catch {}
    });
  }, []);

  const submitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      navigator.geolocation?.getCurrentPosition(async (pos) => {
        try {
          await api.post('/api/community/report', {
            ...form,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          toast.success('Report submitted. Thank you for keeping the community safe! 💜');
          setShowReport(false);
          setForm({ type: 'harassment', description: '', severity: 'medium' });
        } catch (err) {
          // Demo mode
          const newIncident = {
            id: Date.now().toString(),
            ...form,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            reported_at: new Date().toISOString(),
          };
          setIncidents(prev => [newIncident, ...prev]);
          toast.success('Report submitted (demo mode) 💜');
          setShowReport(false);
        } finally {
          setSubmitting(false);
        }
      }, () => {
        toast.error('Location required to report an incident');
        setSubmitting(false);
      });
    } catch {
      setSubmitting(false);
    }
  };

  const filtered = filter === 'all' ? incidents : incidents.filter(i => i.type === filter);

  const severityColor = (s) =>
    s === 'high' ? 'text-red-600 bg-red-50 border-red-200' :
    s === 'medium' ? 'text-amber-600 bg-amber-50 border-amber-200' :
    'text-gray-600 bg-gray-50 border-gray-200';

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Community Safety Map</h1>
            <p className="text-sm text-gray-500 mt-0.5">{incidents.length} reports in your area</p>
          </div>
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center gap-1.5 bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-2xl shadow-lg shadow-red-200 active:scale-95 transition-all"
          >
            <Plus size={16} /> Report
          </button>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Map placeholder */}
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-blue-100 h-48 flex flex-col items-center justify-center gap-2 border border-gray-200">
          <Map size={36} className="text-slate-400" />
          <p className="text-sm font-medium text-slate-600">Community Incident Map</p>
          <p className="text-xs text-slate-400 text-center px-8">{incidents.length} reports plotted · Connect Google Maps API to activate</p>
        </div>

        {/* Hotspot summary */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'High Risk', count: incidents.filter(i => i.severity === 'high').length, color: 'bg-red-50 border-red-200 text-red-600' },
            { label: 'Medium Risk', count: incidents.filter(i => i.severity === 'medium').length, color: 'bg-amber-50 border-amber-200 text-amber-600' },
            { label: 'Reports', count: incidents.length, color: 'bg-violet-50 border-violet-200 text-violet-600' },
          ].map(({ label, count, color }) => (
            <div key={label} className={`rounded-2xl border p-3 text-center ${color}`}>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-[10px] font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[{ id: 'all', label: 'All', Icon: Pin, color: 'bg-violet-500' }, ...TYPES].map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${
                filter === t.id
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              <t.Icon size={12} /> {t.label}
            </button>
          ))}
        </div>

        {/* Incident list */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Reports</h3>
          {filtered.length === 0 ? (
            <div className="card flex flex-col items-center py-8 text-center">
              <Flag size={32} className="text-gray-300 mb-2" />
              <p className="text-gray-500 font-medium text-sm">No reports for this filter</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map(incident => {
                const type = TYPES.find(t => t.id === incident.type) || TYPES[7];
                return (
                  <div key={incident.id} className="card">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${type.color} ${type.shadow} shadow-md flex items-center justify-center flex-shrink-0`}>
                        <type.Icon size={18} className="text-white" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-800 text-sm">{type.label}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${severityColor(incident.severity)}`}>
                            {incident.severity}
                          </span>
                        </div>
                        {incident.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{incident.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                          <span className="flex items-center gap-1"><Calendar size={10} /> {timeAgo(incident.reported_at)}</span>
                          <span className="flex items-center gap-1"><MapPin size={10} /> {incident.latitude?.toFixed(3)}, {incident.longitude?.toFixed(3)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Report Sheet */}
      {showReport && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-w-[480px] mx-auto px-6 pt-6 pb-10 max-h-[85dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Report Incident</h3>
              <button onClick={() => setShowReport(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={16} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={submitReport} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Incident Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map(t => (
                    <button key={t.id} type="button"
                      onClick={() => setForm(f => ({ ...f, type: t.id }))}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border transition-all text-left ${
                        form.type === t.id ? 'bg-violet-600 text-white border-violet-600' : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      <t.Icon size={15} /> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Severity</label>
                <div className="flex gap-2">
                  {SEVERITY.map(s => (
                    <button key={s} type="button"
                      onClick={() => setForm(f => ({ ...f, severity: s }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border capitalize transition-all ${
                        form.severity === s
                          ? s === 'high' ? 'bg-red-500 text-white border-red-500'
                            : s === 'medium' ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-gray-500 text-white border-gray-500'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Description (optional)</label>
                <textarea
                  className="input resize-none h-20"
                  placeholder="Describe what happened..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">Your identity is kept anonymous. Reports are community-verified.</p>
              </div>

              <button type="submit" disabled={submitting} className="btn-danger w-full flex items-center justify-center gap-2">
                {submitting ? 'Submitting...' : <><Flag size={16} /> Submit Report</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
