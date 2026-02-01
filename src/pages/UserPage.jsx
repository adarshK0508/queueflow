import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { db } from '../firebase';
// Ensure this path matches where you saved the AI component!
import AiEstimate from '../component/AiEstimate'; 
import {
  collection, serverTimestamp, doc, onSnapshot, getDoc, 
  addDoc, getDocs, deleteDoc, query, orderBy, where, limit
} from 'firebase/firestore';

const UserPage = () => {
  const [queueId, setQueueId] = useState(localStorage.getItem('savedQueueId'));
  const [myDocId, setMyDocId] = useState(localStorage.getItem('savedDocId'));
  const [userName, setUserName] = useState("");
  const [isEnteringName, setIsEnteringName] = useState(false);
  const [userData, setUserData] = useState(null);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [loading, setLoading] = useState(false);
  const [serviceFinished, setServiceFinished] = useState(false);
  
  // --- AI DATA STATE ---
  const [history, setHistory] = useState([]);
  const [myPosition, setMyPosition] = useState(0);

  // 1. Listen for the last 5 completed sessions for the AI 🧠
  useEffect(() => {
    if (!queueId) return;

    const historyQuery = query(
      collection(db, "queues", queueId, "history"),
      orderBy("completedAt", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
      const historyData = snapshot.docs.map(doc => doc.data());
      setHistory(historyData);
    });

    return () => unsubscribe();
  }, [queueId]);

  // --- ALERTS SYSTEM ---
  const triggerAlerts = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log("Sound blocked by browser"));
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    alert("🔔 IT'S YOUR TURN!");
  };

  // 2. LIVE SYNC & POSITION CALCULATION
  useEffect(() => {
    if (queueId && myDocId) {
      const waitlistRef = collection(db, "queues", queueId, "waitlist");

      const unsubscribe = onSnapshot(waitlistRef, (snapshot) => {
        const allDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const me = allDocs.find(d => d.id === myDocId);

        if (!me) {
          setUserData(null);
          setServiceFinished(true);
          localStorage.removeItem('savedQueueId');
          localStorage.removeItem('savedDocId');
        } else {
          if (userData?.status === 'waiting' && me.status === 'called') {
            triggerAlerts();
          }
          setUserData(me);
          
          const ahead = allDocs.filter(d =>
            d.status === 'waiting' && d.tokenNumber < me.tokenNumber
          );
          
          setPeopleAhead(ahead.length);
          // We set position as (people ahead + 1) for the AI prediction
          setMyPosition(ahead.length + 1); 
        }
      });
      return () => unsubscribe();
    }
  }, [queueId, myDocId, userData?.status]);

  // --- LEAVE QUEUE ---
  const leaveQueue = async () => {
    if (window.confirm("Are you sure you want to leave?")) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, "queues", queueId, "waitlist", myDocId));
        localStorage.clear();
        window.location.reload();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  // --- SCANNER ---
  // --- SCANNER ---
useEffect(() => {
  // Only initialize if we don't have a queueId and aren't finished
  if (!queueId && !serviceFinished) {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

    scanner.render(async (decodedText) => {
      try {
        const url = new URL(decodedText);
        const id = url.searchParams.get("id");
        if (id) {
          // 1. Clear the scanner FIRST while the #reader div still exists
          await scanner.clear(); 
          
          // 2. Then update state, which will hide the #reader div
          setQueueId(id);
          setIsEnteringName(true);
        }
      } catch (err) {
        console.error("Scan error:", err);
      }
    });

    return () => {
      // Use a check to see if the element still exists before clearing
      const readerElem = document.getElementById("reader");
      if (readerElem) {
        scanner.clear().catch(error => {
          console.error("Failed to clear scanner during unmount:", error);
        });
      }
    };
  }
}, [queueId, serviceFinished]);

  const joinQueue = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const waitlistRef = collection(db, "queues", queueId, "waitlist");
      const snapshot = await getDocs(waitlistRef);
      const myToken = snapshot.size + 1;

      const docRef = await addDoc(waitlistRef, {
        name: userName,
        tokenNumber: myToken,
        status: "waiting",
        joinedAt: serverTimestamp(),
      });

      localStorage.setItem('savedQueueId', queueId);
      localStorage.setItem('savedDocId', docRef.id);
      setMyDocId(docRef.id);
      setIsEnteringName(false);
    } catch (error) { alert("Error joining."); }
    setLoading(false);
  };

  const reset = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-blue-600">Processing...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">

      {!queueId && !serviceFinished && (
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg text-center border">
          <h2 className="text-xl font-black mb-4 uppercase tracking-tighter">Scan QR to Join</h2>
          <div id="reader" className="rounded-xl overflow-hidden shadow-inner"></div>
        </div>
      )}

      {isEnteringName && !userData && (
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl text-center">
          <h2 className="text-2xl font-black mb-4">Identity</h2>
          <form onSubmit={joinQueue} className="space-y-4">
            <input
              autoFocus
              className="w-full p-4 bg-slate-100 rounded-2xl outline-none font-bold"
              placeholder="Your Full Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            <button className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black shadow-lg">GET MY TOKEN</button>
          </form>
        </div>
      )}

      {userData && (
        <div className="w-full max-w-sm">
          <div className={`relative overflow-hidden rounded-[3rem] shadow-xl transition-all duration-500 ${userData.status === 'called' ? 'bg-emerald-600 scale-105' : 'bg-white'}`}>
            <div className={`p-8 text-center ${userData.status === 'called' ? 'bg-emerald-700/50' : 'bg-blue-600'}`}>
              <p className="font-display text-[16px] font-black uppercase tracking-[0.3em] text-white/70">Entry Pass</p>
            </div>

            <div className="p-12 text-center">
              <p className={`font-bold uppercase tracking-widest text-[15px] mb-2 ${userData.status === 'called' ? 'text-emerald-500' : 'text-slate-500'}`}>
                Your Position
              </p>

              <h1 className={`font-display text-[10rem] font-black leading-none mb-4 tracking-tighter ${userData.status === 'called' ? 'text-white' : 'text-slate-900'}`}>
                {userData.tokenNumber}
              </h1>

              {/* 3. DISPLAY AI PREDICTION HERE */}
              <AiEstimate historyData={history} userPosition={myPosition} />

              <div className="mt-8 mb-8">
                <p className={`text-lg font-black ${userData.status === 'called' ? 'text-white' : 'text-slate-900'}`}>{userData.name}</p>
              </div>

              {userData.status === 'waiting' ? (
                <div className="inline-flex items-center gap-2 bg-blue-50 px-6 py-3 rounded-2xl">
                   <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                  <span className="font-black text-blue-700 text-sm">
                    {peopleAhead === 0 ? "Prepare to enter!" : `${peopleAhead} people ahead`}
                  </span>
                </div>
              ) : (
                <div className="bg-white text-emerald-700 py-4 px-8 rounded-2xl font-black text-xl shadow-xl animate-bounce">
                  REACH THE COUNTER
                </div>
              )}
            </div>
          </div>

          <button onClick={leaveQueue} className="w-full mt-8 py-4 px-6 font-black text-rose-500 border-2 border-rose-500 rounded-2xl transition-all hover:bg-rose-500 hover:text-white">
            Leave Queue
          </button>
        </div>
      )}

      {serviceFinished && (
        <div className="w-full max-w-sm bg-white p-10 rounded-[3rem] shadow-xl text-center border-t-8 border-emerald-500">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Service Complete</h2>
          <button onClick={reset} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold">Finish & Scan New</button>
        </div>
      )}
    </div>
  );
};

export default UserPage;