import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-20 relative overflow-hidden">
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-brand-900/10 blur-[130px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Contact{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">
              Us
            </span>
          </h1>
          <p className="text-slate-400">
            Have questions about timings, seats, or group bookings? Drop us a message.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch max-w-5xl mx-auto">
          {/* Details */}
          <div className="flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-2">Get in Touch</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Visit our main administrative office or give us a call. We look forward to welcoming you to Harsika library.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-slate-900 border border-slate-800 text-brand-400 rounded-xl">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-400 font-medium">Phone Support</h4>
                    <p className="text-sm text-slate-200 font-bold font-mono">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-slate-900 border border-slate-800 text-brand-400 rounded-xl">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-400 font-medium">Email Address</h4>
                    <p className="text-sm text-slate-200 font-bold">info@harsikalibrary.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-slate-900 border border-slate-800 text-brand-400 rounded-xl">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-400 font-medium">Library Location</h4>
                    <p className="text-sm text-slate-200 font-bold">1st Floor, Royal Arcade, Sector-15, Bengaluru</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Mockup */}
            <div className="glass-panel h-48 rounded-2xl overflow-hidden relative border border-slate-900 flex items-center justify-center bg-slate-900/30">
              <MapPin className="h-8 w-8 text-brand-500 absolute animate-bounce" />
              <div className="text-center p-4">
                <p className="text-xs text-slate-500 mt-6 uppercase font-bold tracking-wider font-mono">Interactive Location Map</p>
                <p className="text-[10px] text-slate-400">Bengaluru Corporate Hub Center</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-900 flex flex-col justify-between">
            <div className="mb-6 flex items-center space-x-2 text-brand-400">
              <MessageSquare className="h-5 w-5" />
              <h3 className="text-xl font-bold text-white">Send Feedback</h3>
            </div>

            {submitted ? (
              <div className="bg-brand-950/60 border border-brand-900 text-brand-400 p-6 rounded-2xl text-center flex-1 flex flex-col justify-center items-center">
                <Send className="h-10 w-10 mb-3 animate-pulse" />
                <h4 className="font-bold text-white mb-1">Message Sent!</h4>
                <p className="text-xs text-slate-400">We appreciate you reaching out and will reply shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition-all"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition-all"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Your Message</label>
                  <textarea
                    rows="4"
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none transition-all resize-none"
                    placeholder="Type your query..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-brand-950 hover:scale-[1.01] transition-all"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
