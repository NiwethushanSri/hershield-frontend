import { useState } from 'react';
import { Scale, Phone, MapPin, ExternalLink, Search, ChevronRight, Shield, BookOpen } from 'lucide-react';

const CATEGORIES = ['All','Domestic Violence','Harassment','Cyber Crime','Divorce','Child Protection','Workplace Abuse'];

const RESOURCES = [
  {
    name: 'Women In Need (WIN)', type: 'NGO', category: 'Domestic Violence',
    phone: '011 2667195', address: 'Colombo 05', services: ['Counselling','Legal Aid','Shelter','Crisis Line'],
    available: '24/7', verified: true,
  },
  {
    name: 'Legal Aid Commission', type: 'Legal', category: 'All',
    phone: '011 2433618', address: '129 Hulftsdorp St, Colombo 12', services: ['Free Legal Advice','Court Representation','Legal Documents'],
    available: 'Mon–Fri 9AM–4PM', verified: true,
  },
  {
    name: 'National Child Protection Authority', type: 'Government', category: 'Child Protection',
    phone: '1929', address: 'Colombo', services: ['Child Abuse Reports','Emergency Response','Counselling'],
    available: '24/7', verified: true,
  },
  {
    name: 'Sri Lanka Police — Women & Child Bureau', type: 'Police', category: 'Harassment',
    phone: '118 / 011 2444444', address: 'All Police Stations', services: ['Complaints','Protection Orders','Investigation'],
    available: '24/7', verified: true,
  },
  {
    name: 'Cyber Crimes Division — CID', type: 'Police', category: 'Cyber Crime',
    phone: '011 2326978', address: '4th Floor, New Secretariat, Colombo 01', services: ['Online Harassment','Blackmail','Sextortion Reports'],
    available: 'Mon–Fri 8AM–5PM', verified: true,
  },
  {
    name: "Mithuru Mithuro — Women's Helpline", type: 'Hotline', category: 'Domestic Violence',
    phone: '1938', address: 'National', services: ['Crisis Support','Counselling Referral','Safety Planning'],
    available: '24/7', verified: true,
  },
  {
    name: "Family Counselling Centre", type: 'NGO', category: 'Divorce',
    phone: '011 2694031', address: 'Colombo 07', services: ['Mediation','Family Counselling','Divorce Guidance'],
    available: 'Mon–Sat 8AM–5PM', verified: true,
  },
  {
    name: "Emerge Lanka", type: 'NGO', category: 'Workplace Abuse',
    phone: '011 4522920', address: 'Colombo 02', services: ['Workplace Rights','Legal Advice','Support Groups'],
    available: 'Mon–Fri 9AM–5PM', verified: true,
  },
];

const TYPE_COLORS = {
  NGO: 'bg-purple-50 text-purple-700', Legal: 'bg-blue-50 text-blue-700',
  Government: 'bg-green-50 text-green-700', Police: 'bg-red-50 text-red-700',
  Hotline: 'bg-amber-50 text-amber-700',
};

const RIGHTS = [
  { title: 'Right to File a Complaint', desc: 'Any woman can file a complaint at any police station, at any time, free of charge. Police cannot refuse to accept a complaint.' },
  { title: 'Protection Order', desc: 'Under the Prevention of Domestic Violence Act, you can get a Protection Order from a Magistrate Court to keep an abuser away from you.' },
  { title: 'Right to Legal Aid', desc: 'If you cannot afford a lawyer, the Legal Aid Commission provides free legal representation to women in need.' },
  { title: 'Workplace Sexual Harassment', desc: 'Sexual harassment at work is a criminal offence under the Penal Code Section 345. Your employer is legally required to investigate complaints.' },
  { title: 'Cybercrime Laws', desc: 'Sharing intimate images without consent, online harassment, and blackmail are criminal offences under the Computer Crimes Act.' },
];

export default function LegalHelp() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('resources'); // resources | rights

  const filtered = RESOURCES.filter(r =>
    (category === 'All' || r.category === category || r.category === 'All') &&
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.services.some(s => s.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Women's Legal Help</h1>
        <p className="text-sm text-gray-500 mt-0.5">Lawyers, NGOs, shelters & your rights</p>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Emergency legal line */}
        <a href="tel:011 2433618"
          className="flex items-center gap-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-4 active:scale-[0.99] transition-all">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Scale size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Free Legal Aid Hotline</p>
            <p className="text-white/70 text-xs mt-0.5">Legal Aid Commission · 011 2433618</p>
          </div>
          <Phone size={18} className="text-white" />
        </a>

        {/* Tab toggle */}
        <div className="flex bg-gray-100 rounded-2xl p-1">
          {[['resources','Resources'],['rights','Your Rights']].map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab===v?'bg-white text-violet-700 shadow-sm':'text-gray-500'}`}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'resources' && (
          <>
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-10" placeholder="Search resources..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>

            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    category===c ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200'
                  }`}>
                  {c}
                </button>
              ))}
            </div>

            {/* Resource cards */}
            <div className="space-y-3">
              {filtered.map((r, i) => (
                <div key={i} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800 text-sm">{r.name}</p>
                        {r.verified && <Shield size={12} className="text-green-500" />}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[r.type]||'bg-gray-100 text-gray-600'}`}>{r.type}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <p className="text-[10px] text-gray-500 font-medium">{r.available}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {r.services.map(s => (
                      <span key={s} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <MapPin size={11}/> {r.address}
                  </div>
                  <a href={`tel:${r.phone.split('/')[0].trim()}`}
                    className="flex items-center justify-center gap-2 bg-green-500 text-white font-semibold text-sm py-2.5 rounded-xl active:scale-95 transition-all">
                    <Phone size={14}/> Call {r.phone}
                  </a>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'rights' && (
          <div className="space-y-3">
            <div className="card bg-violet-50 border border-violet-100 flex items-start gap-3">
              <BookOpen size={16} className="text-violet-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-violet-800">These are your legal rights in Sri Lanka. Knowing your rights is your first line of defence.</p>
            </div>
            {RIGHTS.map((r,i) => (
              <div key={i} className="card">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-violet-100 text-violet-700 font-bold text-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{r.title}</p>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
