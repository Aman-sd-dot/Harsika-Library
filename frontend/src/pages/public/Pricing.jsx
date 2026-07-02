import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Check, ShieldCheck, HelpCircle } from 'lucide-react';

const Pricing = () => {
  const { API_BASE } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackPlans = [
    { _id: '1', planName: '1 Month Standard', duration: 1, price: 1000, description: 'Access to general study desks for 1 month.' },
    { _id: '2', planName: '3 Month Premium', duration: 3, price: 2700, description: 'Access to quiet desks with power outlets for 3 months.' },
    { _id: '3', planName: '6 Month Elite', duration: 6, price: 5000, description: 'Access to premium personal cubicles for 6 months.' },
  ];

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_BASE}/plans`);
        if (res.ok) {
          const data = await res.json();
          setPlans(data.length > 0 ? data : fallbackPlans);
        } else {
          setPlans(fallbackPlans);
        }
      } catch (err) {
        console.error('Failed to fetch pricing plans:', err);
        setPlans(fallbackPlans);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [API_BASE]);

  return (
    <div className="min-h-screen bg-slate-950 py-20 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-900/10 blur-[120px]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Simple, Transparent{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">
              Pricing
            </span>
          </h1>
          <p className="text-slate-400 text-base">
            Choose a plan that fits your study routine. All plans include high-speed Wi-Fi, desk charging ports, and silent study zones.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-16">
            {plans.map((plan, idx) => {
              const isPopular = idx === 1; // Mark the 3 Month plan as popular
              return (
                <div
                  key={plan._id}
                  className={`glass-panel rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 hover:scale-[1.02] ${
                    isPopular ? 'border-brand-500/40 ring-1 ring-brand-500/30 bg-slate-900/45' : ''
                  }`}
                >
                  {isPopular && (
                    <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-brand-600 text-white rounded-full">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.planName}</h3>
                    <p className="text-sm text-slate-400 mb-6 min-h-[40px]">{plan.description}</p>
                    
                    <div className="flex items-baseline mb-6 border-b border-slate-900 pb-6">
                      <span className="text-4xl font-extrabold text-white">₹{plan.price}</span>
                      <span className="text-slate-400 text-sm ml-2">/ {plan.duration} {plan.duration === 1 ? 'Month' : 'Months'}</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center text-sm text-slate-300">
                        <Check className="h-4.5 w-4.5 text-brand-400 mr-2.5 shrink-0" />
                        <span>Reserved Study Desk</span>
                      </li>
                      <li className="flex items-center text-sm text-slate-300">
                        <Check className="h-4.5 w-4.5 text-brand-400 mr-2.5 shrink-0" />
                        <span>Unlimited High Speed Wi-Fi</span>
                      </li>
                      <li className="flex items-center text-sm text-slate-300">
                        <Check className="h-4.5 w-4.5 text-brand-400 mr-2.5 shrink-0" />
                        <span>Charging port & Desk Lamp</span>
                      </li>
                      <li className="flex items-center text-sm text-slate-300">
                        <Check className="h-4.5 w-4.5 text-brand-400 mr-2.5 shrink-0" />
                        <span>AC & Purified Drinking Water</span>
                      </li>
                    </ul>
                  </div>

                  <Link
                    to="/register"
                    className={`w-full text-center py-3 rounded-xl font-semibold transition-all duration-200 ${
                      isPopular
                        ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/30'
                        : 'bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    Select Plan
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Security / FAQ badge */}
        <div className="glass-panel max-w-2xl mx-auto rounded-2xl p-6 flex items-center space-x-4 border border-slate-800">
          <div className="p-3 bg-brand-950 border border-brand-950 text-brand-400 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Refund & Freeze Policy</h4>
            <p className="text-xs text-slate-400">
              Memberships can be frozen or transferred under special circumstances with Admin approval. Offline payments are reviewed within 2 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
