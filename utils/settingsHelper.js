const Settings = require('../models/Settings');
const { getISTHour } = require('./istTimezone');

// Get result reveal time from settings (default: 20 for 8 PM IST)
exports.getResultTime = async () => {
  try {
    const setting = await Settings.findOne({ settingKey: 'result_time' }).lean();
    const resultTime = setting ? parseInt(setting.settingValue) : 20; // Default 8 PM (20:00)
    return resultTime;
  } catch (error) {
    console.error('Error fetching result time:', error.message);
    return 20; // Fallback to 8 PM
  }
};

// Check if current time is after result time (IST timezone)
exports.isAfterResultTime = async () => {
  try {
    const resultTime = await this.getResultTime();
    const currentHour = getISTHour();
    return currentHour >= resultTime;
  } catch (error) {
    console.error('Error checking result time:', error.message);
    return false;
  }
};

// Get formatted result time string
exports.getFormattedResultTime = async () => {
  try {
    const resultTime = await this.getResultTime();
    const hour = resultTime % 12 || 12;
    const period = resultTime >= 12 ? 'PM' : 'AM';
    return `${hour}:00 ${period}`;
  } catch (error) {
    return '8:00 PM';
  }
};
