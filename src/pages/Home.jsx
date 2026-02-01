import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext'; // Import the hook

const Home = () => {
  const { isDarkMode, toggleTheme } = useTheme(); // Use Global State

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-hidden relative selection:bg-blue-500/30
      ${isDarkMode ? 'bg-[#030712] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      <button 
        onClick={toggleTheme}
        className={`absolute top-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300
          ${isDarkMode ? 'bg-white/10 text-yellow-400 hover:bg-white/20' : 'bg-white text-slate-700 border border-slate-200 hover:scale-110'}`}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className={`absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] animate-blob transition-opacity duration-500 ${isDarkMode ? 'opacity-20' : 'opacity-10'}`}></div>
      <div className={`absolute top-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000 transition-opacity duration-500 ${isDarkMode ? 'opacity-20' : 'opacity-10'}`}></div>
      <div className={`absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000 transition-opacity duration-500 ${isDarkMode ? 'opacity-20' : 'opacity-10'}`}></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
          <span className="bg-gradient-to-b from-blue-400 to-cyan-300 bg-clip-text text-transparent">ToKen.</span>
          <span className="bg-gradient-to-r from-purple-500 to-pink-400 bg-clip-text text-transparent">LeLo</span>
        </h1>
        
        <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-20 font-medium transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Say goodbye to physical queues. <span className={isDarkMode ? 'text-slate-200' : 'text-slate-900 font-bold'}>Smart queue management</span> that lets you reclaim your time with a single scan.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Link to="/user" className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2.5rem] opacity-20 group-hover:opacity-100 transition duration-500 blur"></div>
            <div className={`relative backdrop-blur-xl p-10 rounded-[2.5rem] border h-full flex flex-col items-start text-left transition-all duration-300
              ${isDarkMode ? 'bg-slate-900/80 border-white/10 group-hover:bg-slate-900/60' : 'bg-white/80 border-white/60 shadow-xl group-hover:bg-white/90'}`}>
              <div className="bg-blue-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20">
                <Users className="text-blue-500" size={28} />
              </div>
              <h3 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Join a Queue</h3>
              <p className={`text-lg leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Scan QR codes to get your virtual token. Track your position in real-time while you relax.
              </p>
              <div className="mt-auto flex items-center text-blue-500 font-bold group-hover:translate-x-2 transition-transform">
                Get Started <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>

          <Link to="/admin-login" className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-[2.5rem] opacity-20 group-hover:opacity-100 transition duration-500 blur"></div>
            <div className={`relative backdrop-blur-xl p-10 rounded-[2.5rem] border h-full flex flex-col items-start text-left transition-all duration-300
              ${isDarkMode ? 'bg-slate-900/80 border-white/10 group-hover:bg-slate-900/60' : 'bg-white/80 border-white/60 shadow-xl group-hover:bg-white/90'}`}>
              <div className="bg-purple-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/20">
                <ShieldCheck className="text-purple-500" size={28} />
              </div>
              <h3 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Business Portal</h3>
              <p className={`text-lg leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Create custom queues, automate flow, and manage visitors with powerful analytics.
              </p>
              <div className="mt-auto flex items-center text-purple-500 font-bold group-hover:translate-x-2 transition-transform">
                Admin Login <ArrowRight size={18} className="ml-2" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;