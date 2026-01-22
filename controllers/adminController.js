const SuperAdmin = require('../models/SuperAdmin');
const User = require('../models/User');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');

// Super Admin Login
exports.login = async (req, res) => {
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

// Reset user password (by super admin)
exports.resetUserPassword = async (req, res) => {
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

// Get all users (for admin dashboard)
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

// Get settings
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

// Update settings
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
