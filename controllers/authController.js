const User = require('../models/User');
const DailyCount = require('../models/DailyCount');
const jwt = require('jsonwebtoken');

// Register User
exports.register = async (req, res) => {
  try {
    const { name, username, email, phone, address, password } = req.body;
    console.log('📝 Register request:', { name, username, email, phone, address });

    // Validate required fields
    if (!name || !username || !password) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ message: 'Name, username, and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      console.log('❌ Username already exists:', username);
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user
    const user = new User({
      name,
      username: username.toLowerCase(),
      email: email || '',
      phone: phone || '',
      address: address || '',
      password,
    });

    await user.save();
    console.log('✅ User registered:', user._id, username);

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.log('❌ Register error:', error.message, error.stack);
    res.status(500).json({ message: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('🔓 Login request:', { username });

    // Validate required fields
    if (!username || !password) {
      console.log('❌ Login validation failed: Missing credentials');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      console.log('❌ Login failed: User not found -', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    console.log('✅ User found:', user.username);

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log('🔐 Password match:', isMatch);
    if (!isMatch) {
      console.log('❌ Login failed: Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    console.log('✅ Token generated for user:', user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.log('❌ Login error:', error.message, error.stack);
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    console.log('🔐 Change password request for user:', req.userId);

    // Validate required fields
    if (!currentPassword || !newPassword) {
      console.log('❌ Validation failed: Missing password fields');
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    // Validate password length
    if (newPassword.length < 6) {
      console.log('❌ Validation failed: Password too short');
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Find user
    const user = await User.findById(req.userId);
    if (!user) {
      console.log('❌ User not found:', req.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      console.log('❌ Current password incorrect for user:', req.userId);
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    console.log('✅ Current password verified');

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();
    console.log('✅ Password updated for user:', req.userId);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.log('❌ Change password error:', error.message, error.stack);
    res.status(500).json({ message: error.message });
  }
};
