import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, ArrowRight, Zap, Clock, Globe } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-8 shadow-sm">
          <Zap size={16} fill="currentColor" className="animate-pulse" />
          <span>Real-time Queue Sync Active</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
          Skip the Wait, <br />
          <span className="text-blue-600">Join Digitally.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-16 leading-relaxed">
          Smart queue management with a simple scan. Track your turn from anywhere. 
          No more standing in long lines.
        </p>

        {/* Selection Cards - Responsive Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4">
          
          {/* User Card Link - Pointing to /user */}
          <Link to="/user" className="group">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border-b-8 border-blue-600 hover:-translate-y-3 transition-all duration-300 text-left h-full flex flex-col justify-between">
              <div>
                <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                  <Users className="text-blue-600" size={32} />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                  Join a Queue 
                </h3>
                <p className="text-slate-500 text-lg">
                  Scan a QR code to get your virtual token. Get live updates on your position and wait time.
                </p>
              </div>
              <div className="mt-8 flex items-center text-blue-600 font-bold group-hover:gap-2 transition-all">
                Open Scanner <ArrowRight size={20} className="ml-2" />
              </div>
            </div>
          </Link>

          {/* Admin Card Link - Pointing to /admin-login */}
          <Link to="/admin-login" className="group">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border-b-8 border-purple-600 hover:-translate-y-3 transition-all duration-300 text-left h-full flex flex-col justify-between">
              <div>
                <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:-rotate-6 transition-transform">
                  <ShieldCheck className="text-purple-600" size={32} />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                  Admin Panel
                </h3>
                <p className="text-slate-500 text-lg">
                  Create queues, generate QR codes, and manage your visitors with real-time controls.
                </p>
              </div>
              <div className="mt-8 flex items-center text-purple-600 font-bold group-hover:gap-2 transition-all">
                Login as Admin <ArrowRight size={20} className="ml-2" />
              </div>
            </div>
          </Link>

        </div>

        {/* Feature Grid */}
        <div className="mt-28 grid grid-cols-1 sm:grid-cols-3 gap-12 border-t border-slate-200 pt-16">
          <div className="flex flex-col items-center group">
            <div className="bg-white shadow-md p-4 rounded-full mb-4 text-slate-700 group-hover:text-blue-600 transition-colors">
              <Clock size={24}/>
            </div>
            <h4 className="font-bold text-slate-800 text-lg">Save Time</h4>
            <p className="text-sm text-slate-500 mt-1">Reduce waiting by 80%</p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="bg-white shadow-md p-4 rounded-full mb-4 text-slate-700 group-hover:text-blue-600 transition-colors">
              <Globe size={24}/>
            </div>
            <h4 className="font-bold text-slate-800 text-lg">Access Anywhere</h4>
            <p className="text-sm text-slate-500 mt-1">Check status on mobile</p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="bg-white shadow-md p-4 rounded-full mb-4 text-slate-700 group-hover:text-blue-600 transition-colors">
              <Zap size={24}/>
            </div>
            <h4 className="font-bold text-slate-800 text-lg">Live Updates</h4>
            <p className="text-sm text-slate-500 mt-1">Real-time synchronization</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;