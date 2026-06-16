import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Heart, Smile, AlertCircle, Phone, MessageCircle, Users, CheckCircle, ChevronRight, Moon, Sun, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const MOODS = [
  { value: 5, emoji: '😊', label: 'Happy',     color: 'bg-green-100 border-green-400 text-green-700'   },
  { value: 4, emoji: '😌', label: 'Okay',      color: 'bg-blue-100 border-blue-400 text-blue-700'      },
  { value: 3, emoji: '😔', label: 'Sad',       color: 'bg-amber-100 border-amber-400 text-amber-700'   },
  { value: 2, emoji: '😟', label: 'Anxious',   color: 'bg-orange-100 border-orange-400 text-orange-700'},
  { value: 1, emoji: '😭', label: 'Distressed',color: 'bg-red-100 border-red-500 text-red-700'         },
];

const SUPPORT_OPTIONS = [
  { icon: Users,         label: 'Notify Family',      desc: 'Let your trusted circle know',  action: 'family'     },
  { icon: MessageCircle, label: 'Talk to Counsellor', desc: 'Connect with a professional',   action: 'counsellor' },
  { icon: Heart,         label: 'Volunteer Listener',  desc: 'Anonymous peer support',        action: 'volunteer'  },
  { icon: Phone,         label: 'Crisis Line',         desc: 'Immediate support: 1926',       action: 'crisis'     },
];

const BREATHING_STEPS = ['Breathe In (4s)', 'Hold (4s)', 'Breathe Out (6s)', 'Rest (2s)'];

const JOURNAL_PROMPTS = [
  "What is one thing I'm grateful for today?",
  'What made me feel safe today?',
  'What is one kind thing I can do for myself?',
  'What emotions came up for me today?',
  'What do I need right now?',
];

export default function MentalHealth() {
  const [tab, setTab] = useState('checkin');
  const [selectedMood, setSelectedMood] = useState(null);
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [history, setHistory] = useState([]);
  const [showSupport, setShowSupport] = useState(false);
  const [breathStep, setBreathStep] = useState(null);
  const [breathIndex, setBreathIndex] = useState(0);
  const [journalText, setJournalText] = useState('');
  const [journalEntries, setJournalEntries] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/mental/checkins/today').then(r => setTodayCheckin(r.data)).catch(() => {});
    api.get('/api/mental/checkins').then(r => setHistory(r.data)).catch(() => {});
    api.get('/api/mental/journal').then(r => setJournalEntries(r.data)).catch(() => {});
  }, []);

  const submitCheckin = async () => {
    if (!selectedMood) { toast.error('Select how you\'re feeling'); return; }
    setSaving(true);
    try {
      const { data } = await api.post('/api/mental/checkin', { mood_value: selectedMood });
      setTodayCheckin(data);
      setHistory(prev => [data, ...prev]);
      if (selectedMood <= 2) setShowSupport(true);
      else toast.success('Check-in recorded 💜 Thank you for taking care of yourself.');
    } catch { toast.error('Failed to save check-in'); }
    finally { setSaving(false); }
  };

  const saveJournal = async () => {
    if (!journalText.trim()) return;
    try {
      const { data } = await api.post('/api/mental/journal', { content: journalText });
      setJournalEntries(prev => [data, ...prev]);
      setJournalText('');
      toast.success('Journal entry saved privately 💜');
    } catch { toast.error('Failed to save entry'); }
  };

  const deleteJournal = async (id) => {
    try {
      await api.delete(`/api/mental/journal/${id}`);
      setJournalEntries(prev => prev.filter(e => e.id !== id));
    } catch {}
  };

  const startBreathing = () => {
    let i = 0;
    setBreathIndex(0); setBreathStep(0);
    const durations = [4000, 4000, 6000, 2000];
    const run = () => {
      if (i >= BREATHING_STEPS.length * 3) { setBreathStep(null); toast.success('Great job! Keep breathing 💜'); return; }
      setBreathIndex(i % BREATHING_STEPS.length);
      setBreathStep(i % BREATHING_STEPS.length);
      i++;
      setTimeout(run, durations[(i - 1) % 4]);
    };
    setTimeout(run, 500);
  };

  const weekHistory = history.slice(0, 7).reverse();

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Mental Health & Wellbeing</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your mental health matters just as much</p>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div className="flex bg-gray-100 rounded-2xl p-1">
          {[['checkin','Check-in'],['breathe','Breathe'],['journal','Journal']].map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${tab===v?'bg-white text-violet-700 shadow-sm':'text-gray-500'}`}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'checkin' && (
          <>
            {weekHistory.length > 0 && (
              <div className="card">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Moods</p>
                <div className="flex gap-2">
                  {weekHistory.map((h, i) => {
                    const mood = MOODS.find(m => m.value === h.mood_value);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-lg">{mood?.emoji || '😐'}</span>
                        <p className="text-[8px] text-gray-400">{new Date(h.checked_at).toLocaleDateString('en',{weekday:'short'})}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!todayCheckin ? (
              <div className="card">
                <p className="font-bold text-gray-800 text-base mb-1">How are you feeling today?</p>
                <p className="text-sm text-gray-500 mb-5">Your feelings are valid. No judgement here.</p>
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {MOODS.map(m => (
                    <button key={m.value} onClick={() => setSelectedMood(m.value)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all active:scale-95 ${
                        selectedMood === m.value ? m.color : 'border-gray-100 bg-gray-50'
                      }`}>
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="text-[9px] font-semibold text-center leading-tight text-gray-600">{m.label}</span>
                    </button>
                  ))}
                </div>
                <button onClick={submitCheckin} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Heart size={18}/> {saving ? 'Saving...' : "Save Today's Check-in"}
                </button>
              </div>
            ) : (
              <div className="card flex flex-col items-center py-8 text-center gap-3">
                <div className="text-5xl">{MOODS.find(m => m.value === todayCheckin.mood_value)?.emoji}</div>
                <p className="font-bold text-gray-800">Today: {todayCheckin.mood_label}</p>
                <p className="text-sm text-gray-500">Check-in recorded. You're doing great 💜</p>
                <button onClick={() => setTodayCheckin(null)} className="text-sm text-violet-600 font-semibold mt-2">Update check-in</button>
              </div>
            )}

            {showSupport && (
              <div className="card border-2 border-red-200 bg-red-50">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={18} className="text-red-600" />
                  <p className="font-bold text-red-800 text-sm">You seem to be struggling. You don't have to face this alone.</p>
                </div>
                <div className="space-y-2">
                  {SUPPORT_OPTIONS.map(({ icon: Icon, label, desc, action }) => (
                    <button key={action}
                      onClick={() => { if (action==='crisis') window.location.href='tel:1926'; else toast.success(`Connecting to ${label}... 💜`); }}
                      className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 text-left active:scale-[0.99] border border-red-100">
                      <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-400" />
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowSupport(false)} className="w-full mt-3 text-sm text-gray-500 font-medium py-2">Maybe later</button>
              </div>
            )}
          </>
        )}

        {tab === 'breathe' && (
          <>
            <div className="card flex flex-col items-center py-10 gap-5">
              {breathStep === null ? (
                <>
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-200 to-purple-200 flex items-center justify-center">
                    <Moon size={40} className="text-violet-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800 text-lg">Box Breathing</p>
                    <p className="text-sm text-gray-500 mt-1">A technique to calm anxiety quickly. 3 rounds takes just 2 minutes.</p>
                  </div>
                  <button onClick={startBreathing} className="btn-primary flex items-center gap-2">
                    <Sun size={18}/> Begin Exercise
                  </button>
                </>
              ) : (
                <>
                  <div className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-1000 ${
                    breathIndex===0?'bg-blue-100 scale-125':breathIndex===1?'bg-violet-100':breathIndex===2?'bg-purple-100 scale-75':'bg-gray-100'
                  }`}>
                    <p className="font-bold text-gray-800 text-center text-sm px-4">{BREATHING_STEPS[breathIndex]}</p>
                  </div>
                  <p className="text-xs text-gray-500">Follow the circle • 3 rounds</p>
                  <button onClick={() => setBreathStep(null)} className="text-sm text-gray-400 font-medium">Stop</button>
                </>
              )}
            </div>
            <div className="card">
              <p className="font-bold text-gray-800 text-sm mb-3">Grounding Technique — 5-4-3-2-1</p>
              {['5 things you can SEE 👁️','4 things you can TOUCH 🤚','3 things you can HEAR 👂','2 things you can SMELL 👃','1 thing you can TASTE 👅'].map((s,i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <span className="w-6 h-6 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{5-i}</span>
                  <p className="text-sm text-gray-700">{s}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'journal' && (
          <>
            <div className="card">
              <p className="font-bold text-gray-800 text-sm mb-1">Private Journal</p>
              <p className="text-xs text-gray-500 mb-3">Writing helps process emotions. Stored securely — only you can see this.</p>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                {JOURNAL_PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => setJournalText(p)}
                    className="flex-shrink-0 bg-violet-50 border border-violet-100 text-violet-700 text-[11px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
                    {p}
                  </button>
                ))}
              </div>
              <textarea className="input resize-none h-32 mb-3" placeholder="Write how you feel..."
                value={journalText} onChange={e => setJournalText(e.target.value)} />
              <button onClick={saveJournal} disabled={!journalText.trim()} className="btn-primary w-full flex items-center justify-center gap-2">
                <Heart size={16}/> Save Entry
              </button>
            </div>
            {journalEntries.map(e => (
              <div key={e.id} className="card">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-gray-400">{new Date(e.created_at).toLocaleString()}</p>
                  <button onClick={() => deleteJournal(e.id)} className="text-[10px] text-red-400 font-medium">Delete</button>
                </div>
                <p className="text-sm text-gray-700">{e.content}</p>
              </div>
            ))}
            {journalEntries.length === 0 && !journalText && (
              <div className="text-center py-4 text-gray-400">
                <Star size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Your entries will appear here</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
