import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CreditCard,
  CheckCircle,
  Clock,
  Printer,
  X,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

const StudentPayments = () => {
  const { user, refreshUser, API_BASE } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMode, setPaymentMode] = useState('online');
  const [transactionId, setTransactionId] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fetch payments
  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/payments/my`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // Check if user has a pending seat request to offer checkout
    if (user?.seatRequest && user.seatRequest.status === 'pending' && user.seatRequest.plan) {
      setSelectedPlan(user.seatRequest.plan);
    }
  }, [user, API_BASE]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setError('');
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        setError('Screenshot image must be smaller than 1.5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText('8102621290@ybl');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Payment Submit
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPaying(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: selectedPlan._id,
          paymentMode,
          transactionId: paymentMode === 'online' ? (transactionId || `UPI-TXN-${Date.now()}`) : transactionId,
          receiptImage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Payment submission failed');
      }

      setSuccess(
        paymentMode === 'online' && !receiptImage
          ? 'Payment processed successfully! Your seat assignment is active.'
          : 'Payment receipt submitted successfully! Please wait for Admin verification.'
      );
      setCheckoutModalOpen(false);
      setTransactionId('');
      setReceiptImage(null);
      
      // Update data
      await refreshUser();
      await fetchPayments();
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  const handleOpenCheckout = () => {
    setPaymentMode('online');
    setTransactionId('');
    setReceiptImage(null);
    setCheckoutModalOpen(true);
  };

  const openReceipt = (payment) => {
    setActiveReceipt(payment);
    setReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Fees & Payments</h1>
        <p className="text-slate-400 text-sm">Pay membership dues online or review past billing history receipts.</p>
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

      {/* Due Bills Card */}
      {selectedPlan && user?.seatRequest?.status === 'pending' && (
        <div className="glass-panel p-6 rounded-3xl border border-brand-500/20 bg-slate-900/30 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex px-2 py-0.5 rounded-full bg-brand-950/80 border border-brand-800 text-brand-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              Outstanding Dues
            </div>
            <h3 className="text-lg font-bold text-white">Pending Membership Fee: {selectedPlan.planName}</h3>
            <p className="text-slate-400 text-xs">
              Preferred Room: {user.seatRequest.preferredRoom} • Floor: {user.seatRequest.preferredFloor}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-left md:text-right">
              <span className="block text-[10px] text-slate-500 uppercase">Amount Due</span>
              <span className="text-2xl font-extrabold text-white">₹{selectedPlan.price}</span>
            </div>
            <button
              onClick={handleOpenCheckout}
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-brand-900/10 transition-all hover:scale-[1.01]"
            >
              Pay Now
            </button>
          </div>
        </div>
      )}

      {/* History Grid */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-900 pb-3">
          <CreditCard className="h-5 w-5 text-brand-400" />
          <span>Billing History</span>
        </h3>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading history...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No payment records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-900">
                <tr>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Paid Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-900/15">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {payment.plan ? payment.plan.planName : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">{payment.transactionId}</td>
                    <td className="py-3.5 px-4 capitalize">{payment.paymentMode.replace('_', ' ')}</td>
                    <td className="py-3.5 px-4 text-xs font-mono">
                      {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">₹{payment.amount}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                    <td className="py-3.5 px-4 text-center">
                      {payment.status === 'approved' && (
                        <button
                          onClick={() => openReceipt(payment)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-brand-400 border border-slate-800 rounded-lg hover:text-brand-300 transition-colors"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {checkoutModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl">
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-brand-400" />
              <span>Checkout Portal</span>
            </h3>
            <p className="text-slate-400 text-xs mb-6">Complete payment for plan "{selectedPlan.planName}".</p>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('online')}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                      paymentMode === 'online'
                        ? 'border-brand-500 bg-brand-950/20 text-brand-400'
                        : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'
                    }`}
                  >
                    Online UPI (Instant)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('cash')}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                      paymentMode === 'cash'
                        ? 'border-brand-500 bg-brand-950/20 text-brand-400'
                        : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'
                    }`}
                  >
                    Offline Deposit
                  </button>
                </div>
              </div>

              {paymentMode === 'online' ? (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4 text-center">
                  <div className="relative">
                    <img 
                      src="/upi_qr.jpg" 
                      alt="PhonePe UPI QR Code" 
                      className="mx-auto w-40 rounded-xl shadow-lg border border-slate-800" 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-850 text-xs">
                      <span className="text-slate-450 font-mono">UPI ID:</span>
                      <span className="text-white font-bold font-mono">8102621290@ybl</span>
                      <button 
                        type="button" 
                        onClick={copyUpiId} 
                        className="text-brand-400 hover:text-brand-300 font-bold ml-1.5 focus:outline-none"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    <a
                      href={`upi://pay?pa=8102621290@ybl&pn=AmanRanjan&am=${selectedPlan.price}&tn=${user?.studentId}-${selectedPlan.planName.replace(/\s+/g, '')}&cu=INR`}
                      className="block w-full text-center text-xs py-2 bg-brand-950/60 text-brand-400 border border-brand-900/60 rounded-xl hover:bg-brand-900/30 transition-all font-bold"
                    >
                      📱 Pay via UPI Apps (Mobile App Link)
                    </a>
                  </div>

                  <div className="space-y-3.5 text-left mt-4 border-t border-slate-900 pt-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        UPI Transaction ID / UTR (Optional for Mock Bypass)
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:border-brand-500 focus:outline-none placeholder-slate-600"
                        placeholder="Enter the 12-digit transaction ID"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Upload Payment Receipt Screenshot (Optional for Mock Bypass)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-4 py-2 text-xs focus:border-brand-500 focus:outline-none cursor-pointer file:bg-slate-800 file:border-0 file:text-slate-200 file:rounded-lg file:px-2.5 file:py-1 file:mr-2 file:text-xs"
                      />
                    </div>
                    <p className="text-[10px] text-brand-400/90 leading-relaxed mt-2 bg-brand-950/40 p-2.5 rounded-lg border border-brand-900/40">
                      💡 <strong>Testing Mode:</strong> To test admin screenshot verification, upload an image and enter a transaction ID. To bypass and simulate instant success, leave them blank and click Submit.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Transaction reference ID</label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none placeholder-slate-600"
                      placeholder="e.g. CASH-876352 or Depositor Name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Upload Deposit Receipt / Screenshot (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-4 py-2 text-xs focus:border-brand-500 focus:outline-none cursor-pointer file:bg-slate-900 file:border-0 file:text-slate-200 file:rounded-lg file:px-2.5 file:py-1 file:mr-2 file:text-xs"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    * Make cash deposit at reception or transfer funds. Paste references above. Admin will review and activate seat.
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-bold border-t border-slate-800 pt-4 mt-6">
                <span className="text-slate-400">Total Price:</span>
                <span className="text-white text-lg">₹{selectedPlan.price}</span>
              </div>

              <button
                type="submit"
                disabled={paying}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-4"
              >
                {paying ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                ) : (
                  <span>Submit Payment</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptModalOpen && activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl">
            <button
              onClick={() => setReceiptModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Receipt template */}
            <div id="receipt-print" className="space-y-6 pt-4 text-center font-mono">
              <div className="border-b border-dashed border-slate-800 pb-4">
                <h3 className="text-brand-400 font-bold text-xl uppercase tracking-widest">Harsika Library</h3>
                <p className="text-[10px] text-slate-500 mt-1">Royal Arcade, Sector-15, Bengaluru</p>
              </div>

              <div className="space-y-2.5 text-xs text-left text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="text-white font-bold">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Student ID:</span>
                  <span className="text-white">{user?.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan Purchased:</span>
                  <span className="text-white">{activeReceipt.plan?.planName || 'Membership'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="text-white truncate max-w-[150px]">{activeReceipt.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode:</span>
                  <span className="text-white capitalize">{activeReceipt.paymentMode}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-800 pt-2.5 mt-2.5">
                  <span className="text-slate-500">Date Paid:</span>
                  <span className="text-white">
                    {activeReceipt.paidDate ? new Date(activeReceipt.paidDate).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Due Expiry:</span>
                  <span className="text-brand-400 font-bold">
                    {activeReceipt.nextDueDate ? new Date(activeReceipt.nextDueDate).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-slate-800 py-3 flex justify-between items-center text-sm font-bold font-mono">
                <span className="text-slate-500">AMOUNT PAID:</span>
                <span className="text-brand-400 text-lg">INR {activeReceipt.amount}</span>
              </div>

              <div className="flex items-center justify-center space-x-1.5 text-[9px] text-slate-500 bg-slate-950/65 py-2 rounded-xl border border-slate-850">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Digitally Verified Receipt</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 mt-6 transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPayments;
