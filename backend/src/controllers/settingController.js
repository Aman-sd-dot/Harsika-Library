const Setting = require('../models/settingModel');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({});
    if (!settings) {
      // Seed default settings
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update system settings (Admin)
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  const { openingTime, closingTime, rules, notice, contactNumber } = req.body;

  try {
    let settings = await Setting.findOne({});
    if (!settings) {
      settings = new Setting({});
    }

    settings.openingTime = openingTime !== undefined ? openingTime : settings.openingTime;
    settings.closingTime = closingTime !== undefined ? closingTime : settings.closingTime;
    settings.rules = rules !== undefined ? rules : settings.rules;
    settings.notice = notice !== undefined ? notice : settings.notice;
    settings.contactNumber = contactNumber !== undefined ? contactNumber : settings.contactNumber;

    const updated = await settings.save();
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
