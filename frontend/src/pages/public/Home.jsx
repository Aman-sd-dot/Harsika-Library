import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Wifi, Coffee, BatteryCharging, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-900/20 blur-[120px] animate-glow-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-600/10 blur-[150px] animate-glow-slow" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-950/60 border border-brand-800 text-brand-400 text-xs font-semibold mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Premium Academic Study Hub</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none mb-6">
            Elevate Your Study Experience at{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">
              Harsika Library
            </span>
          </h1>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            A state-of-the-art quiet study environment tailored for students, researchers, and professionals. Reserving premium seats, check in seamlessly, and unlock success.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-900/30 hover:shadow-brand-900/50 hover:scale-[1.02] transition-all duration-200"
            >
              Get Started Now
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
            >
              View Membership Plans
            </Link>
          </div>
        </div>
      </div>

      {/* Amenities Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Designed for Deep Focus</h2>
          <p className="text-slate-400">Everything you need to boost your academic productivity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl hover:border-brand-500/30 transition-all duration-300">
            <div className="p-3 bg-brand-950/60 border border-brand-900 text-brand-400 rounded-xl w-fit mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Personal Cubicles</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ergonomic desks designed to maximize privacy and focus during long study sessions.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl hover:border-brand-500/30 transition-all duration-300">
            <div className="p-3 bg-brand-950/60 border border-brand-900 text-brand-400 rounded-xl w-fit mb-4">
              <Wifi className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">High-Speed Wi-Fi</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dedicated high-bandwidth internet connectivity for seamless digital resource browsing.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl hover:border-brand-500/30 transition-all duration-300">
            <div className="p-3 bg-brand-950/60 border border-brand-900 text-brand-400 rounded-xl w-fit mb-4">
              <BatteryCharging className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Power Outlets</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Individual charging hubs at every single seat to keep your laptops and tablets powered.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl hover:border-brand-500/30 transition-all duration-300">
            <div className="p-3 bg-brand-950/60 border border-brand-900 text-brand-400 rounded-xl w-fit mb-4">
              <Coffee className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Comfort Zone</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Air-conditioned study zones, beverage counters, and discussion areas for breaks.
            </p>
          </div>
        </div>
      </div>

      {/* Rules / Steps Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 border-t border-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Seamless Seat Booking</h2>
            <p className="text-slate-400 mb-6">
              Our automated portal helps you secure your favorite study desk without the early morning rush.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-brand-400 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Create Account</h4>
                  <p className="text-sm text-slate-400">Register as a student in under a minute.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-brand-400 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Select a Plan & Seat</h4>
                  <p className="text-sm text-slate-400">Request your preferred room, floor, and seat duration.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-brand-400 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Approve & Study</h4>
                  <p className="text-sm text-slate-400">Admin reviews assignments and online/offline payments.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-panel p-8 rounded-3xl relative">
            <div className="absolute top-0 right-0 p-3 bg-red-950/40 border-b border-l border-slate-800 text-red-400 rounded-bl-2xl rounded-tr-3xl flex items-center space-x-1">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase font-mono">Library Code</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Study Guidelines</h3>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                <span>Maintain absolute silence inside the study hall.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                <span>Keep your ID cards with you at all times.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                <span>Do not reserve desks with personal belongings when away.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                <span>Ensure check-out triggers when exiting to maintain attendance.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
