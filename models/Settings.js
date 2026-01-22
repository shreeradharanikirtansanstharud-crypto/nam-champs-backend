const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  settingKey: {
    type: String,
    required: true,
    unique: true,
  },
  settingValue: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'time'],
    default: 'string',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin',
  },
});

// Indexes for quick lookups
SettingsSchema.index({ settingKey: 1 });

module.exports = mongoose.model('Settings', SettingsSchema);
