import { useState, useEffect } from 'react';
import { Search, AlertTriangle, MapPin, Clock, Phone, Share2, Plus, User } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

function timeAgo(iso) {
  const h = Math.floor((Date.now() - new Date(iso)) / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

function AlertCard({ alert, onShare }) {
  return (
    <div className="card border-l-4 border-l-red-500">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          {alert.photo_url
            ? <img src={alert.photo_url} className="w-full h-full object-cover rounded-2xl" alt={alert.name} />
            : <User size={28} className="text-gray-400" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900">{alert.name}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${alert.status==='found'?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>
              {alert.status === 'found' ? 'FOUND' : 'MISSING'}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">Age {alert.age || '?'} · {alert.gender}</p>
        </div>
      </div>
      <div className="space-y-2">
        {alert.last_seen && (
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <Clock size={12} className="mt-0.5 text-gray-400 flex-shrink-0" />
            Last seen: <span className="font-medium text-gray-800 ml-1">{new Date(alert.last_seen).toLocaleString()}</span>
          </div>
        )}
        {alert.last_location && (
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <MapPin size={12} className="mt-0.5 text-gray-400 flex-shrink-0" /> {alert.last_location}
          </div>
        )}
        {alert.vehicle && (
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <span className="text-gray-400 flex-shrink-0">🚗</span> {alert.vehicle}
          </div>
        )}
        {alert.description && (
          <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-2.5">{alert.description}</p>
        )}
        <p className="text-[10px] text-gray-400">{timeAgo(alert.created_at)}</p>
      </div>
      <div className="flex gap-2 mt-3">
        <a href={`tel:${alert.contact_phone}`}
          className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 font-semibold text-sm py-2.5 rounded-xl active:scale-95 transition-all">
          <Phone size={15}/> Call Family
        </a>
        <button onClick={() => onShare(alert)}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-semibold text-sm py-2.5 rounded-xl active:scale-95 transition-all">
          <Share2 size={15}/> Share Alert
        </button>
      </div>
    </div>
  );
}

export default function MissingPerson() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name:'', age:'', last_seen:'', last_location:'', description:'', vehicle:'', contact_phone:'' });
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  useEffect(() => {
    api.get('/api/missing').then(r => setAlerts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.contact_phone) { toast.error('Name and contact number required'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post('/api/missing', form);
      setAlerts(p => [data, ...p]);
      setShowReport(false);
      setForm({ name:'', age:'', last_seen:'', last_location:'', description:'', vehicle:'', contact_phone:'' });
      toast.success('Missing person alert activated. Community notified 🔔');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const shareAlert = (alert) => {
    const text = `🚨 MISSING PERSON ALERT\n\nName: ${alert.name}, Age: ${alert.age || '?'}\nLast Seen: ${alert.last_seen ? new Date(alert.last_seen).toLocaleString() : 'Unknown'}\nLocation: ${alert.last_location || 'Unknown'}\n${alert.description || ''}\n\nContact: ${alert.contact_phone}\n\nShared via HerShield`;
    if (navigator.share) navigator.share({ title: `Missing: ${alert.name}`, text }).catch(()=>{});
    else { navigator.clipboard?.writeText(text); toast.success('Alert copied to clipboard'); }
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Missing Person Alert</h1>
            <p className="text-sm text-gray-500 mt-0.5">{alerts.filter(a=>a.status==='active').length} active alerts</p>
          </div>
          <button onClick={() => setShowReport(true)}
            className="flex items-center gap-1.5 bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-2xl shadow-lg shadow-red-200 active:scale-95 transition-all">
            <Plus size={16}/> Report
          </button>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">If this is an emergency</p>
            <p className="text-xs text-red-700 mt-0.5">Call Police <strong>118</strong> immediately. There is no waiting period for missing persons in Sri Lanka.</p>
          </div>
        </div>

        {loading ? (
          [1,2].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)
        ) : alerts.length === 0 ? (
          <div className="card flex flex-col items-center py-10 text-center">
            <Search size={36} className="text-gray-300 mb-3" />
            <p className="font-semibold text-gray-600">No active alerts</p>
            <p className="text-sm text-gray-400 mt-1">Your community is safe. Report if someone goes missing.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(a => <AlertCard key={a.id} alert={a} onShare={shareAlert} />)}
          </div>
        )}
      </div>

      {showReport && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-w-[480px] mx-auto px-6 pt-6 pb-10 max-h-[90dvh] overflow-y-auto">
            <h3 className="font-bold text-gray-900 text-lg mb-5">Report Missing Person</h3>
            <form onSubmit={submit} className="space-y-4">
              {[
                {k:'name',          label:'Full Name',              placeholder:"Missing person's name",   type:'text'},
                {k:'age',           label:'Age',                    placeholder:'Age',                     type:'number'},
                {k:'last_seen',     label:'Last Seen (Date & Time)',placeholder:'e.g. 2026-06-14T20:30',  type:'datetime-local'},
                {k:'last_location', label:'Last Known Location',    placeholder:'Street, area, city',      type:'text'},
                {k:'vehicle',       label:'Vehicle Info (if any)',  placeholder:'Color, type, plate',      type:'text'},
                {k:'contact_phone', label:'Your Contact Number',    placeholder:'+94 77 000 0000',         type:'tel'},
              ].map(({k,label,placeholder,type}) => (
                <div key={k}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{label}</label>
                  <input className="input" type={type} placeholder={placeholder} value={form[k]} onChange={set(k)} />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Description</label>
                <textarea className="input resize-none h-20" placeholder="Clothing, hair, distinguishing features..."
                  value={form.description} onChange={set('description')} />
              </div>
              <button type="submit" disabled={submitting} className="btn-danger w-full flex items-center justify-center gap-2">
                <AlertTriangle size={16}/> {submitting ? 'Activating...' : 'Activate Missing Alert'}
              </button>
              <button type="button" onClick={() => setShowReport(false)} className="w-full py-3 text-sm text-gray-500 font-medium">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
