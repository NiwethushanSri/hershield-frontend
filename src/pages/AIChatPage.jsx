import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Phone, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  'I think someone is following me',
  'I feel unsafe right now',
  'My husband is threatening me',
  'Someone is blackmailing me',
  'I need legal advice',
  'I want to report harassment',
];

function Message({ msg }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end mb-3">
        <div className="bg-violet-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-sm">{msg.content || msg.text}</div>
      </div>
    );
  }
  // AI message — content may be JSON string or plain string
  let parsed = { text: msg.content || msg.text, actions: msg.actions, resources: msg.resources };
  if (typeof msg.content === 'string') {
    try { parsed = JSON.parse(msg.content); } catch {}
  }
  return (
    <div className="flex gap-2.5 mb-4">
      <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
        <Bot size={16} className="text-violet-600" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%] text-sm text-gray-800">
          {parsed.text}
        </div>
        {parsed.actions && (
          <div className="bg-white border border-gray-200 rounded-2xl p-3 space-y-2 max-w-[90%]">
            {parsed.emergency && (
              <div className="flex items-center gap-2 text-red-600 text-xs font-bold mb-2">
                <AlertCircle size={13}/> IMMEDIATE ACTIONS
              </div>
            )}
            {parsed.actions.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="w-4 h-4 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                {a}
              </div>
            ))}
            {parsed.resources && (
              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Emergency Contacts</p>
                {parsed.resources.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-violet-700 font-medium">
                    <Phone size={11}/> {r}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/api/chat/history')
      .then(r => {
        if (r.data.length === 0) {
          setMessages([{
            id: 'welcome', role: 'ai',
            content: null, text: "Hello 💜 I'm your HerShield AI companion. I'm here 24/7 to provide safety advice, legal information, and emotional support. How can I help you today?",
            actions: null,
          }]);
        } else {
          setMessages(r.data);
        }
      })
      .catch(() => {
        setMessages([{
          id: 'welcome', role: 'ai',
          text: "Hello 💜 I'm your HerShield AI companion. How can I help you today?",
          actions: null,
        }]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setTyping(true);
    try {
      const { data } = await api.post('/api/chat/message', { content: text });
      setMessages(m => [...m, data]);
    } catch {
      setMessages(m => [...m, { id: Date.now(), role: 'ai', text: "I'm here with you. If this is an emergency, please call 119 immediately.", actions: null }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
            <Bot size={20} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">AI Safety Companion</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-xs text-gray-500">Always here for you · Confidential</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/></div>
        ) : (
          messages.map((msg, i) => <Message key={msg.id || i} msg={msg} />)
        )}
        {typing && (
          <div className="flex gap-2.5 mb-4">
            <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-violet-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-2 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => sendMessage(p)}
              className="flex-shrink-0 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-medium px-3 py-2 rounded-full whitespace-nowrap active:scale-95 transition-all">
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0 safe-bottom">
        <div className="flex gap-2 items-end">
          <textarea
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none bg-gray-50 placeholder:text-gray-400"
            placeholder="Tell me how you're feeling..."
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }}}
          />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || typing}
            className="w-11 h-11 bg-violet-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-200 disabled:opacity-40 active:scale-95 transition-all">
            <Send size={18} className="text-white" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">Conversations are private and encrypted 🔒</p>
      </div>
    </div>
  );
}
