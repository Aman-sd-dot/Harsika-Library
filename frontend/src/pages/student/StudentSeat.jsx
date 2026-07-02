import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Armchair,
  CheckCircle,
  Clock,
  HelpCircle,
  PlusCircle,
  AlertTriangle,
} from 'lucide-react';

const StudentSeat = () => {
  const { user, refreshUser, API_BASE } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ planId: '', preferredFloor: 'Any', preferredRoom: 'Any' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        await refreshUser();
        const res = await fetch(`${API_BASE}/plans`);
        if (res.ok) {
          const data = await res.json();
          setPlans(data);
          if (data.length > 0) {
            setForm((f) => ({ ...f, planId: data[0]._id }));
          }
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [API_BASE]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/seats/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit seat request');
      }

      setSuccess(data.message);
      await refreshUser(); // Update session user state
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Seat Booking & Request</h1>
        <p className="text-slate-400 text-sm">Request a library seat assignment and choose your study hours package.</p>
      </div>

      {success && (
        <div className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 p-4 rounded-xl text-sm">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center space-x-2 bg-red-950/30 border border-red-900/40 text-red-400 p-4 rounded-xl text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-900 pb-3">
            <Armchair className="h-5 w-5 text-brand-400" />
            <span>Seat Request Status</span>
          </h3>

          {user?.assignedSeat ? (
            <div className="p-6 bg-slate-900/40 border border-brand-500/20 rounded-2xl space-y-4">
              <div className="flex items-center space-x-3 text-brand-400">
                <CheckCircle className="h-6 w-6" />
                <h4 className="font-extrabold text-lg text-white">Seat Reserved Successfully</h4>
              </div>
              <p className="text-slate-400 text-sm">
                You have been assigned **Seat {user.assignedSeat.seatNumber}** located on **{user.assignedSeat.floor} ({user.assignedSeat.room})**.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-slate-800 pt-4 text-slate-400">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Assigned Date</span>
                  <span className="text-slate-200">{new Date(user.assignedSeat.assignedDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Expiry Date</span>
                  <span className="text-brand-400 font-bold">{new Date(user.assignedSeat.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ) : user?.seatRequest && user.seatRequest.status === 'pending' ? (
            <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center space-x-3 text-amber-500">
                <Clock className="h-6 w-6 animate-pulse" />
                <h4 className="font-bold text-lg text-white">Request Pending Approval</h4>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your request for seat allocation is currently under review by the administrator. Please make the payment to expedite seat assignment.
              </p>
              <div className="grid grid-cols-3 gap-4 text-xs font-mono border-t border-slate-850 pt-4 text-slate-400">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Floor Choice</span>
                  <span className="text-slate-200">{user.seatRequest.preferredFloor}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Room Choice</span>
                  <span className="text-slate-200">{user.seatRequest.preferredRoom}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Request Date</span>
                  <span className="text-slate-200">{new Date(user.seatRequest.requestDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                You do not have an active seat assignment. Submit a request below to get started.
              </p>

              {loading ? (
                <div className="text-center py-6 text-slate-500">Loading plans...</div>
              ) : plans.length === 0 ? (
                <div className="p-4 bg-red-950/20 border border-red-900/40 text-red-400 text-sm rounded-xl">
                  No active membership plans found. Please check back later.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Select Plan</label>
                    <select
                      value={form.planId}
                      onChange={(e) => setForm({ ...form, planId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none cursor-pointer"
                    >
                      {plans.map((p) => (
                        <option key={p._id} value={p._id} className="bg-slate-950 text-white">
                          {p.planName} — ₹{p.price} ({p.duration} Month{p.duration > 1 ? 's' : ''})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Floor Preference</label>
                      <select
                        value={form.preferredFloor}
                        onChange={(e) => setForm({ ...form, preferredFloor: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none cursor-pointer"
                      >
                        <option value="Any">Any Floor (Recommended)</option>
                        <option value="Floor 1">Floor 1 (Quiet Study)</option>
                        <option value="Floor 2">Floor 2 (General Desks)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Room Preference</label>
                      <select
                        value={form.preferredRoom}
                        onChange={(e) => setForm({ ...form, preferredRoom: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none cursor-pointer"
                      >
                        <option value="Any">Any Room</option>
                        <option value="Room A">Room A (Personal Cubicles)</option>
                        <option value="Room B">Room B (Shared Tables)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-4"
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span>Submit Seat Request</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Guidelines */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 h-fit">
          <div className="flex items-center space-x-2 text-brand-400 border-b border-slate-900 pb-3">
            <HelpCircle className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">Guidelines</h3>
          </div>
          <div className="space-y-4 text-xs text-slate-400">
            <div>
              <h4 className="font-bold text-white mb-1">Choosing your desk</h4>
              <p>Preferences are taken into account but final seat allocations are subject to seat availability at the time of admin review.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Seat Expiration</h4>
              <p>Your seat booking is locked to the billing period of the selected membership plan. Expired assignments are automatically released back to the pool.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSeat;
