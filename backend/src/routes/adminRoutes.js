const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getStudents,
  updateStudent,
  deleteStudent,
  getDuesReport,
  createStudentByAdmin,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/students', protect, adminOnly, getStudents);
router.post('/students', protect, adminOnly, createStudentByAdmin);
router.get('/dues', protect, adminOnly, getDuesReport);
router.put('/students/:id', protect, adminOnly, updateStudent);
router.delete('/students/:id', protect, adminOnly, deleteStudent);

module.exports = router;
