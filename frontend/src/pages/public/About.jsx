import React from 'react';
import { Clock, HelpCircle, Phone, MapPin, Mail, BookOpen } from 'lucide-react';

const About = () => {
  const faqs = [
    { q: 'How do I book a seat?', a: 'Register a student account, choose a membership plan, submit a request, and pay the fee. Once approved, the admin will assign you a physical desk.' },
    { q: 'Can I pay cash offline?', a: 'Yes! Select the cash or bank transfer option during seat checkout. Note down the transaction reference, hand it over at the reception, and the admin will approve it.' },
    { q: 'Are there charging points?', a: 'Yes, every desk has a dedicated power strip and desk lamp for uninterrupted study.' },
    { q: 'Can I change my assigned seat?', a: 'You can submit a request or speak to the front desk administrator to reassign your seat if an alternative is available.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-20 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-brand-900/10 blur-[130px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            About{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">
              Harsika Library
            </span>
          </h1>
          <p className="text-slate-400">
            Providing premium workspace infrastructure designed to unlock your potential.
          </p>
        </div>

        {/* Info Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="glass-panel p-8 rounded-2xl">
            <div className="p-3 bg-brand-950 border border-brand-900 text-brand-400 rounded-xl w-fit mb-4">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Timings</h3>
            <p className="text-sm text-slate-400 mb-4">Open every day including holidays.</p>
            <div className="space-y-2 text-sm text-slate-300 font-mono">
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span>Opening Time:</span>
                <span className="text-brand-400 font-semibold">08:00 AM</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span>Closing Time:</span>
                <span className="text-brand-400 font-semibold">10:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Silent Hours:</span>
                <span className="text-brand-400">All Day</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl lg:col-span-2">
            <div className="p-3 bg-brand-950 border border-brand-900 text-brand-400 rounded-xl w-fit mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Code of Conduct</h3>
            <p className="text-sm text-slate-400 mb-4">We maintain strict decorum to preserve focus.</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                <span>Silence must be maintained inside study rooms.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                <span>Phone calls are only allowed in the lobby.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                <span>Clean your desk when departing.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                <span>No outside food is permitted in study chambers.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-900">
                <div className="flex items-start space-x-3">
                  <HelpCircle className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white mb-2">{faq.q}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
