const express = require('express');
const router = express.Router();
const {
  getPayments,
  getMyPayments,
  createPayment,
  approvePayment,
  rejectPayment,
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', protect, adminOnly, getPayments);
router.get('/my', protect, getMyPayments);
router.post('/', protect, createPayment);
router.post('/:id/approve', protect, adminOnly, approvePayment);
router.post('/:id/reject', protect, adminOnly, rejectPayment);

module.exports = router;
