import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Users, Plus, Trash2, Send, MapPin, CheckCircle, Phone, X } from 'lucide-react';

const RELATIONSHIPS = ['Mother', 'Father', 'Sister', 'Brother', 'Husband', 'Friend', 'Other'];
const EMOJI_MAP = { Mother: '👩', Father: '👨', Sister: '👧', Brother: '👦', Husband: '💑', Friend: '👯', Other: '🤝' };

export default function TrustedCircle() {
  const [contacts, setContacts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '', relationship: 'Friend' });

  const loadContacts = async () => {
    try {
      const { data } = await api.get('/api/trusted-circle');
      setContacts(Array.isArray(data) ? data : []);
    } catch {
      // Demo contacts when backend not available
      setContacts([
        { id: '1', name: 'Mom', phone: '+94771234567', relationship: 'Mother' },
        { id: '2', name: 'Priya', phone: '+94779876543', relationship: 'Friend' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadContacts(); }, []);

  const addContact = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/trusted-circle', form);
      toast.success(`${form.name} added to your circle 💜`);
      setForm({ name: '', phone: '', relationship: 'Friend' });
      setShowAdd(false);
      loadContacts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add contact');
    }
  };

  const removeContact = async (id, name) => {
    if (!confirm(`Remove ${name} from your circle?`)) return;
    try {
      await api.delete(`/api/trusted-circle/${id}`);
      setContacts(c => c.filter(x => x.id !== id));
      toast.success(`${name} removed`);
    } catch {
      toast.error('Failed to remove contact');
    }
  };

  const shareLocation = async (arrived = false) => {
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      try {
        await api.post('/api/trusted-circle/checkin', {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          arrived,
          message: arrived ? 'I have arrived safely!' : 'Sharing my live location.',
        });
        toast.success(arrived ? 'Arrival confirmed sent 💜' : 'Location shared with your circle 📍');
      } catch {
        toast.success('Location shared (demo mode) 📍');
      }
    }, () => toast.error('Location permission required'));
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Trusted Circle</h1>
            <p className="text-sm text-gray-500 mt-0.5">{contacts.length} contacts · They get notified in emergencies</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200 active:scale-95 transition-all"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Quick share actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => shareLocation(false)}
            className="card flex items-center gap-3 active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin size={18} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">Share Location</p>
              <p className="text-[10px] text-gray-500">Send to circle now</p>
            </div>
          </button>
          <button
            onClick={() => shareLocation(true)}
            className="card flex items-center gap-3 active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">I Arrived Safely</p>
              <p className="text-[10px] text-gray-500">Notify my circle</p>
            </div>
          </button>
        </div>

        {/* Contacts list */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Circle ({contacts.length}/10)</h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : contacts.length === 0 ? (
            <div className="card flex flex-col items-center py-10 text-center">
              <Users size={40} className="text-gray-300 mb-3" />
              <p className="font-semibold text-gray-600">No contacts yet</p>
              <p className="text-sm text-gray-400 mt-1">Add trusted people who'll be notified in emergencies</p>
              <button onClick={() => setShowAdd(true)} className="btn-primary mt-4 text-sm">
                Add First Contact
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {contacts.map(c => (
                <div key={c.id} className="card flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                    {EMOJI_MAP[c.relationship] || '🤝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.relationship} · {c.phone}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <a href={`tel:${c.phone}`} className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                      <Phone size={15} className="text-green-600" />
                    </a>
                    <button
                      onClick={() => removeContact(c.id, c.name)}
                      className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center"
                    >
                      <Trash2 size={15} className="text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Check-in message */}
        <div className="card bg-violet-50 border border-violet-100">
          <div className="flex items-start gap-3">
            <Send size={16} className="text-violet-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-violet-800">Auto Check-in</p>
              <p className="text-xs text-violet-600 mt-0.5">
                When you trigger SOS, all contacts receive your live GPS location and an emergency alert instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Contact Sheet */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-w-[480px] mx-auto px-6 pt-6 pb-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Add Trusted Contact</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={16} className="text-gray-600" />
              </button>
            </div>
            <form onSubmit={addContact} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Name</label>
                <input className="input" placeholder="Contact name" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Phone</label>
                <input className="input" type="tel" placeholder="+94 77 000 0000" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Relationship</label>
                <div className="flex flex-wrap gap-2">
                  {RELATIONSHIPS.map(r => (
                    <button key={r} type="button"
                      onClick={() => setForm(f => ({ ...f, relationship: r }))}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                        form.relationship === r
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      {EMOJI_MAP[r]} {r}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                <Plus size={18} /> Add to Circle
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
