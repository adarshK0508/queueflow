import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, Sparkles, UserPlus, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext'; // Import Hook

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme(); // Use Global State
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (isRegistering) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin-dashboard'); 
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-purple-500/30 overflow-hidden relative p-6 flex flex-col items-center justify-center 
      ${isDarkMode ? 'bg-[#030712] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      <button onClick={toggleTheme} className={`absolute top-6 right-6 p-3 rounded-full transition-all duration-300 shadow-lg z-50 ${isDarkMode ? 'bg-white/10 text-yellow-400 hover:bg-white/20' : 'bg-white text-slate-700 border border-slate-200 hover:scale-110'}`}>
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className={`absolute top-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] animate-blob transition-opacity duration-500 ${isDarkMode ? 'opacity-20' : 'opacity-10'}`}></div>
      <div className={`absolute bottom-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] animate-blob transition-opacity duration-500 ${isDarkMode ? 'opacity-20' : 'opacity-10'}`}></div>

      <div className="w-full max-w-md relative group">
        <div className={`absolute -inset-1 bg-gradient-to-r rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 ${isRegistering ? 'from-cyan-500 to-blue-600' : 'from-purple-600 to-pink-500'}`}></div>
        <div className={`relative backdrop-blur-2xl p-10 rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-white/80 border-white/40 shadow-slate-200/50'}`}>
          <div className="text-center mb-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto border transition-colors duration-500 ${isRegistering ? 'bg-blue-500/10 border-blue-500/20' : 'bg-purple-500/10 border-purple-500/20'}`}>
              {isRegistering ? <UserPlus className="text-blue-500" size={32} /> : <ShieldCheck className="text-purple-500" size={32} />}
            </div>
            <h2 className={`text-3xl font-black mb-2 tracking-tighter uppercase transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {isRegistering ? 'New Admin' : 'Business Login'}
            </h2>
            <div className={`flex items-center justify-center gap-2 text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              <Sparkles size={14} className={isRegistering ? 'text-blue-500' : 'text-purple-500'} />
              <span>{isRegistering ? 'Create Management Account' : 'Secure Dashboard Access'}</span>
            </div>
          </div>
          {error && <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold flex items-center gap-3 animate-pulse"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>{error}</div>}
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-widest ml-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Email Address</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} size={18} />
                <input type="email" className={`w-full p-4 pl-12 rounded-2xl outline-none border transition-all font-medium ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-purple-500/50 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-purple-500 placeholder:text-slate-400'}`} placeholder="admin@business.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-widest ml-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Password</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} size={18} />
                <input type="password" className={`w-full p-4 pl-12 rounded-2xl outline-none border transition-all font-medium ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-purple-500/50 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-purple-500 placeholder:text-slate-400'}`} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            <button disabled={loading} className={`w-full bg-gradient-to-r text-white p-5 rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${isRegistering ? 'from-blue-600 to-cyan-500' : 'from-purple-600 to-pink-500'}`}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>{isRegistering ? 'CREATE ACCOUNT' : 'ENTER PORTAL'} <ArrowRight size={20} /></>}
            </button>
          </form>
          <div className={`mt-8 text-center pt-6 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
            <button onClick={() => { setError(''); setIsRegistering(!isRegistering); }} className={`text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto group ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}>
              {isRegistering ? 'Already have an account?' : 'Need to create a queue?'}
              <span className={`text-transparent bg-clip-text bg-gradient-to-r group-hover:underline ${isRegistering ? 'from-blue-400 to-cyan-300' : 'from-purple-400 to-pink-300'}`}>{isRegistering ? 'Login Here' : 'Register Now'}</span>
            </button>
          </div>
        </div>
      </div>
      <Link to="/" className={`mt-8 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${isDarkMode ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-700'}`}>
        <ArrowRight className="rotate-180" size={14} /> Back to Gateway
      </Link>
    </div>
  );
};

export default AdminLogin;