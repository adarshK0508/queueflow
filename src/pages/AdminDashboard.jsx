import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, query, where, onSnapshot, orderBy, doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { LayoutDashboard, Plus, Trash2, LogOut, CheckCircle2, ExternalLink, Loader2, Play, Users, Command, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext'; // Import Hook

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [activeQueue, setActiveQueue] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [newQueueData, setNewQueueData] = useState({ name: '', category: '' });
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme(); // Use Global State

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthLoading(false);
      if (!user) navigate('/admin-login');
    });
    return () => unsubscribe();
  }, [navigate]);

  // ... (Keep existing loading Logic) ...
  useEffect(() => {
    if (authLoading || !auth.currentUser) return;
    const q = query(collection(db, "queues"), where("adminId", "==", auth.currentUser.uid), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Lobby Error:", err));
    return () => unsubscribe();
  }, [authLoading]);

  useEffect(() => {
    if (!activeQueue) { setCustomers([]); return; }
    const q = query(collection(db, "queues", activeQueue.id, "waitlist"), orderBy("joinedAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Waitlist Error:", err));
    return () => unsubscribe();
  }, [activeQueue]);

  // ... (Keep CRUD Logic - createSession, deleteSession, callCustomer, removeCustomer) ...
  const createSession = async (e) => {
    e.preventDefault(); if (!newQueueData.name) return; setLoading(true);
    try { await addDoc(collection(db, "queues"), { adminId: auth.currentUser.uid, name: newQueueData.name, category: newQueueData.category || "General", createdAt: serverTimestamp(), active: true }); setNewQueueData({ name: '', category: '' }); } catch (err) { console.error(err); } setLoading(false);
  };
  const callCustomer = async (customerId) => { await updateDoc(doc(db, "queues", activeQueue.id, "waitlist", customerId), { status: "called", calledAt: serverTimestamp() }); };
  const removeCustomer = async (customer) => { if (window.confirm("Complete?")) { try { if(customer.calledAt) { await addDoc(collection(db, "queues", activeQueue.id, "history"), { completedAt: serverTimestamp(), duration: (new Date() - customer.calledAt.toDate())/60000, hourOfDay: new Date().getHours(), dayOfWeek: new Date().getDay() }); } await deleteDoc(doc(db, "queues", activeQueue.id, "waitlist", customer.id)); } catch(e){console.error(e)} } };
  const deleteSession = async (e, sessionId) => { e.stopPropagation(); if (window.confirm("Delete?")) { await deleteDoc(doc(db, "queues", sessionId)); if (activeQueue?.id === sessionId) setActiveQueue(null); } };
  const handleLogout = async () => { await signOut(auth); navigate('/'); };

  if (authLoading) return <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#030712]' : 'bg-slate-50'}`}><Loader2 className="animate-spin text-purple-500 mb-4" size={48} /><p className="text-slate-400 font-mono tracking-widest text-xs">VERIFYING</p></div>;

  return (
    <div className={`min-h-screen font-sans selection:bg-purple-500/30 flex flex-col lg:flex-row overflow-hidden transition-colors duration-500
      ${isDarkMode ? 'bg-[#030712] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      <div className={`fixed top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] animate-blob z-0 transition-opacity ${isDarkMode ? 'opacity-5' : 'opacity-0'}`}></div>
      <div className={`fixed bottom-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] animate-blob z-0 transition-opacity ${isDarkMode ? 'opacity-5' : 'opacity-0'}`}></div>

      <aside className={`relative z-10 w-full lg:w-80 border-b lg:border-b-0 lg:border-r flex flex-col h-auto lg:h-screen transition-colors duration-500
        ${isDarkMode ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
        
        <div className={`p-6 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center gap-3 group">
              <span className={`font-bold tracking-tighter text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>ToKen.LeLo</span>
            </Link>
            <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-white/10 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}>
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
          <div className="flex items-center justify-between">
             <div className="flex flex-col"><span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">admin</span><span className={`text-xs font-bold truncate w-32 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{auth.currentUser?.email}</span></div>
             <button onClick={handleLogout} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-rose-500 transition-colors"><LogOut size={16} /></button>
          </div>
        </div>

        <div className={`p-6 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-purple-400 uppercase tracking-widest"><Plus size={12} /> Initialize_Stream</div>
          <form onSubmit={createSession} className="space-y-3">
            <input className={`w-full rounded-xl px-4 py-3 outline-none focus:border-purple-500/50 transition-all text-xs font-medium ${isDarkMode ? 'bg-white/5 border border-white/5 text-white placeholder:text-slate-600' : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400'}`} placeholder="Queue Name" value={newQueueData.name} onChange={(e) => setNewQueueData({ ...newQueueData, name: e.target.value })} required />
            <input className={`w-full rounded-xl px-4 py-3 outline-none focus:border-purple-500/50 transition-all text-xs font-medium ${isDarkMode ? 'bg-white/5 border border-white/5 text-white placeholder:text-slate-600' : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400'}`} placeholder="Category" value={newQueueData.category} onChange={(e) => setNewQueueData({ ...newQueueData, category: e.target.value })} />
            <button disabled={loading} className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'bg-white text-black hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>{loading ? <Loader2 className="animate-spin" size={14} /> : 'create'}</button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sessions.map(s => (
            <div key={s.id} onClick={() => setActiveQueue(s)} className={`group relative cursor-pointer p-4 rounded-xl border transition-all duration-300 ${activeQueue?.id === s.id ? (isDarkMode ? 'bg-purple-500/10 border-purple-500/50' : 'bg-purple-50 border-purple-200') : (isDarkMode ? 'bg-transparent border-transparent hover:bg-white/5' : 'bg-transparent border-transparent hover:bg-slate-50')}`}>
              <div className="flex justify-between items-start">
                <div><h4 className={`font-bold text-sm ${activeQueue?.id === s.id ? (isDarkMode ? 'text-white' : 'text-purple-900') : (isDarkMode ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-800')}`}>{s.name}</h4><span className="text-[10px] font-mono text-slate-600 uppercase">{s.category || 'General'}</span></div>
                {activeQueue?.id === s.id && <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>}
              </div>
              <button onClick={(e) => deleteSession(e, s.id)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </aside>

      <main className="relative z-10 flex-1 h-screen overflow-y-auto p-6 lg:p-12">
        {activeQueue ? (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="relative group mb-8">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className={`relative border rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 ${isDarkMode ? 'bg-[#0A0A0A] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className={`p-4 rounded-2xl shadow-xl shrink-0 ${isDarkMode ? 'bg-white border border-white/10' : 'bg-white border border-slate-100'}`}><QRCodeSVG value={`${window.location.origin}/user?id=${activeQueue.id}`} size={120} /></div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2"><h2 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activeQueue.name}</h2><span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono uppercase tracking-widest">Active</span></div>
                  <p className="text-slate-500 text-sm mb-6 max-w-md">Scan to join.</p>
                </div>
                <div className="hidden md:block text-right"><div className={`text-5xl font-bold tracking-tighter mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{customers.filter(c => c.status === 'waiting').length}</div><div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Waiting</div></div>
              </div>
            </div>

            <div className="space-y-4">
               {customers.map((c) => (
                 <div key={c.id} className={`group flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${c.status === 'called' ? 'bg-emerald-500/5 border-emerald-500/30' : (isDarkMode ? 'bg-[#0A0A0A] border-white/5 hover:border-white/10' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm')}`}>
                   <div className="flex items-center gap-6">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${c.status === 'called' ? 'bg-emerald-500 text-black' : (isDarkMode ? 'bg-white/5 text-slate-400 border border-white/5' : 'bg-slate-100 text-slate-500 border border-slate-200')}`}>{c.tokenNumber}</div>
                     <div><h4 className={`font-bold text-lg ${c.status === 'called' ? 'text-emerald-500' : (isDarkMode ? 'text-white' : 'text-slate-800')}`}>{c.name}</h4><div className="flex items-center gap-2"><span className={`text-[10px] font-mono uppercase ${c.status === 'called' ? 'text-emerald-600' : 'text-slate-500'}`}>{c.status}</span></div></div>
                   </div>
                   <div className="flex items-center gap-3">
                     {c.status === 'waiting' && <button onClick={() => callCustomer(c.id)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"><Play size={14} fill="currentColor" /> CALL</button>}
                     <button onClick={() => removeCustomer(c)} className={`p-3 rounded-xl border transition-all ${c.status === 'called' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-black' : (isDarkMode ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50')}`}><CheckCircle2 size={20} /></button>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        ) : <div className="h-full flex flex-col items-center justify-center text-center opacity-50"><LayoutDashboard size={64} className="text-slate-500 mb-6" /><h2 className={`text-2xl font-bold tracking-tight mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Select a queue</h2></div>}
      </main>
    </div>
  );
};

export default AdminDashboard;