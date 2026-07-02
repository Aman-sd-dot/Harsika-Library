const Payment = require('../models/paymentModel');
const User = require('../models/userModel');
const Plan = require('../models/planModel');
const Seat = require('../models/seatModel');
const Notification = require('../models/notificationModel');

// @desc    Get all payment records (Admin)
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('student', 'name email phone studentId')
      .populate('plan', 'planName duration price')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current student's payment history
// @route   GET /api/payments/my
// @access  Private
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.user._id })
      .populate('plan', 'planName duration price')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit a new payment request
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res) => {
  const { planId, paymentMode, transactionId, receiptImage } = req.body;

  if (!planId || !paymentMode) {
    return res.status(400).json({ message: 'Plan ID and payment mode are required' });
  }

  try {
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: 'Active membership plan not found' });
    }

    const isOnline = paymentMode === 'online' && !receiptImage;
    const status = isOnline ? 'approved' : 'pending';
    const paidDate = isOnline ? new Date() : null;

    // Calculate next due date if approved
    let nextDueDate = null;
    if (isOnline) {
      nextDueDate = new Date();
      nextDueDate.setMonth(nextDueDate.getMonth() + plan.duration);
    }

    const payment = await Payment.create({
      student: req.user._id,
      amount: plan.price,
      paymentMode,
      transactionId: transactionId || `TXN${Date.now()}`,
      status,
      plan: planId,
      paidDate,
      nextDueDate,
      receiptImage: receiptImage || null,
    });

    // If online, we also extend the student's seat assignment expiry if they have one!
    if (isOnline && req.user.assignedSeat) {
      const seat = await Seat.findById(req.user.assignedSeat);
      if (seat) {
        // If seat expiry is in the future, extend it; otherwise, set from now
        const baseDate = seat.expiryDate && seat.expiryDate > new Date() ? seat.expiryDate : new Date();
        const newExpiry = new Date(baseDate);
        newExpiry.setMonth(newExpiry.getMonth() + plan.duration);
        seat.expiryDate = newExpiry;
        await seat.save();
      }
    }

    // Notification
    if (isOnline) {
      await Notification.create({
        recipient: req.user._id,
        title: 'Payment Successful',
        message: `Your payment of INR ${plan.price} for plan "${plan.planName}" was successfully processed.`,
        type: 'system',
      });
    } else {
      await Notification.create({
        title: 'Offline Payment Request',
        message: `${req.user.name} submitted an offline payment of INR ${plan.price} (Mode: ${paymentMode}). Approvals required.`,
        type: 'system',
      });
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve offline payment (Admin)
// @route   POST /api/payments/:id/approve
// @access  Private/Admin
const approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('plan');

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Payment has already been processed' });
    }

    const paidDate = new Date();
    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + payment.plan.duration);

    payment.status = 'approved';
    payment.paidDate = paidDate;
    payment.nextDueDate = nextDueDate;
    await payment.save();

    // Find student to update seat expiry
    const student = await User.findById(payment.student);
    if (student && student.assignedSeat) {
      const seat = await Seat.findById(student.assignedSeat);
      if (seat) {
        const baseDate = seat.expiryDate && seat.expiryDate > new Date() ? seat.expiryDate : new Date();
        const newExpiry = new Date(baseDate);
        newExpiry.setMonth(newExpiry.getMonth() + payment.plan.duration);
        seat.expiryDate = newExpiry;
        await seat.save();
      }
    }

    // Notify Student
    await Notification.create({
      recipient: payment.student,
      title: 'Payment Approved',
      message: `Your offline payment of INR ${payment.amount} has been approved by the Admin. Next due: ${nextDueDate.toLocaleDateString()}.`,
      type: 'system',
    });

    res.json({ message: 'Payment approved successfully', payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject offline payment (Admin)
// @route   POST /api/payments/:id/reject
// @access  Private/Admin
const rejectPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Payment has already been processed' });
    }

    payment.status = 'rejected';
    await payment.save();

    // Notify Student
    await Notification.create({
      recipient: payment.student,
      title: 'Payment Rejected',
      message: `Your offline payment submission of INR ${payment.amount} was rejected. Please contact the front desk.`,
      type: 'system',
    });

    res.json({ message: 'Payment rejected', payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPayments,
  getMyPayments,
  createPayment,
  approvePayment,
  rejectPayment,
};
