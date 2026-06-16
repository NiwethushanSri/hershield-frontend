import { useState, useEffect } from 'react';
import { Store, Star, Shield, MapPin, Phone, Search, CheckCircle, Plus, ThumbsUp } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['All','Restaurant','Taxi','Hotel','Hostel','Pharmacy','Salon','Clinic'];

const BADGE_COLORS = {
  'Platinum Partner':   'bg-blue-50 text-blue-700 border-blue-200',
  'Gold Verified':      'bg-amber-50 text-amber-700 border-amber-200',
  'Community Verified': 'bg-green-50 text-green-700 border-green-200',
};

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={11} className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

export default function SafeBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showNominate, setShowNominate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name:'', category:'Restaurant', address:'', phone:'' });

  const load = async () => {
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      const { data } = await axios.get('/api/businesses', { params });
      setBusinesses(data);
    } catch { /* keep demo data */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [category, search]);

  const nominateBusiness = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/businesses/nominate', form);
      toast.success(`${form.name} nominated for Women-Safe verification 💜`);
      setShowNominate(false);
      setForm({ name:'', category:'Restaurant', address:'', phone:'' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Nomination failed');
    } finally {
      setSubmitting(false);
    }
  };

  const rateBusiness = async (id, rating) => {
    try {
      await axios.post(`/api/businesses/${id}/rate`, { rating });
      toast.success('Rating submitted! Thank you 💜');
      load();
    } catch { toast.error('Rating failed'); }
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Women-Safe Businesses</h1>
            <p className="text-sm text-gray-500 mt-0.5">Verified safe places for women</p>
          </div>
          <button onClick={() => setShowNominate(true)}
            className="flex items-center gap-1.5 bg-violet-600 text-white text-sm font-semibold px-3 py-2 rounded-2xl shadow-lg shadow-violet-200 active:scale-95 transition-all">
            <Plus size={15}/> Nominate
          </button>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(BADGE_COLORS).map(([badge, color]) => (
            <div key={badge} className={`rounded-xl border px-2 py-2 text-center ${color}`}>
              <Shield size={14} className="mx-auto mb-1" />
              <p className="text-[9px] font-bold leading-tight">{badge}</p>
            </div>
          ))}
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-10" placeholder="Search businesses..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                category===c ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200'
              }`}>{c}</button>
          ))}
        </div>

        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />)
        ) : businesses.length === 0 ? (
          <div className="card flex flex-col items-center py-10 text-center">
            <Store size={36} className="text-gray-300 mb-3" />
            <p className="font-semibold text-gray-600">No businesses found</p>
            <button onClick={() => setShowNominate(true)} className="btn-primary mt-4 text-sm">Nominate One</button>
          </div>
        ) : (
          <div className="space-y-3">
            {businesses.map(b => (
              <div key={b.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800 text-sm">{b.name}</p>
                      {b.verified && <CheckCircle size={13} className="text-green-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Stars rating={parseFloat(b.rating) || 0} />
                      <span className="text-xs text-gray-500">{parseFloat(b.rating||0).toFixed(1)} ({b.review_count})</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${BADGE_COLORS[b.badge] || BADGE_COLORS['Community Verified']}`}>
                    {b.badge}
                  </span>
                </div>
                {b.address && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <MapPin size={11}/> {b.address}
                  </div>
                )}
                {b.features && b.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {b.features.map(f => (
                      <span key={f} className="text-[10px] bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        <CheckCircle size={9}/> {f}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  {b.phone && (
                    <a href={`tel:${b.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 font-semibold text-sm py-2.5 rounded-xl active:scale-95 transition-all">
                      <Phone size={14}/> Call
                    </a>
                  )}
                  <button onClick={() => rateBusiness(b.id, 5)}
                    className="flex-1 flex items-center justify-center gap-2 bg-violet-50 text-violet-700 font-semibold text-sm py-2.5 rounded-xl active:scale-95 transition-all">
                    <ThumbsUp size={14}/> Rate 5★
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNominate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-w-[480px] mx-auto px-6 pt-6 pb-10">
            <h3 className="font-bold text-gray-900 text-lg mb-1">Nominate a Business</h3>
            <p className="text-sm text-gray-500 mb-5">Know a place that's safe for women? Nominate it.</p>
            <form onSubmit={nominateBusiness} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Business Name</label>
                <input className="input" placeholder="Name" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter(c=>c!=='All').map(c => (
                    <button key={c} type="button" onClick={() => setForm(f=>({...f,category:c}))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        form.category===c ? 'bg-violet-600 text-white border-violet-600' : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Address</label>
                <input className="input" placeholder="Street, area, city" value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Phone (optional)</label>
                <input className="input" type="tel" placeholder="Business phone" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Submitting...' : 'Submit Nomination'}
              </button>
              <button type="button" onClick={() => setShowNominate(false)} className="w-full py-3 text-sm text-gray-500 font-medium">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
