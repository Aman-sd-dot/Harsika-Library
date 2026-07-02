const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getAllNotificationsAdmin,
  createNotification,
  markAsRead,
} = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', protect, getNotifications);
router.get('/admin', protect, adminOnly, getAllNotificationsAdmin);
router.post('/', protect, adminOnly, createNotification);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
