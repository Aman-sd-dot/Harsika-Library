import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Armchair,
  CheckCircle,
  XCircle,
  AlertTriangle,
  PlusCircle,
  X,
  Trash2,
  Calendar,
} from 'lucide-react';

const AdminSeats = () => {
  const { API_BASE } = useAuth();
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFloor, setActiveFloor] = useState('Floor 1');
  
  // Create Seat Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSeat, setNewSeat] = useState({ seatNumber: '', floor: 'Floor 1', room: 'Room A', shift: 'full_day' });
  const [shiftFilter, setShiftFilter] = useState('all'); // 'all', 'morning', 'evening', 'full_day'
  
  // Seat Details / Edit Modal
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSeats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/seats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSeats(data);
      }
    } catch (err) {
      console.error('Error fetching seats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [API_BASE]);

  // Handle Add Seat
  const handleCreateSeat = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setActionLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/seats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newSeat),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Create seat failed');

      setSuccess(`Seat ${newSeat.seatNumber} created successfully.`);
      setCreateModalOpen(false);
      setNewSeat({ seatNumber: '', floor: activeFloor, room: 'Room A', shift: 'full_day' });
      fetchSeats();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Vacate Seat
  const handleVacateSeat = async (seatId) => {
    if (!window.confirm('Are you sure you want to vacate this seat assignment?')) return;
    setSuccess('');
    setError('');
    setActionLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/seats/vacate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ seatId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Vacate failed');

      setSuccess('Seat vacated successfully.');
      setDetailModalOpen(false);
      fetchSeats();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Edit Seat Status
  const handleUpdateStatus = async (seatId, newStatus) => {
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/seats/${seatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      setSuccess(`Seat status updated to ${newStatus}.`);
      setDetailModalOpen(false);
      fetchSeats();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete Seat
  const handleDeleteSeat = async (seatId, number) => {
    if (!window.confirm(`Are you sure you want to delete seat ${number}?`)) return;
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/seats/${seatId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');

      setSuccess(`Seat ${number} removed successfully.`);
      setDetailModalOpen(false);
      fetchSeats();
    } catch (err) {
      setError(err.message);
    }
  };

  const openDetailModal = (seat) => {
    setSelectedSeat(seat);
    setDetailModalOpen(true);
  };

  // Filter seats by floor and shift
  const filteredSeats = seats.filter((s) => {
    const matchesFloor = s.floor === activeFloor;
    const matchesShift = shiftFilter === 'all' ? true : s.shift === shiftFilter;
    return matchesFloor && matchesShift;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Library Layout & Seats</h1>
          <p className="text-slate-400 text-sm">Create desks, audit occupancy state, and manually vacate student seat assignments.</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-950 transition-all self-start"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Add New Seat</span>
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

      {/* Tabs and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-900 pb-3 gap-4">
        {/* Floor Tabs */}
        <div className="flex space-x-4">
          {['Floor 1', 'Floor 2'].map((floor) => (
            <button
              key={floor}
              onClick={() => setActiveFloor(floor)}
              className={`pb-1 font-bold text-sm transition-all border-b-2 px-1 ${
                activeFloor === floor
                  ? 'border-indigo-500 text-white font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {floor}
            </button>
          ))}
        </div>

        {/* Shift Filter Dropdown */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] font-mono">Filter Shift:</span>
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer text-xs font-semibold"
          >
            <option value="all">All Shifts</option>
            <option value="full_day">Full Day</option>
            <option value="morning">Morning (6 AM - 2 PM)</option>
            <option value="evening">Evening (2 PM - 10 PM)</option>
          </select>
        </div>
      </div>

      {/* Legend Row */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 bg-slate-900/20 p-3.5 rounded-2xl border border-slate-900/60 font-mono">
        <span className="font-bold uppercase text-slate-500 mr-2">Seat Status Legend:</span>
        <div className="flex items-center space-x-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
          <span>Paid & Active</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span>Expiring Soon (≤3 Days)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 font-bold">Overdue / Expired</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
          <span>Maintenance</span>
        </div>
      </div>      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-20 bg-slate-900/35 border border-slate-850 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredSeats.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">No matching seats registered on {activeFloor} for this shift.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredSeats.map((seat) => {
            const isOccupied = seat.status === 'occupied';
            const isMaint = seat.status === 'maintenance';
            
            // Dues-aware color styling classes
            let seatColorClass = 'bg-emerald-950/10 border-emerald-900/40 hover:bg-emerald-950/20';
            let dotColorClass = 'bg-emerald-500';

            if (isMaint) {
              seatColorClass = 'bg-slate-900/40 border-slate-850 hover:bg-slate-850/65 text-slate-455';
              dotColorClass = 'bg-slate-500';
            } else if (isOccupied) {
              const today = new Date();
              const expiry = seat.expiryDate ? new Date(seat.expiryDate) : null;
              
              if (expiry && today > expiry) {
                seatColorClass = 'bg-red-950/35 border-red-800/60 hover:bg-red-950/50 text-red-250';
                dotColorClass = 'bg-red-500 animate-pulse';
              } else if (expiry) {
                const diffTime = expiry - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 3) {
                  seatColorClass = 'bg-amber-950/30 border-amber-800/50 hover:bg-amber-950/50 text-amber-250';
                  dotColorClass = 'bg-amber-500';
                } else {
                  seatColorClass = 'bg-indigo-950/25 border-indigo-905/45 hover:bg-indigo-950/45 text-indigo-250';
                  dotColorClass = 'bg-indigo-500';
                }
              } else {
                seatColorClass = 'bg-indigo-950/25 border-indigo-905/45 hover:bg-indigo-950/45 text-indigo-250';
                dotColorClass = 'bg-indigo-500';
              }
            }
            
            return (
              <button
                key={seat._id}
                onClick={() => openDetailModal(seat)}
                className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] flex flex-col justify-between h-24 ${seatColorClass}`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-xs font-mono text-slate-550">{seat.room}</span>
                  <span className={`h-2 w-2 rounded-full ${dotColorClass}`} />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-white">Desk {seat.seatNumber.split('-')[1] || seat.seatNumber}</h4>
                  <p className="text-[10px] text-slate-400 capitalize mt-0.5 truncate max-w-full">
                    {seat.shift === 'full_day' ? 'Full Day' : seat.shift + ' shift'} • {isOccupied ? seat.assignedTo?.name || 'Occupied' : seat.status}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Create Seat Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
              <PlusCircle className="h-5 w-5 text-indigo-400" />
              <span>Create Desk Unit</span>
            </h3>
            <p className="text-slate-400 text-xs mb-6">Register a new study seat in the physical layout database.</p>

            <form onSubmit={handleCreateSeat} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Seat Label / Number</label>
                <input
                  type="text"
                  required
                  value={newSeat.seatNumber}
                  onChange={(e) => setNewSeat({ ...newSeat, seatNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-600"
                  placeholder="e.g. A-11 or B-12"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Floor Location</label>
                  <select
                    value={newSeat.floor}
                    onChange={(e) => setNewSeat({ ...newSeat, floor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Floor 1">Floor 1</option>
                    <option value="Floor 2">Floor 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Room Location</label>
                  <select
                    value={newSeat.room}
                    onChange={(e) => setNewSeat({ ...newSeat, room: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Room A">Room A</option>
                    <option value="Room B">Room B</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Shift Allocation</label>
                <select
                  value={newSeat.shift}
                  onChange={(e) => setNewSeat({ ...newSeat, shift: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="full_day">Full Day (6:00 AM - 10:00 PM)</option>
                  <option value="morning">Morning Shift (6:00 AM - 2:00 PM)</option>
                  <option value="evening">Evening Shift (2:00 PM - 10:00 PM)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-4"
              >
                {actionLoading ? 'Creating...' : 'Create Seat'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Seat Details Modal */}
      {detailModalOpen && selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl">
            <button
              onClick={() => setDetailModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1 flex items-center space-x-2">
              <Armchair className="h-5 w-5 text-indigo-400" />
              <span>Desk {selectedSeat.seatNumber}</span>
            </h3>
            <p className="text-slate-450 text-xs mb-6 font-mono">
              {selectedSeat.floor} • {selectedSeat.room} • <span className="capitalize font-bold text-slate-300">{selectedSeat.shift.replace('_', ' ')}</span>
            </p>

            {selectedSeat.status === 'occupied' && selectedSeat.assignedTo ? (
              <div className="space-y-4 mb-6 border-b border-slate-800 pb-6">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student:</span>
                    <span className="text-white font-bold">{selectedSeat.assignedTo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student ID:</span>
                    <span className="text-white font-mono">{selectedSeat.assignedTo.studentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="text-white font-mono">{selectedSeat.assignedTo.phone}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-900 pt-2 mt-2">
                    <span className="text-slate-500">Assigned Date:</span>
                    <span className="text-white">
                      {new Date(selectedSeat.assignedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expiry Date:</span>
                    <span className="text-brand-400 font-bold">
                      {new Date(selectedSeat.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleVacateSeat(selectedSeat._id)}
                  disabled={actionLoading}
                  className="w-full bg-red-950/40 border border-red-900/60 hover:bg-red-950/60 text-red-400 py-3 rounded-xl font-bold transition-all"
                >
                  Vacate Assignment
                </button>
              </div>
            ) : (
              <div className="space-y-4 mb-6 border-b border-slate-800 pb-6">
                <p className="text-slate-400 text-xs leading-normal">
                  This desk is currently unoccupied. You can toggle its status between Available and Maintenance.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedSeat._id, 'available')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      selectedSeat.status === 'available'
                        ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400'
                        : 'border-slate-850 hover:bg-slate-850 text-slate-400'
                    }`}
                  >
                    Set Available
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedSeat._id, 'maintenance')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      selectedSeat.status === 'maintenance'
                        ? 'border-slate-600 bg-slate-800/30 text-slate-350'
                        : 'border-slate-850 hover:bg-slate-850 text-slate-400'
                    }`}
                  >
                    Set Maintenance
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => handleDeleteSeat(selectedSeat._id, selectedSeat.seatNumber)}
              className="w-full bg-slate-950 hover:bg-red-950/10 border border-slate-850 hover:border-red-950 text-slate-450 hover:text-red-400 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Seat Record</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSeats;
