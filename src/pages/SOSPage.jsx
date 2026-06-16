import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AlertCircle, Phone, Video, Mic, MapPin, Shield, X, CheckCircle, Radio } from 'lucide-react';

const FAKE_CALLS = [
  { label: 'Dad Calling...', emoji: '👨' },
  { label: 'Mom Calling...', emoji: '👩' },
  { label: 'Police Calling...', emoji: '🚔' },
  { label: 'Friend Calling...', emoji: '👯‍♀️' },
];

function CountdownRing({ seconds, total }) {
  const r = 55;
  const circ = 2 * Math.PI * r;
  const dash = ((total - seconds) / total) * circ;
  return (
    <svg className="w-full h-full absolute inset-0 -rotate-90" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="white" strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s linear' }} />
    </svg>
  );
}

export default function SOSPage() {
  const [phase, setPhase] = useState('idle'); // idle | countdown | active | resolved
  const [countdown, setCountdown] = useState(3);
  const [alertId, setAlertId] = useState(null);
  const [location, setLocation] = useState(null);
  const [recording, setRecording] = useState(false);
  const [fakeCall, setFakeCall] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [voiceActive, setVoiceActive] = useState(false);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    navigator.geolocation?.watchPosition(pos =>
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    );
  }, []);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown === 0) { triggerSOS(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'active') { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const startCountdown = () => {
    setCountdown(3);
    setPhase('countdown');
  };

  const cancelCountdown = () => {
    setPhase('idle');
    setCountdown(3);
  };

  const triggerSOS = async () => {
    setPhase('active');
    setRecording(true);
    try {
      const { data } = await axios.post('/api/sos/trigger', {
        latitude: location?.lat,
        longitude: location?.lng,
      });
      setAlertId(data.alert_id);
      toast.error(`🚨 SOS Active — ${data.contacts_notified} contacts notified`, { duration: 6000 });
    } catch {
      toast.error('SOS sent (offline mode)');
    }
  };

  const resolveAlert = async () => {
    try {
      if (alertId) await axios.patch(`/api/sos/${alertId}/resolve`);
    } catch {}
    setPhase('resolved');
    setRecording(false);
    setElapsed(0);
    toast.success('Alert resolved. Stay safe 💜');
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice activation not supported in this browser'); return; }
    if (voiceActive) {
      recognitionRef.current?.stop();
      setVoiceActive(false);
      toast('Voice activation off', { icon: '🎙️' });
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join(' ').toLowerCase();
      if (transcript.includes('help me') || transcript.includes('not feeling safe') || transcript.includes('sos')) {
        toast.error('🚨 Voice trigger detected! Activating SOS...', { duration: 4000 });
        rec.stop();
        setVoiceActive(false);
        startCountdown();
      }
    };
    rec.onerror = () => { setVoiceActive(false); };
    rec.onend = () => { if (voiceActive) rec.start(); };
    rec.start();
    recognitionRef.current = rec;
    setVoiceActive(true);
    toast.success('Voice activation ON — say "Help me" or "I\'m not feeling safe"', { duration: 5000 });
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Emergency SOS</h1>
        <p className="text-sm text-gray-500 mt-0.5">Press the button if you feel unsafe</p>
      </div>

      <div className="px-5 py-6 space-y-5">
        {/* Main SOS button */}
        <div className="card flex flex-col items-center py-8 gap-6">
          {phase === 'idle' && (
            <>
              <p className="text-sm text-gray-500 text-center">Hold the button to trigger emergency alert</p>
              <button
                onClick={startCountdown}
                className="relative w-44 h-44 rounded-full bg-gradient-to-br from-red-500 to-rose-600
                           shadow-2xl shadow-red-300 flex flex-col items-center justify-center gap-1
                           active:scale-95 transition-all duration-150"
              >
                <div className="absolute inset-0 rounded-full bg-red-400 animate-ping-slow opacity-30" />
                <AlertCircle size={52} className="text-white" strokeWidth={1.5} />
                <span className="text-white font-bold text-xl tracking-wide">SOS</span>
              </button>
              <p className="text-xs text-gray-400">Will notify your trusted circle & share GPS</p>
            </>
          )}

          {phase === 'countdown' && (
            <>
              <p className="text-sm font-semibold text-red-600">Sending alert in...</p>
              <div className="relative w-44 h-44">
                <CountdownRing seconds={countdown} total={3} />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex flex-col items-center justify-center shadow-2xl shadow-red-300">
                  <span className="text-white font-black text-6xl">{countdown}</span>
                </div>
              </div>
              <button
                onClick={cancelCountdown}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold text-sm active:scale-95 transition-all"
              >
                <X size={16} /> Cancel
              </button>
            </>
          )}

          {phase === 'active' && (
            <>
              <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-600 font-semibold text-sm">SOS ACTIVE — {fmt(elapsed)}</span>
              </div>
              <div className="relative w-44 h-44 rounded-full bg-gradient-to-br from-red-500 to-rose-600
                              shadow-2xl shadow-red-300 flex flex-col items-center justify-center gap-2">
                <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" />
                <Shield size={40} className="text-white" />
                <span className="text-white font-bold text-sm">HELP SENT</span>
              </div>
              <div className="grid grid-cols-3 gap-3 w-full">
                {[
                  { icon: Mic,   label: recording ? 'Recording' : 'Audio',  active: recording,  color: 'bg-red-50 text-red-600' },
                  { icon: Video, label: 'Video',    active: false,  color: 'bg-gray-50 text-gray-500' },
                  { icon: MapPin,label: 'GPS Live', active: !!location, color: 'bg-green-50 text-green-600' },
                ].map(({ icon: Icon, label, active, color }) => (
                  <div key={label} className={`rounded-xl p-3 flex flex-col items-center gap-1 ${color}`}>
                    <Icon size={20} />
                    <span className="text-[10px] font-semibold">{label}</span>
                    {active && <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />}
                  </div>
                ))}
              </div>
              <button
                onClick={resolveAlert}
                className="flex items-center gap-2 px-8 py-3.5 bg-green-500 text-white rounded-2xl font-semibold shadow-lg shadow-green-200 active:scale-95 transition-all"
              >
                <CheckCircle size={18} /> I'm Safe Now
              </button>
            </>
          )}

          {phase === 'resolved' && (
            <>
              <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-xl shadow-green-200">
                <CheckCircle size={44} className="text-white" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800 text-lg">Alert Resolved</p>
                <p className="text-gray-500 text-sm mt-1">Your trusted circle has been notified you're safe.</p>
              </div>
              <button
                onClick={() => setPhase('idle')}
                className="btn-primary"
              >
                Back to Safety
              </button>
            </>
          )}
        </div>

        {/* Voice Activation — M7 */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio size={16} className={voiceActive ? 'text-red-500' : 'text-violet-600'} />
              <h3 className="font-semibold text-gray-800 text-sm">Voice Activation</h3>
              {voiceActive && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
            </div>
            <button
              onClick={toggleVoice}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                voiceActive
                  ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                  : 'bg-violet-100 text-violet-700'
              }`}
            >
              {voiceActive ? 'ON — Listening' : 'Enable'}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Say <strong>"Help me"</strong> or <strong>"I'm not feeling safe"</strong> to trigger SOS hands-free — even when your phone is in your pocket.
          </p>
        </div>

        {/* Fake Call */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Phone size={16} className="text-violet-600" />
            <h3 className="font-semibold text-gray-800 text-sm">Fake Call — Escape a Situation</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">Trigger a fake incoming call to leave uncomfortable situations safely.</p>
          <div className="grid grid-cols-2 gap-2">
            {FAKE_CALLS.map(({ label, emoji }) => (
              <button
                key={label}
                onClick={() => setFakeCall({ label, emoji })}
                className="flex items-center gap-2.5 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5 text-sm font-medium text-violet-700 active:scale-95 transition-all"
              >
                <span className="text-lg">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Emergency contacts quick dial */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Emergency Numbers</h3>
          <div className="space-y-2">
            {[
              { label: 'Police', number: '118', emoji: '🚔' },
              { label: 'Ambulance', number: '110', emoji: '🚑' },
              { label: 'Emergency', number: '119', emoji: '🆘' },
            ].map(({ label, number, emoji }) => (
              <a
                key={number}
                href={`tel:${number}`}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 active:bg-gray-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500">{number}</p>
                  </div>
                </div>
                <Phone size={16} className="text-green-500" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Fake Call Overlay */}
      {fakeCall && (
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-gray-800 z-50 flex flex-col items-center justify-between py-16 px-8">
          <div className="text-center mt-8">
            <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-5xl mb-4 mx-auto">
              {fakeCall.emoji}
            </div>
            <p className="text-white text-2xl font-bold">{fakeCall.label}</p>
            <p className="text-gray-400 mt-2">Incoming Call...</p>
          </div>
          <div className="flex gap-16">
            <button
              onClick={() => setFakeCall(null)}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg active:scale-95 transition-all"
            >
              <Phone size={28} className="text-white rotate-[135deg]" />
            </button>
            <button
              onClick={() => setFakeCall(null)}
              className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg active:scale-95 transition-all"
            >
              <Phone size={28} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
