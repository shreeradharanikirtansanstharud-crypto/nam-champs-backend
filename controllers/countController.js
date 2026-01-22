const DailyCount = require('../models/DailyCount');
const User = require('../models/User');
const Settings = require('../models/Settings');

// Get today's date at midnight
const getTodayDate = () => {
  return new Date(new Date().setHours(0, 0, 0, 0));
};

// Check if current time is after result time (configured in settings, default 8 PM)
const isAfterResultTime = async () => {
  try {
    const setting = await Settings.findOne({ settingKey: 'result_time' }).lean();
    const resultTime = setting ? parseInt(setting.settingValue) : 20; // Default 8 PM (20:00)
    const now = new Date();
    return now.getHours() >= resultTime;
  } catch (error) {
    console.error('Error checking result time:', error.message);
    return false;
  }
};

// Increment count for user today
exports.incrementCount = async (req, res) => {
  try {
    const userId = req.userId;
    const today = getTodayDate();

    // Check if counting is locked (after result time)
    if (await isAfterResultTime()) {
      return res.status(400).json({ message: 'Counting is closed for today (after result time)' });
    }

    // Find or create today's count
    let dailyCount = await DailyCount.findOne({ userId, date: today });

    if (!dailyCount) {
      dailyCount = new DailyCount({ userId, date: today, count: 0 });
    }

    // Check if user is active (not paused)
    if (!dailyCount.isActive) {
      return res.status(400).json({ message: 'Counting is paused' });
    }

    dailyCount.count += 1;
    await dailyCount.save();

    res.status(200).json({
      message: 'Count incremented',
      count: dailyCount.count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get today's count for user
exports.getTodayCount = async (req, res) => {
  try {
    const userId = req.userId;
    const today = getTodayDate();

    let dailyCount = await DailyCount.findOne({ userId, date: today });

    if (!dailyCount) {
      dailyCount = new DailyCount({ userId, date: today, count: 0 });
      await dailyCount.save();
    }

    res.status(200).json({
      count: dailyCount.count,
      isActive: dailyCount.isActive,
      isCountingClosed: await isAfterResultTime(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pause/Resume counting
exports.toggleCountingStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const today = getTodayDate();

    let dailyCount = await DailyCount.findOne({ userId, date: today });

    if (!dailyCount) {
      dailyCount = new DailyCount({ userId, date: today, count: 0 });
    }

    dailyCount.isActive = !dailyCount.isActive;
    await dailyCount.save();

    res.status(200).json({
      message: dailyCount.isActive ? 'Counting resumed' : 'Counting paused',
      isActive: dailyCount.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sync count from client (batch save)
exports.syncCount = async (req, res) => {
  try {
    const userId = req.userId;
    const { count } = req.body;
    const today = getTodayDate();

    // Check if counting is locked (after result time)
    if (await isAfterResultTime()) {
      return res.status(400).json({ message: 'Counting is closed for today (after result time)' });
    }

    // Find or create today's count
    let dailyCount = await DailyCount.findOne({ userId, date: today });

    if (!dailyCount) {
      dailyCount = new DailyCount({ userId, date: today, count: 0 });
    }

    // Update count to the synced value
    dailyCount.count = count;
    await dailyCount.save();
    console.log(`✅ Count synced for user ${userId}: ${count}`);

    res.status(200).json({
      message: 'Count synced successfully',
      count: dailyCount.count,
    });
  } catch (error) {
    console.log('❌ Sync error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get leaderboard (only after result time)
exports.getLeaderboard = async (req, res) => {
  try {
    if (!(await isAfterResultTime())) {
      return res.status(400).json({ 
        message: 'Leaderboard is available after result time',
        isAvailable: false,
      });
    }

    const today = getTodayDate();

    const leaderboard = await DailyCount.find({ date: today })
      .populate('userId', 'name username address')
      .sort({ count: -1 })
      .lean();
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      name: entry.userId.name,
      username: entry.userId.username,
      count: entry.count,
      address: entry.userId.address,
    }));

    res.status(200).json({
      message: 'Leaderboard',
      isAvailable: true,
      leaderboard: formattedLeaderboard,
    });
  } catch (error) {
    console.log('❌ Leaderboard error:', error.message);    
    res.status(500).json({ message: error.message });
  }
};
