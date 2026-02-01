import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { db } from '../firebase';
import AiEstimate from '../component/AiEstimate'; 
import { collection, serverTimestamp, doc, onSnapshot, addDoc, getDocs, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { User, QrCode, LogOut, CheckCircle2, Users, Loader2, Sparkles, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext'; // Import Hook

const UserPage = () => {
  // ... (Same state/logic vars)
  const [queueId, setQueueId] = useState(localStorage.getItem('savedQueueId'));
  const [myDocId, setMyDocId] = useState(localStorage.getItem('savedDocId'));
  const [userName, setUserName] = useState("");
  const [isEnteringName, setIsEnteringName] = useState(false);
  const [userData, setUserData] = useState(null);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [loading, setLoading] = useState(false);
  const [serviceFinished, setServiceFinished] = useState(false);
  const [history, setHistory] = useState([]);
  const [myPosition, setMyPosition] = useState(0);
  
  const { isDarkMode, toggleTheme } = useTheme(); // Use Global State

  // ... (Paste your AI/Alert/Sync Logic here - same as before) ...
  useEffect(() => { if (!queueId) return; const historyQuery = query(collection(db, "queues", queueId, "history"), orderBy("completedAt", "desc"), limit(5)); const unsubscribe = onSnapshot(historyQuery, (snapshot) => { setHistory(snapshot.docs.map(doc => doc.data())); }); return () => unsubscribe(); }, [queueId]);
  useEffect(() => { if (queueId && myDocId) { const waitlistRef = collection(db, "queues", queueId, "waitlist"); const unsubscribe = onSnapshot(waitlistRef, (snapshot) => { const allDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })); const me = allDocs.find(d => d.id === myDocId); if (!me) { setUserData(null); setServiceFinished(true); localStorage.removeItem('savedQueueId'); localStorage.removeItem('savedDocId'); } else { setUserData(me); const ahead = allDocs.filter(d => d.status === 'waiting' && d.tokenNumber < me.tokenNumber); setPeopleAhead(ahead.length); setMyPosition(ahead.length + 1); } }); return () => unsubscribe(); } }, [queueId, myDocId]);
  const joinQueue = async (e) => { e.preventDefault(); setLoading(true); try { const waitlistRef = collection(db, "queues", queueId, "waitlist"); const snapshot = await getDocs(waitlistRef); const docRef = await addDoc(waitlistRef, { name: userName, tokenNumber: snapshot.size + 1, status: "waiting", joinedAt: serverTimestamp() }); localStorage.setItem('savedQueueId', queueId); localStorage.setItem('savedDocId', docRef.id); setMyDocId(docRef.id); setIsEnteringName(false); } catch (error) { alert("Error joining."); } setLoading(false); };
  const leaveQueue = async () => { if (window.confirm("Leave?")) { setLoading(true); await deleteDoc(doc(db, "queues", queueId, "waitlist", myDocId)); localStorage.clear(); window.location.reload(); } };
  const reset = () => { localStorage.clear(); window.location.reload(); };
  useEffect(() => { if (!queueId && !serviceFinished) { const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }); scanner.render(async (decodedText) => { try { const url = new URL(decodedText); const id = url.searchParams.get("id"); if (id) { await scanner.clear(); setQueueId(id); setIsEnteringName(true); } } catch (err) { console.error(err); } }); return () => { const el = document.getElementById("reader"); if(el) scanner.clear().catch(console.error); }; } }, [queueId, serviceFinished]);

  if (loading) return <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#030712]' : 'bg-slate-50'}`}><Loader2 className="animate-spin text-blue-500 mb-4" size={48} /></div>;

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-hidden relative p-6 flex flex-col items-center justify-center
      ${isDarkMode ? 'bg-[#030712] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      <button onClick={toggleTheme} className={`absolute top-6 right-6 p-3 rounded-full shadow-lg z-50 ${isDarkMode ? 'bg-white/10 text-yellow-400' : 'bg-white text-slate-700 border border-slate-200'}`}>
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Blobs */}
      <div className={`absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] animate-blob transition-opacity ${isDarkMode ? 'opacity-10' : 'opacity-5'}`}></div>
      <div className={`absolute bottom-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] animate-blob transition-opacity ${isDarkMode ? 'opacity-10' : 'opacity-5'}`}></div>

      {/* 1. SCANNER STATE */}
      {!queueId && !serviceFinished && (
        <div className="w-full max-w-md relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className={`relative p-8 rounded-3xl border text-center backdrop-blur-xl ${isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-white shadow-xl'}`}>
            <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto"><QrCode className="text-blue-500" size={32} /></div>
            <h2 className={`text-2xl font-black mb-2 tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Scan to Enter</h2>
            <div id="reader" className={`rounded-2xl overflow-hidden border shadow-inner ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}></div>
          </div>
        </div>
      )}

      {/* 2. IDENTITY ENTRY STATE */}
      {isEnteringName && !userData && (
        <div className="w-full max-w-md relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-30"></div>
          <div className={`relative p-10 rounded-3xl border text-center backdrop-blur-xl ${isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-white shadow-xl'}`}>
            <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto"><User className="text-blue-500" size={32} /></div>
            <h2 className={`text-2xl font-black mb-6 tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Identify Yourself</h2>
            <form onSubmit={joinQueue} className="space-y-6">
              <input autoFocus className={`w-full p-5 rounded-2xl outline-none font-bold transition-all border ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500'}`} placeholder="Enter your name" value={userName} onChange={(e) => setUserName(e.target.value)} required />
              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-5 rounded-2xl font-black shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">GET MY TOKEN <ArrowRight size={20} /></button>
            </form>
          </div>
        </div>
      )}

      {/* 3. ACTIVE TICKET STATE */}
      {userData && (
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
          <div className={`relative overflow-hidden rounded-[3rem] border transition-all duration-700 
            ${userData.status === 'called' 
              ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-2xl border-transparent' 
              : (isDarkMode ? 'bg-slate-900/80 border-white/10 backdrop-blur-2xl' : 'bg-white border-white shadow-2xl')}`}>
            
            <div className={`p-6 text-center border-b ${userData.status === 'called' ? 'bg-black/20 border-white/10' : (isDarkMode ? 'bg-blue-600/10 border-white/5' : 'bg-slate-50 border-slate-100')}`}>
              <div className="flex items-center justify-center gap-2">
                <Sparkles className={userData.status === 'called' ? 'text-white' : 'text-blue-500'} size={16} />
                <p className={`font-mono text-xs font-black uppercase tracking-[0.4em] ${userData.status === 'called' ? 'text-white/80' : 'text-blue-500'}`}>Smart Pass</p>
              </div>
            </div>

            <div className="p-10 text-center">
              <p className={`font-bold uppercase tracking-[0.2em] text-[12px] mb-4 ${userData.status === 'called' ? 'text-white/60' : 'text-slate-400'}`}>Queue Position</p>
              <h1 className={`text-[9rem] font-black leading-none mb-4 tracking-tighter ${userData.status === 'called' ? 'text-white' : (isDarkMode ? 'text-white' : 'text-slate-900')}`}>{userData.tokenNumber}</h1>
              <div className="mb-10"><AiEstimate historyData={history} userPosition={myPosition} /></div>
              <div className={`py-4 px-6 rounded-2xl inline-block mb-10 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                <p className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{userData.name}</p>
              </div>

              {userData.status === 'waiting' ? (
                <div className="flex items-center justify-center gap-3 bg-blue-500/10 px-6 py-4 rounded-2xl border border-blue-500/20">
                  <Users className="text-blue-500" size={18} />
                  <span className="font-bold text-blue-500 text-sm">{peopleAhead === 0 ? "You're Next!" : `${peopleAhead} People Ahead`}</span>
                </div>
              ) : (
                <div className="bg-white text-emerald-900 py-5 px-8 rounded-2xl font-black text-xl shadow-2xl animate-bounce flex items-center justify-center gap-3">
                  <CheckCircle2 /> PROCEED NOW
                </div>
              )}
            </div>
          </div>
          <button onClick={leaveQueue} className={`w-full mt-8 py-5 px-6 font-bold rounded-2xl transition-all border flex items-center justify-center gap-2 group ${isDarkMode ? 'text-slate-500 border-white/5 hover:text-rose-500 hover:border-rose-500/20' : 'text-slate-400 border-slate-200 hover:text-rose-600 hover:border-rose-200'}`}>
            <LogOut size={18} /> Cancel My Token
          </button>
        </div>
      )}

      {/* 4. FINISHED */}
      {serviceFinished && (
        <div className="w-full max-w-md relative animate-in slide-in-from-bottom-8 duration-700">
           <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-[3rem] blur opacity-20"></div>
           <div className={`relative p-12 rounded-[3rem] border text-center backdrop-blur-xl ${isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-white shadow-xl'}`}>
            <div className="text-6xl mb-6">✨</div>
            <h2 className={`text-3xl font-black mb-2 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Session Complete</h2>
            <button onClick={reset} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-lg hover:scale-[1.02] transition-all">Finish & Exit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;