import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, CheckCircle, AlertTriangle } from 'lucide-react';

const AdminSettings = () => {
  const { API_BASE } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    openingTime: '',
    closingTime: '',
    rulesText: '', // Will split by line
    notice: '',
    contactNumber: '',
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/settings`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            openingTime: data.openingTime || '',
            closingTime: data.closingTime || '',
            rulesText: data.rules ? data.rules.join('\n') : '',
            notice: data.notice || '',
            contactNumber: data.contactNumber || '',
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [API_BASE]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setSubmitting(true);

    const rules = form.rulesText
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          openingTime: form.openingTime,
          closingTime: form.closingTime,
          rules,
          notice: form.notice,
          contactNumber: form.contactNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update settings');

      setSuccess('Settings updated successfully.');
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Settings</h1>
        <p className="text-slate-400 text-sm">Configure timings, rules lists, and notice boards displayed publicly.</p>
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

      {loading ? (
        <div className="glass-panel h-96 rounded-3xl animate-pulse bg-slate-900/30"></div>
      ) : (
        <div className="glass-panel p-6 rounded-3xl max-w-3xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-900 pb-3">
            <Settings className="h-5 w-5 text-indigo-400" />
            <span>Library Configurations</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Opening Hour</label>
                <input
                  type="text"
                  required
                  value={form.openingTime}
                  onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-650"
                  placeholder="e.g. 08:00 AM"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Closing Hour</label>
                <input
                  type="text"
                  required
                  value={form.closingTime}
                  onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-650"
                  placeholder="e.g. 10:00 PM"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Reception Contact Number</label>
                <input
                  type="text"
                  required
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-650"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Public Welcome Board Text</label>
                <input
                  type="text"
                  required
                  value={form.notice}
                  onChange={(e) => setForm({ ...form, notice: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-650"
                  placeholder="Welcome bulletin text..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Library Guidelines & Rules (One rule per line)</label>
              <textarea
                rows="6"
                required
                value={form.rulesText}
                onChange={(e) => setForm({ ...form, rulesText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none resize-none placeholder-slate-600 font-sans"
                placeholder="Rule 1&#10;Rule 2&#10;Rule 3..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 mt-4"
            >
              {submitting ? 'Saving Configurations...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
