const express = require('express');
const router = express.Router();
const {
  getSeats,
  createSeat,
  updateSeat,
  deleteSeat,
  requestSeat,
  assignSeat,
  vacateSeat,
} = require('../controllers/seatController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', protect, getSeats);
router.post('/', protect, adminOnly, createSeat);
router.put('/:id', protect, adminOnly, updateSeat);
router.delete('/:id', protect, adminOnly, deleteSeat);
router.post('/request', protect, requestSeat);
router.post('/assign', protect, adminOnly, assignSeat);
router.post('/vacate', protect, adminOnly, vacateSeat);

module.exports = router;
