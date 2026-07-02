const User = require('../models/userModel');
const Seat = require('../models/seatModel');
const Payment = require('../models/paymentModel');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalSeats = await Seat.countDocuments({});
    const availableSeats = await Seat.countDocuments({ status: 'available' });
    const occupiedSeats = await Seat.countDocuments({ status: 'occupied' });
    const maintenanceSeats = await Seat.countDocuments({ status: 'maintenance' });

    // Calculate today's collection
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayPayments = await Payment.find({
      status: 'approved',
      paidDate: { $gte: startOfToday, $lte: endOfToday },
    });
    const todayCollection = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    // Calculate monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyPayments = await Payment.find({
      status: 'approved',
      paidDate: { $gte: thirtyDaysAgo },
    });
    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalStudents,
      totalSeats,
      availableSeats,
      occupiedSeats,
      maintenanceSeats,
      todayCollection,
      monthlyRevenue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .populate('assignedSeat')
      .populate('seatRequest.plan')
      .select('-password');
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update student status or profile
// @route   PUT /api/admin/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
  const { name, phone, status } = req.body;

  try {
    const student = await User.findById(req.params.id);

    if (student) {
      student.name = name || student.name;
      student.phone = phone || student.phone;
      student.status = status || student.status;

      const updated = await student.save();
      res.json({
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        status: updated.status,
        role: updated.role,
        studentId: updated.studentId,
      });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete student & vacate their seat
// @route   DELETE /api/admin/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (student) {
      // If student has an assigned seat, vacate it
      if (student.assignedSeat) {
        const seat = await Seat.findById(student.assignedSeat);
        if (seat) {
          seat.status = 'available';
          seat.assignedTo = null;
          seat.assignedDate = null;
          seat.expiryDate = null;
          await seat.save();
        }
      }

      await User.deleteOne({ _id: student._id });
      res.json({ message: 'Student deleted successfully' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Admin Dues & Defaulters Report
// @route   GET /api/admin/dues
// @access  Private/Admin
const getDuesReport = async (req, res) => {
  try {
    const today = new Date();

    // 1. Defaulters: Seats that are occupied and whose expiryDate is in the past
    const defaultersList = await Seat.find({
      status: 'occupied',
      expiryDate: { $lt: today },
    }).populate('assignedTo', 'name email phone studentId');

    // 2. Expiring soon: Seats that are occupied and expire within the next 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const expiringSoonList = await Seat.find({
      status: 'occupied',
      expiryDate: { $gte: today, $lte: threeDaysFromNow },
    }).populate('assignedTo', 'name email phone studentId');

    // 3. Outstanding Dues: sum of prices of all pending seat requests
    const pendingRequests = await User.find({
      'seatRequest.status': 'pending',
    }).populate('seatRequest.plan');

    const totalOutstandingDues = pendingRequests.reduce((sum, u) => {
      return sum + (u.seatRequest?.plan?.price || 0);
    }, 0);

    res.json({
      totalOutstandingDues,
      defaultersCount: defaultersList.length,
      expiringSoonCount: expiringSoonList.length,
      defaultersList,
      expiringSoonList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getStudents,
  updateStudent,
  deleteStudent,
  getDuesReport,
};
