import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  X,
  AlertTriangle,
  Eye,
} from 'lucide-react';

const AdminPayments = () => {
  const { API_BASE } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screenshotModalOpen, setScreenshotModalOpen] = useState(false);
  const [activeScreenshot, setActiveScreenshot] = useState(null);
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' or 'dues'
  const [duesData, setDuesData] = useState({
    totalOutstandingDues: 0,
    defaultersCount: 0,
    expiringSoonCount: 0,
    defaultersList: [],
    expiringSoonList: [],
  });
  const [duesLoading, setDuesLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/payments`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error('Error fetching payments ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDues = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/dues`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDuesData(data);
      }
    } catch (err) {
      console.error('Error fetching dues report:', err);
    } finally {
      setDuesLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchDues();
  }, [API_BASE]);

  const handleVacateSeat = async (seatId, studentName) => {
    if (!window.confirm(`Are you sure you want to vacate the seat for student "${studentName}"?`)) return;
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

      setSuccess(`Seat vacated successfully for ${studentName}.`);
      fetchDues();
      fetchPayments();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReminder = async (studentId, studentName, seatNumber) => {
    setSuccess('');
    setError('');
    setActionLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient: studentId,
          title: 'Membership Overdue Notice',
          message: `Dear ${studentName}, your membership for Seat ${seatNumber} has expired. Please pay your pending dues in the Fees & Payments section to secure your seat.`,
          type: 'notice',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Alert failed');

      setSuccess(`Overdue notice successfully sent to ${studentName}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Payment Approval
  const handleApprove = async (paymentId, studentName) => {
    if (!window.confirm(`Approve offline payment submission from "${studentName}"?`)) return;
    setSuccess('');
    setError('');
    setActionLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/payments/${paymentId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Approval failed');

      setSuccess(`Payment from ${studentName} approved successfully.`);
      fetchPayments();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Payment Rejection
  const handleReject = async (paymentId, studentName) => {
    if (!window.confirm(`Reject offline payment submission from "${studentName}"?`)) return;
    setSuccess('');
    setError('');
    setActionLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/payments/${paymentId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Rejection failed');

      setSuccess(`Payment from ${studentName} rejected.`);
      fetchPayments();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Payments Board</h1>
        <p className="text-slate-400 text-sm">Verify bank transfers, approve cash receipts, and audit historical invoices.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-900 gap-6 text-sm font-bold pt-2">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 transition-all focus:outline-none ${
            activeTab === 'transactions'
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Transaction Audits
        </button>
        <button
          onClick={() => setActiveTab('dues')}
          className={`pb-3 transition-all focus:outline-none ${
            activeTab === 'dues'
              ? 'text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Dues & Expirations ({duesData.defaultersCount})
        </button>
      </div>

      {success && (
        <div className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 p-4 rounded-xl text-sm animate-fade-in">
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

      {activeTab === 'transactions' ? (
        /* Ledger Table */
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-900 pb-3">
            <CreditCard className="h-5 w-5 text-indigo-400" />
            <span>Transaction Audit Logs</span>
          </h3>

          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading billing history...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No transaction events recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase text-slate-500 border-b border-slate-900">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Plan Name</th>
                    <th className="py-3 px-4">Ref ID</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Paid Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Verify</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {payments.map((payment) => {
                    const studentName = payment.student?.name || 'Deleted User';
                    const studentId = payment.student?.studentId || 'N/A';
                    const planName = payment.plan?.planName || 'N/A';
                    const isPending = payment.status === 'pending';

                    return (
                      <tr key={payment._id} className="hover:bg-slate-900/15">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{studentName}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{studentId}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-350">{planName}</td>
                        <td className="py-3.5 px-4 font-mono text-xs">{payment.transactionId}</td>
                        <td className="py-3.5 px-4 capitalize">{payment.paymentMode.replace('_', ' ')}</td>
                        <td className="py-3.5 px-4 text-xs font-mono">
                          {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-white">₹{payment.amount}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              payment.status === 'approved'
                                ? 'bg-emerald-950 border border-emerald-900 text-emerald-400'
                                : payment.status === 'pending'
                                ? 'bg-amber-950 border border-amber-900 text-amber-400'
                                : 'bg-red-950/40 border border-red-900/60 text-red-400'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            {payment.receiptImage && (
                              <button
                                onClick={() => {
                                  setActiveScreenshot(payment.receiptImage);
                                  setScreenshotModalOpen(true);
                                }}
                                className="p-1.5 bg-indigo-950/60 hover:bg-indigo-900 text-indigo-400 border border-indigo-900/40 rounded-lg transition-all"
                                title="View Receipt Screenshot"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => handleApprove(payment._id, studentName)}
                                  disabled={actionLoading}
                                  className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-900/40 rounded-lg transition-all"
                                  title="Approve Payment"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(payment._id, studentName)}
                                  disabled={actionLoading}
                                  className="p-1.5 bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-900/40 rounded-lg transition-all"
                                  title="Reject Payment"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-slate-500 font-mono">Verified</span>
                            )}
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
      ) : (
        /* Dues & Defaulters Panel */
        <div className="space-y-6 animate-fade-in">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-900">
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono">Pending Collection Dues</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">₹{duesData.totalOutstandingDues}</span>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-red-900/25 bg-red-950/10">
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono">Active Defaulters</span>
              <span className="text-2xl font-extrabold text-red-400 mt-1 block">{duesData.defaultersCount} Students</span>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-amber-900/25 bg-amber-950/10">
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono">Expiring Within 3 Days</span>
              <span className="text-2xl font-extrabold text-amber-400 mt-1 block">{duesData.expiringSoonCount} Seats</span>
            </div>
          </div>

          {/* Defaulters Table */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-900 pb-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span>Overdue Accounts Registry</span>
            </h3>

            {duesLoading ? (
              <div className="text-center py-8 text-slate-500">Loading dues registry...</div>
            ) : duesData.defaultersList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No active overdue student accounts found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-350">
                  <thead className="text-xs uppercase text-slate-500 border-b border-slate-900">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Seat Details</th>
                      <th className="py-3 px-4">Expiry Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {duesData.defaultersList.map((seat) => {
                      const student = seat.assignedTo || {};
                      const expiry = new Date(seat.expiryDate);
                      const diffMs = new Date() - expiry;
                      const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

                      return (
                        <tr key={seat._id} className="hover:bg-slate-900/15">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{student.name || 'N/A'}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{student.studentId || 'N/A'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-200">Seat {seat.seatNumber}</div>
                            <div className="text-xs text-slate-500">{seat.floor} • {seat.room}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-350">
                            {expiry.toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950 border border-red-900 text-red-400 animate-pulse">
                              Overdue {diffDays} Day{diffDays > 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleSendReminder(student._id, student.name, seat.seatNumber)}
                                disabled={actionLoading}
                                className="px-2.5 py-1 text-xs bg-indigo-950/60 hover:bg-indigo-900 text-indigo-400 border border-indigo-900/40 rounded-lg transition-all font-bold"
                                title="Send Reminder Alert"
                              >
                                Alert
                              </button>
                              <button
                                onClick={() => handleVacateSeat(seat._id, student.name)}
                                disabled={actionLoading}
                                className="px-2.5 py-1 text-xs bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-900/40 rounded-lg transition-all font-bold"
                                title="Evict Student from Seat"
                              >
                                Vacate
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
        </div>
      )}

      {/* Screenshot Viewer Modal */}
      {screenshotModalOpen && activeScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl">
            <button
              onClick={() => setScreenshotModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Receipt Verification</h3>
            <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-1 flex items-center justify-center">
              <img
                src={activeScreenshot}
                alt="Payment Receipt Screenshot"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
