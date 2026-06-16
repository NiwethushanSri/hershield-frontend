import { useState, useRef, useEffect } from 'react';
import { Lock, Upload, Image, Mic, Video, FileText, Trash2, Download, Plus, Shield, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TYPE_META = {
  photo:      { icon: Image,    color: 'bg-blue-50 text-blue-600',    label: 'Photo'      },
  audio:      { icon: Mic,      color: 'bg-green-50 text-green-600',  label: 'Audio'      },
  video:      { icon: Video,    color: 'bg-purple-50 text-purple-600',label: 'Video'      },
  screenshot: { icon: FileText, color: 'bg-amber-50 text-amber-600',  label: 'Screenshot' },
  document:   { icon: FileText, color: 'bg-red-50 text-red-600',      label: 'Document'   },
};

const CATEGORIES = ['All', 'Harassment', 'Domestic Violence', 'Cyber Crime', 'Workplace Abuse', 'Legal'];

function fmt(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1048576).toFixed(1)} MB`;
}

export default function EvidenceVault() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState('');
  const [enteredPin, setEnteredPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [addCategory, setAddCategory] = useState('Harassment');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    try {
      const { data } = await api.get('/api/vault');
      setItems(data);
    } catch { /* stay with empty */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'All' ? items : items.filter(i => i.category === filter);

  const handleFileAdd = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', addCategory);
      const { data } = await api.post('/api/vault/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setItems(prev => [data, ...prev]);
      setShowAddSheet(false);
      toast.success('Evidence saved to encrypted vault 🔒');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const deleteItem = async (id, name) => {
    if (!confirm(`Delete "${name}" from vault?`)) return;
    try {
      await api.delete(`/api/vault/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('File removed from vault');
    } catch { toast.error('Delete failed'); }
  };

  const downloadFile = async (id, name) => {
    try {
      const { data } = await api.get(`/api/vault/download/${id}`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a'); a.href = url; a.download = name; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  if (locked) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-gray-50 px-6">
        <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mb-4">
          <Lock size={32} className="text-violet-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Vault Locked</h2>
        <p className="text-sm text-gray-500 mb-8 text-center">Enter your PIN to access your evidence</p>
        <div className="relative w-full max-w-xs">
          <input type={showPin ? 'text' : 'password'} className="input text-center text-2xl tracking-widest"
            placeholder="• • • •" maxLength={6} value={enteredPin}
            onChange={e => setEnteredPin(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && enteredPin === pin) setLocked(false); }} />
          <button type="button" onClick={() => setShowPin(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button className="btn-primary mt-4 w-full max-w-xs"
          onClick={() => { if (enteredPin === pin) setLocked(false); else toast.error('Incorrect PIN'); }}>
          Unlock Vault
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Evidence Vault</h1>
            <p className="text-sm text-gray-500 mt-0.5">{items.length} files · End-to-end encrypted</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setLocked(true)}
              className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Lock size={18} className="text-gray-600" />
            </button>
            <button onClick={() => setShowAddSheet(true)}
              className="w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
              <Plus size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-4 flex items-center gap-3">
          <Shield size={28} className="text-white flex-shrink-0" />
          <div>
            <p className="text-white font-bold text-sm">Encrypted Storage</p>
            <p className="text-white/70 text-xs mt-0.5">All files are stored securely on the server. Only you can access them.</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {Object.entries(TYPE_META).map(([type, meta]) => {
            const count = items.filter(i => i.file_type === type).length;
            const Icon = meta.icon;
            return (
              <div key={type} className="card flex flex-col items-center gap-1 py-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${meta.color}`}>
                  <Icon size={16} />
                </div>
                <span className="text-lg font-bold text-gray-800">{count}</span>
                <span className="text-[9px] text-gray-500 font-medium">{meta.label}s</span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filter === c ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200'
              }`}>{c}</button>
          ))}
        </div>

        <div className="space-y-2.5">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="card flex flex-col items-center py-10 text-center">
              <Lock size={36} className="text-gray-300 mb-3" />
              <p className="font-semibold text-gray-600">No files yet</p>
              <p className="text-sm text-gray-400 mt-1">Add photos, audio, or documents as evidence</p>
              <button onClick={() => setShowAddSheet(true)} className="btn-primary mt-4 text-sm">Add Evidence</button>
            </div>
          ) : filtered.map(item => {
            const meta = TYPE_META[item.file_type] || TYPE_META.document;
            const Icon = meta.icon;
            return (
              <div key={item.id} className="card flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{item.file_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{fmt(item.file_size)} · {new Date(item.uploaded_at).toLocaleString()}</p>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">{item.category}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => downloadFile(item.id, item.file_name)}
                    className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
                    <Download size={14} className="text-green-600" />
                  </button>
                  <button onClick={() => deleteItem(item.id, item.file_name)}
                    className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAddSheet && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-w-[480px] mx-auto px-6 pt-6 pb-10">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Add Evidence</h3>
            <p className="text-sm text-gray-500 mb-4">Select category then choose your file</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {CATEGORIES.filter(c => c !== 'All').map(c => (
                <button key={c} type="button" onClick={() => setAddCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                    addCategory === c ? 'bg-violet-600 text-white border-violet-600' : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>{c}</button>
              ))}
            </div>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFileAdd}
              accept="image/*,audio/*,video/*,.pdf,.doc,.docx" />
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Photo / Screenshot', icon: Image  },
                { label: 'Audio Recording',    icon: Mic    },
                { label: 'Video',              icon: Video  },
                { label: 'Document / PDF',     icon: FileText },
              ].map(({ label, icon: Icon }) => (
                <button key={label} onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex flex-col items-center gap-2 py-5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-600 active:scale-95 transition-all disabled:opacity-50">
                  <Icon size={24} />
                  <span className="text-xs font-medium text-center">{uploading ? 'Uploading...' : label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowAddSheet(false)} className="w-full mt-4 py-3 text-sm text-gray-500 font-medium">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
