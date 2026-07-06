import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  CheckCircle,
  Clock,
  ShieldAlert,
  UserCheck,
  UserX,
  Trash2,
  Armchair,
  X,
  AlertTriangle,
  PlusCircle,
} from 'lucide-react';

const AdminStudents = () => {
  const { API_BASE } = useAuth();
  const [students, setStudents] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null); // student object
  const [selectedSeatId, setSelectedSeatId] = useState('');
  const [selectedShift, setSelectedShift] = useState('fullTime'); // 'morning', 'evening', 'fullTime'
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Add student modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    planId: '',
    seatId: '',
    shift: 'fullTime',
  });

  const fetchPlansAndAvailableSeats = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch plans
      const plansRes = await fetch(`${API_BASE}/plans`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
      }
      // Fetch seats
      const seatsRes = await fetch(`${API_BASE}/seats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (seatsRes.ok) {
        const seatsData = await seatsRes.json();
        const openSeats = seatsData.filter((s) => {
          if (s.status === 'maintenance') return false;
          const hasFullTime = !!s.fullTime?.student;
          const hasMorning = !!s.morning?.student;
          const hasEvening = !!s.evening?.student;
          return !hasFullTime && (!hasMorning || !hasEvening);
        });
        setSeats(openSeats);
      }
    } catch (err) {
      console.error('Error fetching onboarding data:', err);
    }
  };

  const openAddModal = () => {
    setNewStudent({ name: '', email: '', phone: '', password: '', planId: '', seatId: '' });
    fetchPlansAndAvailableSeats();
    setAddModalOpen(true);
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setActionLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newStudent),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create student');

      setSuccess(`Student "${newStudent.name}" registered successfully with ID ${data.studentId}.`);
      setAddModalOpen(false);
      setNewStudent({ name: '', email: '', phone: '', password: '', planId: '', seatId: '' });
      fetchStudents();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/students`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSeats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/seats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const openSeats = data.filter((s) => {
          if (s.status === 'maintenance') return false;
          const hasFullTime = !!s.fullTime?.student;
          const hasMorning = !!s.morning?.student;
          const hasEvening = !!s.evening?.student;
          return !hasFullTime && (!hasMorning || !hasEvening);
        });
        setSeats(openSeats);
        if (openSeats.length > 0) {
          setSelectedSeatId(openSeats[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching seats:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [API_BASE]);

  // Toggle student status (activate/suspend)
  const handleToggleStatus = async (student) => {
    setSuccess('');
    setError('');
    const newStatus = student.status === 'active' ? 'suspended' : 'active';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/students/${student._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Status toggle failed');

      setSuccess(`Student "${student.name}" account is now ${newStatus}.`);
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete student
  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete student "${studentName}"? This will vacate any assigned seats.`)) return;
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');

      setSuccess(`Student "${studentName}" deleted successfully.`);
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  // Open Seat Assignment modal
  const openAssignModal = (student) => {
    setActiveRequest(student);
    setSelectedShift('fullTime');
    fetchAvailableSeats();
    setAssignModalOpen(true);
  };

  // Confirm Seat Assignment
  const handleAssignSeatSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSeatId || !activeRequest) return;
    setSuccess('');
    setError('');
    setActionLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/seats/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          seatId: selectedSeatId,
          studentId: activeRequest._id,
          planId: activeRequest.seatRequest?.plan?._id,
          shift: selectedShift,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Seat assignment failed');

      setSuccess(`Seat assigned to ${activeRequest.name} successfully.`);
      setAssignModalOpen(false);
      fetchStudents();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Student Management</h1>
          <p className="text-slate-400 text-sm">Review registered students list, account suspensions, and seat requests.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-950 transition-all self-start"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Add New Student</span>
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

      {/* Students Table */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-900 pb-3">
          <Users className="h-5 w-5 text-indigo-400" />
          <span>Registered Student Roster</span>
        </h3>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading student profiles...</div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No students registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-900">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email / Phone</th>
                  <th className="py-3 px-4">Seat Assigned</th>
                  <th className="py-3 px-4">Seat Request</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {students.map((student) => {
                  const hasRequest = student.seatRequest && student.seatRequest.status === 'pending';
                  const requestedPlan = student.seatRequest?.plan?.planName || 'N/A';
                  return (
                    <tr key={student._id} className="hover:bg-slate-900/15">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs">{student.studentId}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{student.name}</td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="text-slate-300">{student.email}</div>
                        <div className="text-slate-500 font-mono mt-0.5">{student.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {student.assignedSeat ? (
                          <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-900/40">
                            <Armchair className="h-3.5 w-3.5" />
                            <span>Seat {student.assignedSeat.seatNumber}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {hasRequest ? (
                          <div className="space-y-1">
                            <span className="inline-block text-[10px] font-bold bg-amber-950 border border-amber-900 text-amber-400 px-2 py-0.5 rounded-full">
                              Pending: {requestedPlan}
                            </span>
                            <div className="text-[10px] text-slate-500">
                              Pref: {student.seatRequest.preferredFloor} ({student.seatRequest.preferredRoom})
                            </div>
                          </div>
                        ) : student.seatRequest?.status === 'approved' ? (
                          <span className="text-xs text-slate-400">Approved</span>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            student.status === 'active'
                              ? 'bg-emerald-950 border border-emerald-900 text-emerald-400'
                              : 'bg-red-950/30 border border-red-900/60 text-red-400'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center space-x-2.5">
                          {hasRequest && (
                            <button
                              onClick={() => openAssignModal(student)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all"
                            >
                              Assign Seat
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleToggleStatus(student)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              student.status === 'active'
                                ? 'bg-slate-900 hover:bg-amber-950/40 text-amber-500 border-slate-800 hover:border-amber-900'
                                : 'bg-slate-900 hover:bg-emerald-950/40 text-emerald-500 border-slate-800 hover:border-emerald-900'
                            }`}
                            title={student.status === 'active' ? 'Suspend student' : 'Activate student'}
                          >
                            {student.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>

                          <button
                            onClick={() => handleDeleteStudent(student._id, student.name)}
                            className="p-1.5 bg-slate-900 hover:bg-red-950/40 text-red-500 border border-slate-800 hover:border-red-900 rounded-lg transition-all"
                            title="Delete student"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Seat Assignment Modal */}
      {assignModalOpen && activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl">
            <button
              onClick={() => setAssignModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
              <Armchair className="h-5 w-5 text-indigo-400" />
              <span>Assign Library Seat</span>
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Assign seat for student **{activeRequest.name}** ({activeRequest.studentId}).
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-xs space-y-2 mb-4 font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Requested Plan:</span>
                <span className="text-white font-bold">{activeRequest.seatRequest?.plan?.planName}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="text-white">{activeRequest.seatRequest?.plan?.duration} Month(s)</span>
              </div>
              <div className="flex justify-between">
                <span>Preferred Floor:</span>
                <span className="text-white font-bold">{activeRequest.seatRequest?.preferredFloor}</span>
              </div>
              <div className="flex justify-between">
                <span>Preferred Room:</span>
                <span className="text-white font-bold">{activeRequest.seatRequest?.preferredRoom}</span>
              </div>
            </div>

            <form onSubmit={handleAssignSeatSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Select Desk</label>
                  {seats.length === 0 ? (
                    <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 rounded-xl text-xs">
                      No vacant desks available.
                    </div>
                  ) : (
                    <select
                      value={selectedSeatId}
                      onChange={(e) => {
                        setSelectedSeatId(e.target.value);
                        // Reset shift selection
                        setSelectedShift('fullTime');
                      }}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none cursor-pointer"
                    >
                      {seats.map((s) => (
                        <option key={s._id} value={s._id}>
                          Desk {s.seatNumber} — {s.floor} ({s.room})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Shift Slot</label>
                  <select
                    value={selectedShift}
                    disabled={!selectedSeatId}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none cursor-pointer disabled:opacity-35"
                  >
                    {(() => {
                      const selectedSeatObj = seats.find((s) => s._id === selectedSeatId);
                      const mOcc = !!selectedSeatObj?.morning?.student;
                      const eOcc = !!selectedSeatObj?.evening?.student;
                      return (
                        <>
                          <option value="fullTime" disabled={mOcc || eOcc}>
                            Full Day {mOcc || eOcc ? '(Slots taken)' : ''}
                          </option>
                          <option value="morning" disabled={mOcc}>
                            Morning {mOcc ? '(Taken)' : ''}
                          </option>
                          <option value="evening" disabled={eOcc}>
                            Evening {eOcc ? '(Taken)' : ''}
                          </option>
                        </>
                      );
                    })()}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading || seats.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-4"
              >
                {actionLoading ? 'Assigning...' : 'Assign Seat Now'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Register Student Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <span>Register New Student</span>
            </h3>
            <p className="text-slate-400 text-xs mb-6">Create a student account and optionally assign a plan & seat immediately.</p>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-600"
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-600"
                    placeholder="e.g. ramesh@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-600"
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Login Password</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-600"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="border-t border-slate-900 pt-4 mt-2 space-y-4">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Seat Assignment (Optional)</span>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-455 mb-1.5">Plan Package</label>
                    <select
                      value={newStudent.planId}
                      onChange={(e) => setNewStudent({ ...newStudent, planId: e.target.value, seatId: e.target.value ? newStudent.seatId : '' })}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-2.5 py-2.5 text-[11px] focus:border-indigo-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">No Plan (None)</option>
                      {plans.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.planName} (₹{p.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-455 mb-1.5">Desk Number</label>
                    <select
                      value={newStudent.seatId}
                      disabled={!newStudent.planId}
                      onChange={(e) => setNewStudent({ ...newStudent, seatId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-2.5 py-2.5 text-[11px] focus:border-indigo-500 focus:outline-none cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                    >
                      <option value="">No Seat (None)</option>
                      {seats.map((s) => (
                        <option key={s._id} value={s._id}>
                          Desk {s.seatNumber} ({s.room})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-455 mb-1.5">Shift Block</label>
                    <select
                      value={newStudent.shift}
                      disabled={!newStudent.seatId}
                      onChange={(e) => setNewStudent({ ...newStudent, shift: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-2.5 py-2.5 text-[11px] focus:border-indigo-500 focus:outline-none cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                    >
                      {(() => {
                        const selectedSeatObj = seats.find((s) => s._id === newStudent.seatId);
                        const mOcc = !!selectedSeatObj?.morning?.student;
                        const eOcc = !!selectedSeatObj?.evening?.student;
                        return (
                          <>
                            <option value="fullTime" disabled={mOcc || eOcc}>
                              Full Day {mOcc || eOcc ? '(Taken)' : ''}
                            </option>
                            <option value="morning" disabled={mOcc}>
                              Morning {mOcc ? '(Taken)' : ''}
                            </option>
                            <option value="evening" disabled={eOcc}>
                              Evening {eOcc ? '(Taken)' : ''}
                            </option>
                          </>
                        );
                      })()}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-4"
              >
                {actionLoading ? 'Registering...' : 'Register & Setup Onboarding'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
