import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CalendarCheck, Search, ShieldCheck } from 'lucide-react';

const AdminAttendance = () => {
  const { API_BASE } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

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
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/attendance/all`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error('Error fetching attendance logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [API_BASE]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const name = log.student?.name || '';
    const sid = log.student?.studentId || '';
    const date = log.date || '';

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sid.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = dateFilter ? date === dateFilter : true;

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Attendance Registry</h1>
        <p className="text-slate-400 text-sm">Monitor student check-in/out timestamps and log statistics.</p>
      </div>

      {/* Filter panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-650"
            placeholder="Search by student name or ID..."
          />
        </div>

        <div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-900 pb-3">
          <CalendarCheck className="h-5 w-5 text-indigo-400" />
          <span>Attendance Roster Entries</span>
        </h3>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading roster...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No matching attendance logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-350">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-900">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4">Check-Out Time</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {filteredLogs.map((log) => {
                  let durationStr = 'Active';
                  if (log.checkIn && log.checkOut) {
                    const diffMs = new Date(log.checkOut) - new Date(log.checkIn);
                    const diffMin = Math.round(diffMs / (1000 * 60));
                    const hrs = Math.floor(diffMin / 60);
                    const mins = diffMin % 60;
                    durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
                  }

                  const studentName = log.student?.name || 'Deleted User';
                  const studentId = log.student?.studentId || 'N/A';

                  return (
                    <tr key={log._id} className="hover:bg-slate-900/15">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{studentName}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{studentId}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-300">
                        {formatDisplayDate(log.date)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {formatDisplayTime(log.checkIn)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {formatDisplayTime(log.checkOut)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={durationStr === 'Active' ? 'text-indigo-400 font-bold animate-pulse' : 'text-slate-350'}>
                          {durationStr}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center space-x-1 text-[10px] text-indigo-400 font-mono">
                          <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                          <span>Student Portal</span>
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

export default AdminAttendance;
