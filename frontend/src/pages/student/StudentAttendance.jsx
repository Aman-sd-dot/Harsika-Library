import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CalendarCheck, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

const StudentAttendance = () => {
  const { API_BASE } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Browser-safe formatting helpers to avoid Safari Date parsing crashes
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '—';
    const safeStr = typeof dateStr === 'string' && dateStr.includes('-') ? dateStr.replace(/-/g, '/') : dateStr;
    const d = new Date(safeStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return '—';
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/attendance/my`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAttendance(data);
        }
      } catch (err) {
        console.error('Error fetching attendance logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [API_BASE]);

  // Calculations
  const totalDays = attendance.length;
  const activeHours = attendance.reduce((acc, curr) => {
    if (curr.checkIn && curr.checkOut) {
      const diffMs = new Date(curr.checkOut) - new Date(curr.checkIn);
      return acc + diffMs / (1000 * 60 * 60); // Hours
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Attendance Logs</h1>
        <p className="text-slate-400 text-sm">Review your daily study times, check-ins, and accumulated hours.</p>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-brand-950/80 border border-brand-900 text-brand-400 rounded-xl">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono">Total Days Attended</span>
            <span className="text-2xl font-extrabold text-white">{totalDays} Days</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-brand-950/80 border border-brand-900 text-brand-400 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono">Accumulated Study Time</span>
            <span className="text-2xl font-extrabold text-white">{activeHours.toFixed(1)} Hours</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-900 pb-3">
          <Clock className="h-5 w-5 text-brand-400" />
          <span>Attendance Timeline</span>
        </h3>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading timeline...</div>
        ) : attendance.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No attendance records found. Activate a seat and check in to start tracking.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-900">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4">Check-Out Time</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {attendance.map((record) => {
                  let durationStr = 'Active';
                  if (record.checkIn && record.checkOut) {
                    const diffMs = new Date(record.checkOut) - new Date(record.checkIn);
                    const diffMin = Math.round(diffMs / (1000 * 60));
                    const hrs = Math.floor(diffMin / 60);
                    const mins = diffMin % 60;
                    durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
                  }

                  return (
                    <tr key={record._id} className="hover:bg-slate-900/15">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {formatDisplayDate(record.date)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                        {formatDisplayTime(record.checkIn)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                        {formatDisplayTime(record.checkOut)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        <span className={durationStr === 'Active' ? 'text-brand-400 font-bold animate-pulse' : 'text-slate-200'}>
                          {durationStr}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 font-mono">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Auto Log</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
