import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Calculator, Cloud, FileText, ChevronRight, AlertTriangle, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const DISGUISE_THEMES = [
  { id: 'calculator', label: 'Calculator',   icon: Calculator, desc: 'Looks like a normal calculator app' },
  { id: 'weather',    label: 'Weather App',  icon: Cloud,      desc: 'Displays weather information as cover' },
  { id: 'notes',      label: 'Notes App',    icon: FileText,   desc: 'Appears as a simple notes application' },
];

function CalculatorDisguise({ onUnlock, pin, setPin }) {
  const [display, setDisplay] = useState('0');
  const [secretInput, setSecretInput] = useState('');

  const buttons = ['7','8','9','÷','4','5','6','×','1','2','3','−','.',  '0','=','+'];

  const handleBtn = (val) => {
    if (val === '=') {
      if (secretInput === pin && pin.length >= 4) {
        onUnlock();
        return;
      }
      setDisplay(secretInput || '0');
      setSecretInput('');
      return;
    }
    if (['+','−','×','÷'].includes(val)) {
      setDisplay(prev => prev + val);
      setSecretInput('');
      return;
    }
    setSecretInput(p => p + val);
    setDisplay(secretInput + val);
  };

  return (
    <div className="min-h-dvh bg-gray-900 flex flex-col justify-end px-4 pb-8 pt-16">
      <div className="text-right text-5xl font-light text-white mb-8 px-2 truncate">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {buttons.map(b => (
          <button key={b} onClick={() => handleBtn(b)}
            className={`h-16 rounded-full text-xl font-medium active:scale-95 transition-all ${
              ['+','−','×','÷','='].includes(b)
                ? 'bg-amber-500 text-white'
                : isNaN(b) && b !== '.'
                ? 'bg-gray-500 text-white'
                : 'bg-gray-700 text-white'
            }`}>
            {b}
          </button>
        ))}
      </div>
      <p className="text-gray-600 text-xs text-center mt-6">Enter PIN then = to unlock</p>
    </div>
  );
}

function WeatherDisguise({ onUnlock, pin, setPin }) {
  const [tapCount, setTapCount] = useState(0);
  const [pinEntry, setPinEntry] = useState('');
  const [showPinPad, setShowPinPad] = useState(false);

  const handleLogoTap = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) { setShowPinPad(true); setTapCount(0); }
  };

  const handlePin = (d) => {
    const next = pinEntry + d;
    setPinEntry(next);
    if (next.length >= pin.length && next === pin) { onUnlock(); return; }
    if (next.length >= 6) setPinEntry('');
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center pt-20 px-6">
      <button onClick={handleLogoTap} className="text-center mb-8">
        <div className="text-8xl mb-2">⛅</div>
        <h2 className="text-white text-3xl font-light">28°C</h2>
        <p className="text-white/70 text-lg mt-1">Colombo, Sri Lanka</p>
        <p className="text-white/50 text-sm mt-1">Partly Cloudy · Humidity 74%</p>
      </button>
      <div className="grid grid-cols-5 gap-4 mt-4">
        {['Mon','Tue','Wed','Thu','Fri'].map((d,i) => (
          <div key={d} className="text-center">
            <p className="text-white/60 text-xs">{d}</p>
            <p className="text-white text-lg my-1">{['☀️','⛅','🌧️','⛅','☀️'][i]}</p>
            <p className="text-white text-sm font-medium">{[30,28,26,27,31][i]}°</p>
          </div>
        ))}
      </div>
      {showPinPad && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl px-6 pt-6 pb-10">
            <p className="text-center font-bold text-gray-800 mb-2">Enter Security PIN</p>
            <div className="flex justify-center gap-3 mb-4">
              {Array.from({length: pin.length || 4}).map((_,i) => (
                <div key={i} className={`w-4 h-4 rounded-full border-2 ${i < pinEntry.length ? 'bg-violet-600 border-violet-600' : 'border-gray-300'}`} />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((d,i) => (
                <button key={i} onClick={() => { if(d==='⌫') setPinEntry(p=>p.slice(0,-1)); else if(d!=='') handlePin(String(d)); }}
                  className="h-14 rounded-2xl bg-gray-100 text-xl font-semibold text-gray-800 active:bg-gray-200 transition-all">
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <p className="text-white/30 text-xs mt-8">Tap weather icon 5 times to access</p>
    </div>
  );
}

export default function DVMode() {
  const [step, setStep] = useState('info'); // info | setup | disguise | unlocked
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [selectedDisguise, setSelectedDisguise] = useState('calculator');
  const [activeDisguise, setActiveDisguise] = useState(null);
  const [pinInput, setPinInput] = useState('');

  const activateDisguise = () => {
    if (pin.length < 4) { toast.error('PIN must be at least 4 digits'); return; }
    if (pin !== confirmPin) { toast.error('PINs do not match'); return; }
    setActiveDisguise(selectedDisguise);
    setStep('disguise');
    toast.success('Disguise mode activated');
  };

  const handleUnlock = () => {
    setActiveDisguise(null);
    setStep('unlocked');
  };

  if (step === 'disguise' && activeDisguise === 'calculator') {
    return <CalculatorDisguise onUnlock={handleUnlock} pin={pin} setPin={setPinInput} />;
  }
  if (step === 'disguise' && activeDisguise === 'weather') {
    return <WeatherDisguise onUnlock={handleUnlock} pin={pin} setPin={setPinInput} />;
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Domestic Violence Mode</h1>
        <p className="text-sm text-gray-500 mt-0.5">Hide this app from abusers with a disguise</p>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Safety Notice</p>
            <p className="text-xs text-amber-700 mt-0.5">This feature disguises HerShield as another app. All safety features remain accessible through your secret PIN. <strong>Clear browser history after using.</strong></p>
          </div>
        </div>

        {step === 'info' && (
          <>
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-violet-100 rounded-2xl flex items-center justify-center">
                  <Shield size={20} className="text-violet-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">How It Works</p>
                  <p className="text-xs text-gray-500">Your secret weapon for safety</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  'Choose a disguise (Calculator, Weather, or Notes)',
                  'Set a secret PIN only you know',
                  'App shows the disguise to anyone who opens it',
                  'Enter your secret PIN to access safety features',
                  'SOS still works instantly in all disguise modes',
                ].map((t,i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="w-5 h-5 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={() => setStep('setup')} className="btn-primary w-full flex items-center justify-center gap-2">
              <Lock size={18} /> Set Up Disguise Mode
            </button>
          </>
        )}

        {(step === 'setup' || step === 'unlocked') && (
          <>
            {step === 'unlocked' && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                <Heart size={18} className="text-green-600" />
                <p className="text-sm text-green-800 font-medium">Welcome back. You're safe here 💜</p>
              </div>
            )}

            <div className="card space-y-4">
              <p className="font-bold text-gray-800 text-sm">Choose Disguise App</p>
              {DISGUISE_THEMES.map(({ id, label, icon: Icon, desc }) => (
                <button key={id} onClick={() => setSelectedDisguise(id)}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl border-2 transition-all text-left ${
                    selectedDisguise === id ? 'border-violet-500 bg-violet-50' : 'border-gray-100 bg-gray-50'
                  }`}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${selectedDisguise === id ? 'bg-violet-100' : 'bg-white'}`}>
                    <Icon size={22} className={selectedDisguise === id ? 'text-violet-600' : 'text-gray-500'} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="card space-y-3">
              <p className="font-bold text-gray-800 text-sm">Set Secret PIN</p>
              <div className="relative">
                <input type={showPin ? 'text' : 'password'} className="input pr-12 text-center tracking-widest text-lg"
                  placeholder="••••" maxLength={6} value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g,''))} />
                <button type="button" onClick={() => setShowPin(v=>!v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPin ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
              <input type={showPin ? 'text' : 'password'} className="input text-center tracking-widest text-lg"
                placeholder="Confirm PIN" maxLength={6} value={confirmPin}
                onChange={e => setConfirmPin(e.target.value.replace(/\D/g,''))} />
              <p className="text-xs text-gray-400">Remember this PIN — it's the only way to access your safety features.</p>
            </div>

            <button onClick={activateDisguise} className="btn-primary w-full flex items-center justify-center gap-2">
              <Lock size={18} /> Activate Disguise
            </button>
          </>
        )}
      </div>
    </div>
  );
}
