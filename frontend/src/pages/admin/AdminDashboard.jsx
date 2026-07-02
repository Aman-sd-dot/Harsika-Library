import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Armchair,
  IndianRupee,
  Megaphone,
  Bell,
  CheckCircle,
  AlertTriangle,
  Flame,
} from 'lucide-react';

const AdminDashboard = () => {
  const { API_BASE } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Notice Form State
  const [noticeForm, setNoticeForm] = useState({ title: '', message: '', type: 'notice' });
  const [notifSuccess, setNotifSuccess] = useState('');
  const [notifError, setNotifError] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [API_BASE]);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setNotifError('');
    setNotifSuccess('');
    setBroadcasting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(noticeForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to broadcast notice');
      }

      setNotifSuccess('Notice broadcasted to all students successfully.');
      setNoticeForm({ title: '', message: '', type: 'notice' });
    } catch (err) {
      setNotifError(err.message);
    } finally {
      setBroadcasting(false);
    }
  };

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: Users, color: 'text-indigo-400 bg-indigo-950/60 border-indigo-900/60' },
    { label: 'Occupied Seats', value: `${stats?.occupiedSeats ?? 0} / ${stats?.totalSeats ?? 0}`, icon: Armchair, color: 'text-emerald-400 bg-emerald-950/60 border-emerald-900/60' },
    { label: "Today's Collection", value: `₹${stats?.todayCollection ?? 0}`, icon: IndianRupee, color: 'text-amber-400 bg-amber-950/60 border-amber-900/60' },
    { label: 'Monthly Revenue', value: `₹${stats?.monthlyRevenue ?? 0}`, icon: Flame, color: 'text-pink-400 bg-pink-950/60 border-pink-900/60' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm">System oversight, revenue tracking, and global notifications dispatch center.</p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="glass-panel h-28 rounded-2xl animate-pulse bg-slate-900/30"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-slate-900">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{card.label}</span>
                  <span className="text-2xl font-extrabold text-white">{card.value}</span>
                </div>
                <div className={`p-3 rounded-xl border ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notice Dispatch Form */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-900 pb-3">
            <Megaphone className="h-5 w-5 text-indigo-400" />
            <span>Broadcast Announcement Notice</span>
          </h3>

          {notifSuccess && (
            <div className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 p-4 rounded-xl text-xs">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{notifSuccess}</span>
            </div>
          )}
          {notifError && (
            <div className="flex items-center space-x-2 bg-red-950/30 border border-red-900/40 text-red-400 p-4 rounded-xl text-xs">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{notifError}</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Notice Title</label>
              <input
                type="text"
                required
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-600"
                placeholder="e.g. Library Closed for Maintenance on Sunday"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Announcement Details</label>
              <textarea
                rows="4"
                required
                value={noticeForm.message}
                onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none resize-none placeholder-slate-600"
                placeholder="Type the announcement details here..."
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Alert Type</label>
                <select
                  value={noticeForm.type}
                  onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="notice">General Notice</option>
                  <option value="reminder">Fee Reminder</option>
                  <option value="expiry">Seat Expiry Notice</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {broadcasting ? 'Broadcasting...' : 'Dispatch Notice'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Quick actions box */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-900 pb-3">
            <Bell className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">System Logs</h3>
          </div>
          <div className="space-y-4 text-xs text-slate-400 leading-normal">
            <div>
              <h4 className="font-bold text-white mb-1">Standard Admin Credentials</h4>
              <p>For sandbox local testing, the default seeded admin account credentials are:</p>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 font-mono mt-1 text-[10px] text-brand-400 select-all">
                Email: admin@studyspace.com
                <br />
                Password: adminpassword123
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Offline Approvals</h4>
              <p>When students submit cash payments, they appear on the **Payments Board**. Review transaction reference IDs there and click Approve to unlock their seat assignment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
