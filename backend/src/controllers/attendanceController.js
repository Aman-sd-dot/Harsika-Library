const Attendance = require('../models/attendanceModel');
const User = require('../models/userModel');
const Seat = require('../models/seatModel');

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Check-in student
// @route   POST /api/attendance/checkin
// @access  Private
const checkInStudent = async (req, res) => {
  const studentId = req.user._id;
  const todayStr = getLocalDateString();

  try {
    // Verify student has an active seat assignment to allow check-in
    const student = await User.findById(studentId);
    if (!student.assignedSeat) {
      return res.status(400).json({ message: 'You must have an assigned seat to check in.' });
    }

    // Verify seat assignment is not expired
    const seat = await Seat.findById(student.assignedSeat);
    if (seat && seat.expiryDate && new Date() > seat.expiryDate) {
      return res.status(403).json({
        message: 'Check-in blocked. Your seat membership has expired. Please pay your pending dues to resume access.',
      });
    }

    const existingRecord = await Attendance.findOne({ student: studentId, date: todayStr });

    if (existingRecord) {
      return res.status(400).json({ message: 'Already checked in for today.' });
    }

    const record = await Attendance.create({
      student: studentId,
      date: todayStr,
      checkIn: new Date(),
    });

    res.status(201).json({ message: 'Checked in successfully', record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check-out student
// @route   POST /api/attendance/checkout
// @access  Private
const checkOutStudent = async (req, res) => {
  const studentId = req.user._id;
  const todayStr = getLocalDateString();

  try {
    const record = await Attendance.findOne({ student: studentId, date: todayStr });

    if (!record) {
      return res.status(400).json({ message: 'You are not checked in for today.' });
    }

    if (record.checkOut) {
      return res.status(400).json({ message: 'Already checked out for today.' });
    }

    record.checkOut = new Date();
    await record.save();

    res.json({ message: 'Checked out successfully', record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get student's own attendance history
// @route   GET /api/attendance/my
// @access  Private
const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.user._id }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all attendance records (Admin)
// @route   GET /api/attendance/all
// @access  Private/Admin
const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({})
      .populate('student', 'name email phone studentId')
      .sort({ createdAt: -1 });
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get today's active checkins (Admin)
// @route   GET /api/attendance/today
// @access  Private/Admin
const getTodayAttendance = async (req, res) => {
  const todayStr = getLocalDateString();
  try {
    const attendance = await Attendance.find({ date: todayStr })
      .populate('student', 'name email phone studentId');
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  checkInStudent,
  checkOutStudent,
  getMyAttendance,
  getAllAttendance,
  getTodayAttendance,
};
