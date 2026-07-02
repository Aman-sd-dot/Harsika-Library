const Notification = require('../models/notificationModel');

// @desc    Get all notifications for logged-in student (specific + broadcast)
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ recipient: req.user._id }, { recipient: null }],
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all notifications (Admin)
// @route   GET /api/notifications/admin
// @access  Private/Admin
const getAllNotificationsAdmin = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .populate('recipient', 'name email studentId')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a notification notice (Admin)
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = async (req, res) => {
  const { recipient, title, message, type } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required' });
  }

  try {
    const notification = await Notification.create({
      recipient: recipient || null, // null means broadcast to all
      title,
      message,
      type: type || 'notice',
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark individual notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
      notification.isRead = true;
      await notification.save();
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getNotifications,
  getAllNotificationsAdmin,
  createNotification,
  markAsRead,
};
