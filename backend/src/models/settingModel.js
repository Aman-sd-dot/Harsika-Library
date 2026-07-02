const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    openingTime: {
      type: String,
      default: '08:00 AM',
    },
    closingTime: {
      type: String,
      default: '10:00 PM',
    },
    rules: {
      type: [String],
      default: [
        'Maintain absolute silence in the study area.',
        'Ensure you check in and check out at the front desk.',
        'Keep your assigned seat clean.',
        'Food and drinks (except water) are not allowed inside.',
      ],
    },
    notice: {
      type: String,
      default: 'Welcome to Harsika Library! Please follow the rules and study hard.',
    },
    contactNumber: {
      type: String,
      default: '+91 98765 43210',
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;
