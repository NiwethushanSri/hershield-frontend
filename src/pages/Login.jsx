import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Shield, Zap } from 'lucide-react';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const { login, register, enterDemoMode } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.phone, form.password);
      } else {
        if (!form.name) { toast.error('Name is required'); setLoading(false); return; }
        await register(form);
      }
      navigate('/');
    } catch (err) {
      if (err?.isDemoFallback) {
        // Backend not running — offer demo mode
        toast('Backend not connected. Use Demo Mode to explore the app.', { icon: 'ℹ️', duration: 5000 });
      } else {
        toast.error(err.response?.data?.error || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    enterDemoMode('Nisha');
    toast.success('Welcome to HerShield Demo 💜');
    navigate('/');
  };

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center mb-4 shadow-xl">
          <Shield size={40} className="text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">HerShield</h1>
        <p className="text-white/70 text-sm mt-1">Your Personal Safety Companion</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-t-3xl px-6 pt-8 pb-10 shadow-2xl">
        {/* Demo mode banner */}
        <button
          onClick={handleDemo}
          className="w-full mb-5 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-50 to-fuchsia-50 border-2 border-dashed border-violet-300 rounded-2xl py-3 text-violet-700 font-semibold text-sm active:scale-[0.98] transition-all"
        >
          <Zap size={16} className="text-violet-500" />
          Try Demo Mode (No Backend Needed)
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">or sign in with account</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === m ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
                <input className="input" placeholder="Your name" value={form.name} onChange={set('name')} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email (optional)</label>
                <input className="input" type="email" placeholder="email@example.com" value={form.email} onChange={set('email')} />
              </div>
            </>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Phone Number</label>
            <input className="input" type="tel" placeholder="+94 77 123 4567" value={form.phone} onChange={set('phone')} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Password</label>
            <div className="relative">
              <input
                className="input pr-12"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading
              ? <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              : mode === 'login' ? 'Sign In Safely' : 'Join HerShield'
            }
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">Protected by end-to-end encryption 🔒</p>
      </div>
    </div>
  );
}
