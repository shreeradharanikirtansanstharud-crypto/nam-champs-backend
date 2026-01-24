const SuperAdmin = require('../models/SuperAdmin');
const User = require('../models/User');
const Settings = require('../models/Settings');
const DailyCount = require('../models/DailyCount');
const jwt = require('jsonwebtoken');

// ============ PAGE RENDERING (HTML/EJS) ============

// Render Login Page
exports.renderLoginPage = async (req, res) => {
  try {
    if (req.session && req.session.adminId) {
      return res.redirect('/admin/dashboard');
    }
    res.render('login', { 
      title: 'Admin Login',
      error: req.session?.error || null 
    });
    delete req.session?.error;
  } catch (error) {
    console.error('❌ Render login error:', error.message);
    res.render('login', { title: 'Admin Login', error: 'Error loading login page' });
  }
};

// HTML Login (for dashboard)
exports.htmlLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      req.session.error = 'Username and password are required';
      return res.redirect('/admin/login');
    }

    const admin = await SuperAdmin.findOne({ username: username.toLowerCase() });
    if (!admin) {
      req.session.error = 'Invalid admin credentials';
      return res.redirect('/admin/login');
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      req.session.error = 'Invalid admin credentials';
      return res.redirect('/admin/login');
    }

    // Set session
    req.session.adminId = admin._id.toString();
    req.session.adminUsername = admin.username;
    req.session.adminPermissions = admin.permissions;

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    console.log('✅ Admin login successful:', admin._id);
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('❌ Admin HTML login error:', error.message);
    req.session.error = 'Login error: ' + error.message;
    res.redirect('/admin/login');
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout error' });
    }
    res.redirect('/admin/login');
  });
};

// Render Dashboard
exports.renderDashboard = async (req, res) => {
  try {
    const adminId = req.session.adminId;
    if (!adminId) {
      return res.redirect('/admin/login');
    }

    // Get statistics
    const totalUsers = await User.countDocuments();
    const allCounts = await DailyCount.find();
    const totalCounts = allCounts.reduce((sum, count) => sum + count.count, 0);

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeUsersToday = await DailyCount.countDocuments({ 
      date: { $gte: today }, 
      count: { $gt: 0 } 
    });

    const avgDailyCount = totalUsers > 0 ? totalCounts / totalUsers : 0;

    // Get chart data (last 30 days)
    const chartData = await getChartData();

    res.render('dashboard', {
      title: 'Dashboard',
      stats: {
        totalUsers,
        activeUsersToday,
        avgDailyCount,
        totalCounts
      },
      charts: chartData,
      adminUsername: req.session.adminUsername
    });
  } catch (error) {
    console.error('❌ Dashboard render error:', error.message);
    res.status(500).send('Error loading dashboard');
  }
};

// Render Users List
exports.renderUsersList = async (req, res) => {
  try {
    const adminId = req.session.adminId;
    if (!adminId) {
      return res.redirect('/admin/login');
    }

    const search = req.query.search || '';
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).lean();

    res.render('users', {
      title: 'Users',
      users,
      search,
      adminUsername: req.session.adminUsername
    });
  } catch (error) {
    console.error('❌ Users list render error:', error.message);
    res.status(500).send('Error loading users');
  }
};

// Render User Counts
exports.renderUserCounts = async (req, res) => {
  try {
    const adminId = req.session.adminId;
    if (!adminId) {
      return res.redirect('/admin/login');
    }

    const { userId } = req.params;
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      return res.status(404).send('User not found');
    }

    const counts = await DailyCount.find({ userId }).sort({ date: -1 }).lean();
    const totalCount = counts.reduce((sum, c) => sum + c.count, 0);
    const daysActive = counts.length;
    const lastCount = counts.length > 0 ? counts[0].count : 0;

    // Chart data
    const chartData = {
      labels: counts.reverse().map(c => new Date(c.date).toLocaleDateString()),
      data: counts.map(c => c.count)
    };

    // Weekly summary
    const weeklySummary = getWeeklySummary(counts);

    res.render('user-counts', {
      title: 'User Counts',
      userName: user.name,
      counts: counts.reverse(),
      totalCount,
      daysActive,
      lastCount,
      chartData,
      weeklySummary,
      adminUsername: req.session.adminUsername
    });
  } catch (error) {
    console.error('❌ User counts render error:', error.message);
    res.status(500).send('Error loading user counts');
  }
};

// Render Settings
exports.renderSettings = async (req, res) => {
  try {
    const adminId = req.session.adminId;
    if (!adminId) {
      return res.redirect('/admin/login');
    }

    const settings = await Settings.find().sort({ createdAt: 1 }).lean();
    const systemInfo = {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };

    res.render('settings', {
      title: 'Settings',
      settings,
      systemInfo,
      adminUsername: req.session.adminUsername,
      message: req.session?.message || null,
      error: req.session?.error || null
    });

    delete req.session?.message;
    delete req.session?.error;
  } catch (error) {
    console.error('❌ Settings render error:', error.message);
    res.status(500).send('Error loading settings');
  }
};

// ============ FORM HANDLERS ============

// Reset User Password (Form submission)
exports.resetUserPassword = async (req, res) => {
  try {
    const adminId = req.session.adminId;
    if (!adminId) {
      return res.status(401).redirect('/admin/login');
    }

    const { userId, newPassword, sendEmail } = req.body;

    if (!newPassword || newPassword.length < 6) {
      req.session.error = 'Password must be at least 6 characters';
      return res.redirect('/admin/users');
    }

    const user = await User.findById(userId);
    if (!user) {
      req.session.error = 'User not found';
      return res.redirect('/admin/users');
    }

    user.password = newPassword;
    await user.save();

    console.log('✅ Password reset for user:', userId);
    req.session.message = `Password reset successfully for ${user.name}`;
    res.redirect('/admin/users');
  } catch (error) {
    console.error('❌ Password reset error:', error.message);
    req.session.error = 'Error resetting password: ' + error.message;
    res.redirect('/admin/users');
  }
};

// Update Settings (Form submission)
exports.updateSettingsForm = async (req, res) => {
  try {
    const adminId = req.session.adminId;
    if (!adminId) {
      return res.status(401).redirect('/admin/login');
    }

    const bodyKeys = Object.keys(req.body);
    let updatedCount = 0;

    for (const settingId of bodyKeys) {
      const settingValue = req.body[settingId];
      
      const setting = await Settings.findByIdAndUpdate(
        settingId,
        { settingValue, updatedAt: new Date() },
        { new: true }
      );
      
      if (setting) updatedCount++;
    }

    req.session.message = `${updatedCount} setting(s) updated successfully`;
    res.redirect('/admin/settings');
  } catch (error) {
    console.error('❌ Settings update error:', error.message);
    req.session.error = 'Error updating settings: ' + error.message;
    res.redirect('/admin/settings');
  }
};

// Create New Setting
exports.createSetting = async (req, res) => {
  try {
    const adminId = req.session.adminId;
    if (!adminId) {
      return res.status(401).redirect('/admin/login');
    }

    const { settingKey, settingValue, type, description } = req.body;

    if (!settingKey || !settingValue || !type) {
      req.session.error = 'Missing required fields';
      return res.redirect('/admin/settings');
    }

    const existingSetting = await Settings.findOne({ settingKey });
    if (existingSetting) {
      req.session.error = 'Setting key already exists';
      return res.redirect('/admin/settings');
    }

    await Settings.create({
      settingKey,
      settingValue,
      type,
      description
    });

    req.session.message = `Setting "${settingKey}" created successfully`;
    res.redirect('/admin/settings');
  } catch (error) {
    console.error('❌ Create setting error:', error.message);
    req.session.error = 'Error creating setting: ' + error.message;
    res.redirect('/admin/settings');
  }
};

// ============ API ROUTES (JSON - for legacy/mobile clients) ============

// Super Admin API Login
exports.apiLogin = async (req, res) => {
  try {
    console.log('🔐 Admin login request body:', req.body);
    console.log('🔐 Request headers:', req.headers);
    
    const { username, password } = req.body;
    console.log('🔐 Extracted credentials:', { username, password });

    // Validate input
    if (!username || !password) {
      console.log('❌ Missing credentials - username:', username, 'password:', password);
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find admin
    const admin = await SuperAdmin.findOne({ username: username.toLowerCase() });
    if (!admin) {
      console.log('❌ Admin not found:', username);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Verify password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Admin password mismatch');
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, role: 'super_admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    console.log('✅ Admin login successful:', admin._id);

    res.status(200).json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    console.error('❌ Admin login error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Reset user password (by super admin - API)
exports.apiResetUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const adminId = req.adminId;

    console.log('🔐 Admin password reset request for user:', userId);

    // Verify admin has permission
    const admin = await SuperAdmin.findById(adminId);
    if (!admin || !admin.permissions.canResetPasswords) {
      return res.status(403).json({ message: 'Admin does not have permission to reset passwords' });
    }

    // Validate password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find user and reset password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    console.log('✅ Password reset for user:', userId);

    res.status(200).json({
      message: 'User password reset successfully',
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ Password reset error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get all users (API)
exports.getAllUsers = async (req, res) => {
  try {
    const adminId = req.adminId;

    // Verify admin has permission
    const admin = await SuperAdmin.findById(adminId);
    if (!admin || !admin.permissions.canManageUsers) {
      return res.status(403).json({ message: 'Admin does not have permission to manage users' });
    }

    const users = await User.find().select('-password').lean();
    console.log('✅ Retrieved', users.length, 'users for admin');

    res.status(200).json({
      message: 'Users retrieved successfully',
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('❌ Get users error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get settings (API)
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.find().lean();
    const settingsObj = {};

    settings.forEach((setting) => {
      settingsObj[setting.settingKey] = setting.settingValue;
    });

    console.log('✅ Settings retrieved');

    res.status(200).json({
      message: 'Settings retrieved successfully',
      settings: settingsObj,
    });
  } catch (error) {
    console.error('❌ Get settings error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update settings (API)
exports.updateSettings = async (req, res) => {
  try {
    const { settingKey, settingValue } = req.body;
    const adminId = req.adminId;

    // Verify admin has permission
    const admin = await SuperAdmin.findById(adminId);
    if (!admin || !admin.permissions.canManageSettings) {
      return res.status(403).json({ message: 'Admin does not have permission to manage settings' });
    }

    // Validate input
    if (!settingKey || settingValue === undefined) {
      return res.status(400).json({ message: 'Setting key and value are required' });
    }

    // Update or create setting
    const setting = await Settings.findOneAndUpdate(
      { settingKey },
      {
        settingValue,
        updatedAt: new Date(),
        updatedBy: adminId,
      },
      { upsert: true, new: true }
    );

    console.log('✅ Setting updated:', settingKey, '=', settingValue);

    res.status(200).json({
      message: 'Setting updated successfully',
      setting: {
        key: setting.settingKey,
        value: setting.settingValue,
      },
    });
  } catch (error) {
    console.error('❌ Update settings error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// ============ HELPER FUNCTIONS ============

async function getChartData() {
  const days = 30;
  const labels = [];
  const dailyData = [];
  const regLabels = [];
  const regData = [];
  const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = [0, 0, 0, 0, 0, 0, 0];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const counts = await DailyCount.find({
      date: { $gte: date, $lt: nextDate }
    });

    const dailySum = counts.reduce((sum, c) => sum + c.count, 0);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    dailyData.push(dailySum);

    // Weekly accumulation
    const dayOfWeek = date.getDay();
    weeklyData[(dayOfWeek + 6) % 7] += dailySum;

    // User registrations
    const users = await User.find({
      createdAt: { $gte: date, $lt: nextDate }
    });
    regLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    regData.push(users.length);
  }

  // Top users
  const topUsers = await DailyCount.aggregate([
    { $group: { _id: '$userId', totalCount: { $sum: '$count' } } },
    { $sort: { totalCount: -1 } },
    { $limit: 5 }
  ]);

  const topUserData = await Promise.all(
    topUsers.map(async (tu) => {
      const user = await User.findById(tu._id);
      return { name: user?.name || 'Unknown', count: tu.totalCount };
    })
  );

  return {
    dailyLabels: labels,
    dailyData,
    regLabels,
    regData,
    topUserNames: topUserData.map(u => u.name),
    topUserCounts: topUserData.map(u => u.count),
    weeklyLabels,
    weeklyData
  };
}

function getWeeklySummary(counts) {
  const weeks = {};
  const labels = [];
  const data = [];

  counts.forEach(count => {
    const date = new Date(count.date);
    const week = `${date.getFullYear()}-W${Math.ceil((date.getDate() - date.getDay() + 6) / 7)}`;
    weeks[week] = (weeks[week] || 0) + count.count;
  });

  Object.entries(weeks).slice(-4).forEach(([week, total]) => {
    labels.push(week);
    data.push(total);
  });

  return { labels, data };
}
