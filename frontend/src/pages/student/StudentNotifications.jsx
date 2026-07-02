import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, MailOpen, Mail, ShieldAlert, Check } from 'lucide-react';

const StudentNotifications = () => {
  const { API_BASE } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [API_BASE]);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        // Optimistically update status
        setNotifications((notifs) =>
          notifs.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Error marking notice as read:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Notifications Inbox</h1>
        <p className="text-slate-400 text-sm">Read alerts, warnings, and announcements broadcast by library administrators.</p>
      </div>

      {/* Notifications Panel */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-900 pb-3">
          <Bell className="h-5 w-5 text-brand-400" />
          <span>My Alerts</span>
        </h3>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading inbox...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">Your inbox is completely clear!</div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const isAlert = notif.type === 'expiry' || notif.type === 'reminder';
              return (
                <div
                  key={notif._id}
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                    notif.isRead
                      ? 'bg-slate-950/20 border-slate-900 text-slate-400'
                      : 'bg-slate-900/35 border-slate-800 text-slate-100'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
                        notif.isRead
                          ? 'bg-slate-900 border-slate-850 text-slate-600'
                          : isAlert
                          ? 'bg-red-950/40 border-red-900/40 text-red-400'
                          : 'bg-brand-950 border-brand-900 text-brand-400'
                      }`}
                    >
                      {notif.isRead ? <MailOpen className="h-4.5 w-4.5" /> : <Mail className="h-4.5 w-4.5" />}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm ${notif.isRead ? 'text-slate-400' : 'text-white'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-500 font-mono mt-2 block">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-950 rounded-lg transition-all"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;
