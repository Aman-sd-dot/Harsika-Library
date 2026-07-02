import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Armchair,
  Bell,
  Clock,
  LogOut,
  CalendarCheck,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, refreshUser, API_BASE } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch student info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Refresh student details from database
        await refreshUser();
        
        // Fetch notifications
        const notifRes = await fetch(`${API_BASE}/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData.slice(0, 5)); // Get latest 5
        }

        // Fetch attendance logs
        const attRes = await fetch(`${API_BASE}/attendance/my`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (attRes.ok) {
          const attData = await attRes.json();
          setAttendance(attData);
        }
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE]);

  // Handle Mark Attendance (Check-in/Check-out)
  const handleAttendance = async (type) => {
    setErrorMsg('');
    setSuccessMsg('');
    setActionLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/attendance/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Failed to ${type}`);
      }

      setSuccessMsg(data.message);
      
      // Reload Attendance Logs
      const attRes = await fetch(`${API_BASE}/attendance/my`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (attRes.ok) {
        const attData = await attRes.json();
        setAttendance(attData);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to check if already checked in today
  const getLocalDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString();
  const todayRecord = attendance.find((r) => r.date === todayStr);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Student Dashboard</h1>
        <p className="text-slate-400 text-sm">Welcome back, {user?.name}! Manage your library reservation below.</p>
      </div>

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 p-4 rounded-xl text-sm">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center space-x-2 bg-red-950/30 border border-red-900/40 text-red-400 p-4 rounded-xl text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Stats Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Seat Status */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-brand-950/50 border-b border-l border-slate-800 text-brand-400 rounded-bl-xl">
            <Armchair className="h-5 w-5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">My Seat</h3>
          {user?.assignedSeat ? (
            <div>
              <p className="text-2xl font-extrabold text-white">Seat {user.assignedSeat.seatNumber}</p>
              <p className="text-xs text-slate-400 mt-1">
                {user.assignedSeat.floor} • {user.assignedSeat.room}
              </p>
              <p className="text-[10px] text-brand-400 font-bold mt-2">
                Expiry: {new Date(user.assignedSeat.expiryDate).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-bold text-slate-400">No Seat Assigned</p>
              {user?.seatRequest?.status === 'pending' ? (
                <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold bg-amber-950 border border-amber-900 text-amber-400 rounded-full">
                  Request Pending Admin Assign
                </span>
              ) : (
                <Link
                  to="/dashboard/seat"
                  className="inline-block mt-3 text-xs bg-brand-600 hover:bg-brand-500 text-white font-semibold px-3 py-1.5 rounded-lg"
                >
                  Book Seat Now
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Daily Attendance Clock */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-brand-950/50 border-b border-l border-slate-800 text-brand-400 rounded-bl-xl">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Daily Attendance</h3>
          
          {!user?.assignedSeat ? (
            <p className="text-sm text-slate-400">Assign a seat first to mark attendance.</p>
          ) : (
            <div className="space-y-3">
              {todayRecord ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">Checked In: <span className="font-bold text-white font-mono">{new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
                    {todayRecord.checkOut ? (
                      <p className="text-sm text-slate-300 mt-0.5">Checked Out: <span className="font-bold text-white font-mono">{new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
                    ) : (
                      <p className="text-xs text-brand-400 font-semibold animate-pulse mt-0.5">Currently inside study hall</p>
                    )}
                  </div>
                  {!todayRecord.checkOut && (
                    <button
                      onClick={() => handleAttendance('checkout')}
                      disabled={actionLoading}
                      className="bg-red-950/30 border border-red-900/60 hover:bg-red-900/40 text-red-400 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                    >
                      Check Out
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">Not checked in today.</p>
                  <button
                    onClick={() => handleAttendance('checkin')}
                    disabled={actionLoading}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-brand-950 transition-all"
                  >
                    Check In
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Membership Details */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-brand-950/50 border-b border-l border-slate-800 text-brand-400 rounded-bl-xl">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">My Plan Status</h3>
          {user?.seatRequest?.plan ? (
            <div>
              <p className="text-lg font-bold text-white">{user.seatRequest.plan.planName}</p>
              <p className="text-xs text-slate-400 mt-1">₹{user.seatRequest.plan.price} / {user.seatRequest.plan.duration} Month(s)</p>
              <span className={`inline-block mt-2 px-2 py-0.5 text-[9px] font-bold rounded-full ${
                user.seatRequest.status === 'approved' ? 'bg-emerald-950 border border-emerald-900 text-emerald-400' : 'bg-amber-950 border border-amber-900 text-amber-400'
              }`}>
                Plan: {user.seatRequest.status}
              </span>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-400">No Active Membership Plan</p>
              <Link to="/dashboard/seat" className="inline-block mt-3 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-3.5 py-1.5 rounded-lg">
                Choose Plan
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notice Bulletin Board */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center space-x-2 text-brand-400">
              <Bell className="h-5 w-5" />
              <h3 className="text-lg font-bold text-white">Notice Bulletin</h3>
            </div>
            <Link to="/dashboard/notifications" className="text-xs text-slate-400 hover:text-white transition-colors">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500">Loading notices...</div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">No new notices posted by Admin.</div>
          ) : (
            <div className="space-y-3.5">
              {notifications.map((notif) => (
                <div key={notif._id} className="p-4 bg-slate-950/50 border border-slate-900 rounded-2xl flex items-start space-x-3 hover:border-slate-800 transition-colors">
                  <div className="p-2 rounded-xl bg-brand-950/60 border border-brand-900 text-brand-400 shrink-0 mt-0.5">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white mb-0.5">{notif.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-500 mt-1.5 block font-mono">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Help card */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center space-x-2 text-brand-400 border-b border-slate-900 pb-3">
            <HelpCircle className="h-5 w-5" />
            <h3 className="text-lg font-bold text-white">Support & Info</h3>
          </div>
          <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
            <div>
              <h4 className="font-bold text-white mb-1">How does seat allocation work?</h4>
              <p>Submit a request. The administrator will review available seat vacancies, assign a desk, and generate a bill. Once paid, your seat is secure.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">What is mock checkout?</h4>
              <p>For ease of testing, selecting "UPI Online" mock payment approves payments and updates seat expiries instantly.</p>
            </div>
            <div className="pt-2 border-t border-slate-900 text-[10px] text-center font-mono">
              For queries, contact Admin at Reception or call +91 98765 43210.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
