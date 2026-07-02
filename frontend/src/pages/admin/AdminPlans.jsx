import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardList,
  CheckCircle,
  PlusCircle,
  X,
  Trash2,
  Edit2,
  AlertTriangle,
} from 'lucide-react';

const AdminPlans = () => {
  const { API_BASE } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null); // plan object if editing
  const [form, setForm] = useState({ planName: '', duration: 1, price: 1000, description: '' });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/plans/all`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [API_BASE]);

  const openAddModal = () => {
    setEditingPlan(null);
    setForm({ planName: '', duration: 1, price: 1000, description: '' });
    setModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setForm({
      planName: plan.planName,
      duration: plan.duration,
      price: plan.price,
      description: plan.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const isEdit = !!editingPlan;
    const url = isEdit ? `${API_BASE}/plans/${editingPlan._id}` : `${API_BASE}/plans`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');

      setSuccess(`Plan ${isEdit ? 'updated' : 'created'} successfully.`);
      setModalOpen(false);
      fetchPlans();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Plan Active State
  const handleToggleActive = async (plan) => {
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/plans/${plan._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });

      if (res.ok) {
        setSuccess(`Plan status updated.`);
        fetchPlans();
      }
    } catch (err) {
      setError('Failed to update plan status.');
    }
  };

  // Delete Plan
  const handleDeletePlan = async (planId, name) => {
    if (!window.confirm(`Are you sure you want to delete membership plan "${name}"?`)) return;
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/plans/${planId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        setSuccess(`Plan deleted successfully.`);
        fetchPlans();
      }
    } catch (err) {
      setError('Failed to delete plan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Membership Plans</h1>
          <p className="text-slate-400 text-sm">Create, edit, and deactivate pricing models and study space subscriptions.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-950 transition-all self-start"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Add New Plan</span>
        </button>
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

      {/* Plans List */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-900 pb-3">
          <ClipboardList className="h-5 w-5 text-indigo-400" />
          <span>Subscription Plans Ledger</span>
        </h3>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No plans created yet. Click "Add New Plan" to start.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-900">
                <tr>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {plans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-slate-900/15">
                    <td className="py-3.5 px-4 font-bold text-white">{plan.planName}</td>
                    <td className="py-3.5 px-4 font-mono text-xs">{plan.duration} Month(s)</td>
                    <td className="py-3.5 px-4 font-bold text-white">₹{plan.price}</td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-xs text-slate-400">{plan.description}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(plan)}
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize transition-all border ${
                          plan.isActive
                            ? 'bg-emerald-950 border-emerald-900 text-emerald-400 hover:bg-emerald-900/20'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-850'
                        }`}
                      >
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 rounded-lg transition-colors"
                          title="Edit plan"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan._id, plan.planName)}
                          className="p-1.5 bg-slate-900 hover:bg-red-950/40 text-red-500 border border-slate-800 hover:border-red-900 rounded-lg transition-colors"
                          title="Delete plan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
              <ClipboardList className="h-5 w-5 text-indigo-400" />
              <span>{editingPlan ? 'Modify Membership Plan' : 'Create Pricing Option'}</span>
            </h3>
            <p className="text-slate-400 text-xs mb-6">Configure the billing durations and fees structures for study space access.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Plan Name</label>
                <input
                  type="text"
                  required
                  value={form.planName}
                  onChange={(e) => setForm({ ...form, planName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-600"
                  placeholder="e.g. 1 Month Premium Pass"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Duration (Months)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Price (INR)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Plan Description</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none resize-none placeholder-slate-600"
                  placeholder="What is included in this package..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-4"
              >
                {submitting ? 'Saving Plan...' : 'Save Plan Details'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;
