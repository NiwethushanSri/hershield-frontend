import { useState } from 'react';
import { Monitor, AlertTriangle, Shield, Camera, MessageSquare, User, Phone, ChevronRight, Plus, Lock, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const THREAT_TYPES = [
  { id:'fake_profile', label:'Fake Profile',      emoji:'👤', desc:'Someone impersonating you online' },
  { id:'sextortion',   label:'Sextortion',         emoji:'🔒', desc:'Threats to share intimate images' },
  { id:'blackmail',    label:'Blackmail',           emoji:'⚠️', desc:'Being forced through threats' },
  { id:'revenge_porn', label:'Revenge Porn',        emoji:'🚫', desc:'Intimate images shared without consent' },
  { id:'cyberbullying',label:'Cyberbullying',       emoji:'😔', desc:'Harassment and abuse online' },
  { id:'scam',         label:'Online Scam',         emoji:'💸', desc:'Fraud or financial deception' },
];

const AI_SCAN_RESULTS = [
  { type: 'warning', message: 'Profile photo found on 2 suspicious websites', severity: 'medium' },
  { type: 'info',    message: 'No leaked personal data found in known breaches', severity: 'safe' },
  { type: 'warning', message: 'Email address found in 1 data breach database', severity: 'medium' },
];

const SAFETY_TIPS = [
  { tip: 'Use strong, unique passwords for every account', icon: Lock },
  { tip: 'Enable two-factor authentication on all social media', icon: Shield },
  { tip: 'Never send intimate photos — even to people you trust', icon: Camera },
  { tip: 'Keep your location settings private on all apps', icon: Eye },
  { tip: 'Review your social media privacy settings monthly', icon: Monitor },
  { tip: 'Trust your instincts — if it feels wrong, it is wrong', icon: AlertTriangle },
];

export default function CyberSafety() {
  const [tab, setTab] = useState('threats');
  const [showReport, setShowReport] = useState(false);
  const [selectedType, setSelectedType] = useState('fake_profile');
  const [evidence, setEvidence] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [reports, setReports] = useState([]);

  const runScan = async () => {
    setScanning(true);
    await new Promise(r => setTimeout(r, 2500));
    setScanning(false);
    setScanDone(true);
    toast.success('AI scan complete');
  };

  const submitReport = (e) => {
    e.preventDefault();
    const r = { id: Date.now(), type: selectedType, evidence, date: new Date().toLocaleString(), status: 'submitted' };
    setReports(p => [r, ...p]);
    setShowReport(false);
    setEvidence('');
    toast.success('Report submitted to Cyber Crimes Division 🔒');
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Cyber Safety Protection</h1>
        <p className="text-sm text-gray-500 mt-0.5">Protect yourself from online threats</p>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Tab */}
        <div className="flex bg-gray-100 rounded-2xl p-1">
          {[['threats','Threats'],['scan','AI Scan'],['tips','Safety Tips']].map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${tab===v?'bg-white text-violet-700 shadow-sm':'text-gray-500'}`}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'threats' && (
          <>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-800">If you are being threatened or harassed online, <strong>do NOT comply with demands.</strong> Document everything and report immediately. You are not alone.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {THREAT_TYPES.map(t => (
                <button key={t.id} onClick={() => { setSelectedType(t.id); setShowReport(true); }}
                  className="card flex flex-col items-start gap-2 active:scale-[0.98] transition-all text-left">
                  <span className="text-2xl">{t.emoji}</span>
                  <p className="font-semibold text-gray-800 text-sm">{t.label}</p>
                  <p className="text-[11px] text-gray-500">{t.desc}</p>
                  <span className="text-[10px] text-violet-600 font-semibold flex items-center gap-1">Report <ChevronRight size={10}/></span>
                </button>
              ))}
            </div>

            {reports.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">My Reports</h3>
                <div className="space-y-2">
                  {reports.map(r => {
                    const type = THREAT_TYPES.find(t=>t.id===r.type);
                    return (
                      <div key={r.id} className="card flex items-center gap-3">
                        <span className="text-xl">{type?.emoji}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm">{type?.label}</p>
                          <p className="text-xs text-gray-500">{r.date}</p>
                        </div>
                        <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-1 rounded-full font-semibold capitalize">{r.status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="card">
              <p className="font-semibold text-gray-800 text-sm mb-2">Emergency Cyber Crime Contacts</p>
              {[
                { label: 'Cyber Crimes Division', number: '011 2326978' },
                { label: 'Police Emergency', number: '118' },
              ].map(({ label, number }) => (
                <a key={number} href={`tel:${number}`}
                  className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500">{number}</p>
                  </div>
                  <Phone size={15} className="text-green-500" />
                </a>
              ))}
            </div>
          </>
        )}

        {tab === 'scan' && (
          <>
            <div className="card flex flex-col items-center py-8 text-center gap-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${scanning ? 'bg-violet-100 animate-pulse' : 'bg-violet-50'}`}>
                <Monitor size={36} className="text-violet-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">AI Scam Detection Scan</p>
                <p className="text-sm text-gray-500 mt-1">Checks if your data appears in known breaches, fake profile databases, or suspicious websites</p>
              </div>
              {!scanDone ? (
                <button onClick={runScan} disabled={scanning} className="btn-primary flex items-center gap-2">
                  {scanning ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Scanning...
                    </>
                  ) : 'Run AI Safety Scan'}
                </button>
              ) : (
                <div className="w-full space-y-2 text-left">
                  {AI_SCAN_RESULTS.map((r, i) => (
                    <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl ${r.severity==='safe'?'bg-green-50':'bg-amber-50'}`}>
                      <span className="text-base">{r.severity==='safe'?'✅':'⚠️'}</span>
                      <p className={`text-xs font-medium ${r.severity==='safe'?'text-green-800':'text-amber-800'}`}>{r.message}</p>
                    </div>
                  ))}
                  <button onClick={() => setScanDone(false)} className="w-full py-3 text-sm text-violet-600 font-semibold">Run Again</button>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'tips' && (
          <div className="space-y-3">
            {SAFETY_TIPS.map(({ tip, icon: Icon }, i) => (
              <div key={i} className="card flex items-start gap-3">
                <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-violet-600" />
                </div>
                <p className="text-sm text-gray-700 font-medium mt-1.5">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showReport && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-w-[480px] mx-auto px-6 pt-6 pb-10 max-h-[80dvh] overflow-y-auto">
            <h3 className="font-bold text-gray-900 text-lg mb-1">Report: {THREAT_TYPES.find(t=>t.id===selectedType)?.label}</h3>
            <p className="text-sm text-gray-500 mb-5">Your report is confidential and forwarded to Cyber Crimes Division</p>
            <form onSubmit={submitReport} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {THREAT_TYPES.map(t => (
                  <button key={t.id} type="button" onClick={() => setSelectedType(t.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs border transition-all text-left ${
                      selectedType===t.id ? 'bg-violet-600 text-white border-violet-600' : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                    <span>{t.emoji}</span>{t.label}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Describe what happened</label>
                <textarea className="input resize-none h-24" placeholder="Include platform names, usernames, what was sent or threatened..."
                  value={evidence} onChange={e => setEvidence(e.target.value)} required />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                💡 Also save screenshots to your <strong>Evidence Vault</strong> for use in legal proceedings.
              </div>
              <button type="submit" className="btn-primary w-full">Submit Report</button>
              <button type="button" onClick={() => setShowReport(false)} className="w-full py-3 text-sm text-gray-500 font-medium">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
