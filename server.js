require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const countRoutes = require('./routes/countRoutes');
const adminRoutes = require('./routes/adminRoutes');
const Settings = require('./models/Settings');

const app = express();
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layout');

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for admin dashboard
app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    // Initialize default settings
    initializeSettings();
  })
  .catch((error) => {
  console.log('❌ MongoDB connection error:', error.message);
});

// Initialize default settings
const initializeSettings = async () => {
  try {
    // Ensure result_time setting exists
    const resultTimeSetting = await Settings.findOne({ settingKey: 'result_time' });
    if (!resultTimeSetting) {
      await Settings.create({
        settingKey: 'result_time',
        settingValue: 20,
        type: 'time',
        description: 'Hour when leaderboard results are revealed (0-23 in IST, default 20 = 8 PM)'
      });
      console.log('📝 Created default result_time setting: 20 (8 PM)');
    }

    // Ensure counting_closed_time setting exists
    const countingClosedSetting = await Settings.findOne({ settingKey: 'counting_closed_time' });
    if (!countingClosedSetting) {
      await Settings.create({
        settingKey: 'counting_closed_time',
        settingValue: 24,
        type: 'time',
        description: 'Hour when counting is closed (0-23 in IST, or 24 for never closed, default 24 = never)'
      });
      console.log('📝 Created default counting_closed_time setting: 24 (never closed)');
    }
  } catch (error) {
    console.error('❌ Error initializing settings:', error.message);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/count', countRoutes);
app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);  // Admin HTML pages

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.log('❌ Error:', err.message);
  console.log('Stack:', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
