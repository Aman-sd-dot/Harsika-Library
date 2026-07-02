const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', getSettings);
router.put('/', protect, adminOnly, updateSettings);

module.exports = router;
