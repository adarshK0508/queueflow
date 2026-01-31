import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  collection, addDoc, query, where, onSnapshot, orderBy, doc, updateDoc, serverTimestamp, deleteDoc
} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import FloatingThemeToggle from './FloatingThemeToggle';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [activeQueue, setActiveQueue] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [newQueueData, setNewQueueData] = useState({ name: '', category: '' });
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthLoading(false);
      if (!user) navigate('/');
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (authLoading || !auth.currentUser) return;

    const q = query(
      collection(db, "queues"),
      where("adminId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Lobby Error:", err));

    return () => unsubscribe();
  }, [authLoading]);

  useEffect(() => {
    if (!activeQueue) {
      setCustomers([]);
      return;
    }

    const q = query(
      collection(db, "queues", activeQueue.id, "waitlist"),
      orderBy("joinedAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Waitlist Error:", err));

    return () => unsubscribe();
  }, [activeQueue]);

  // UPDATED: Now logs the service duration to history for the AI 📊
  const removeCustomer = async (customer) => {
    if (window.confirm(`Complete service for ${customer.name}?`)) {
      try {
        // 1. Calculate duration if the user was actually called to the counter
        if (customer.calledAt) {
          const endTime = new Date();
          const startTime = customer.calledAt.toDate();
          const serviceDuration = (endTime - startTime) / 60000; // minutes

          // 2. Add record to 'history' sub-collection for Gemini to analyze
          await addDoc(collection(db, "queues", activeQueue.id, "history"), {
            completedAt: serverTimestamp(),
            duration: parseFloat(serviceDuration.toFixed(2)),
            hourOfDay: new Date().getHours(),
            dayOfWeek: new Date().getDay()
          });
        }

        // 3. Delete the customer from active waitlist
        const docRef = doc(db, "queues", activeQueue.id, "waitlist", customer.id);
        await deleteDoc(docRef);
      } catch (err) {
        console.error("Error completing service:", err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('activeQueueId');
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    if (!newQueueData.name || !auth.currentUser) return;

    try {
      await addDoc(collection(db, "queues"), {
        adminId: auth.currentUser.uid,
        name: newQueueData.name,
        category: newQueueData.category || "General",
        createdAt: serverTimestamp(),
        status: 'active'
      });
      setNewQueueData({ name: '', category: '' });
    } catch (err) {
      console.error("Creation failed:", err);
    }
  };

  // UPDATED: Adds calledAt timestamp to start the service timer ⏱️
  const callCustomer = async (customerId) => {
    const ref = doc(db, "queues", activeQueue.id, "waitlist", customerId);
    await updateDoc(ref, { 
      status: "called",
      calledAt: serverTimestamp() 
    });
  };

  const deleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm("Delete this session and all its data?")) {
      try {
        await deleteDoc(doc(db, "queues", sessionId));
        if (activeQueue?.id === sessionId) setActiveQueue(null);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center font-bold text-blue-600 animate-pulse">AUTHENTICATING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3 group transition-transform active:scale-95">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200 group-hover:bg-blue-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </div>
          <span className="font-display text-2xl font-black tracking-tight text-slate-800">
            Queue<span className="text-blue-600">Flow</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrator</span>
            <span className="text-sm font-bold text-slate-700">{auth.currentUser?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-600 transition-all shadow-md active:scale-95"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-12 overflow-hidden">
        <aside className="lg:col-span-3 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Create New Queue</h2>
            <form onSubmit={createSession} className="space-y-2">
              <input
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition"
                placeholder="Queue Name (e.g. Counter 1)"
                value={newQueueData.name}
                onChange={(e) => setNewQueueData({ ...newQueueData, name: e.target.value })}
                required
              />
              <input
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition"
                placeholder="Category (e.g. Service)"
                value={newQueueData.category}
                onChange={(e) => setNewQueueData({ ...newQueueData, category: e.target.value })}
              />
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                Add Session
              </button>
            </form>
          </div>

          <hr className="border-slate-100" />

          <div className="flex-1">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Active Sessions</h2>
            <div className="space-y-2">
              {sessions.map(s => (
                <div key={s.id} className="group relative">
                  <button
                    onClick={() => setActiveQueue(s)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${activeQueue?.id === s.id ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <p className="font-bold text-sm truncate pr-6">{s.name}</p>
                    <p className="text-[10px] text-blue-500 font-bold uppercase">{s.category}</p>
                  </button>
                  <button
                    onClick={(e) => deleteSession(e, s.id)}
                    className="absolute top-4 right-3 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-9 p-8 overflow-y-auto">
          {activeQueue ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-8">
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-md">
                  <QRCodeCanvas value={`${window.location.origin}/user?id=${activeQueue.id}`} size={160} />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black mb-1">{activeQueue.name}</h2>
                  <p className="text-slate-500 text-sm mb-4">Manage the live waitlist for {activeQueue.category}.</p>
                  <div className="inline-block bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Live Now
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold">Waitlist Customers</h3>
                  <span className="text-xs font-bold text-slate-400">{customers.filter(c => c.status === 'waiting').length} waiting</span>
                </div>

                <div className="p-6 space-y-3">
                  {customers.length === 0 && <p className="text-center py-10 text-slate-400 text-sm italic">No one in line yet...</p>}
                  {customers.map((c) => (
                    <div key={c.id} className={`flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${c.status === 'called' ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-100'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-black ${c.status === 'called' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {c.tokenNumber}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{c.name}</h4>
                          <p className="text-[10px] uppercase font-black text-slate-400">{c.status}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {c.status === 'waiting' && (
                          <button onClick={() => callCustomer(c.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs">
                            CALL
                          </button>
                        )}

                        <button
                          onClick={() => removeCustomer(c)} // UPDATED: Pass whole object 'c'
                          className="bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600 p-2 rounded-lg transition-all"
                          title="Complete/Remove"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-200"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
              <p className="font-black text-sm uppercase tracking-widest">Select a session from the lobby</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;