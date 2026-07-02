const express = require('express');
const router = express.Router();
const {
  checkInStudent,
  checkOutStudent,
  getMyAttendance,
  getAllAttendance,
  getTodayAttendance,
} = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/checkin', protect, checkInStudent);
router.post('/checkout', protect, checkOutStudent);
router.get('/my', protect, getMyAttendance);
router.get('/all', protect, adminOnly, getAllAttendance);
router.get('/today', protect, adminOnly, getTodayAttendance);

module.exports = router;
