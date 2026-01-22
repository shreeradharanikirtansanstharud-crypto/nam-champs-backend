require('dotenv').config();
const mongoose = require('mongoose');
const SuperAdmin = require('./models/SuperAdmin');
const Settings = require('./models/Settings');

// Default super admin credentials
const DEFAULT_ADMIN = {
  username: 'admin',
  email: 'admin@namchamps.com',
  password: 'Admin@123456',
};

// Default settings
const DEFAULT_SETTINGS = [
  {
    settingKey: 'result_time',
    settingValue: '20', // 8 PM (20:00)
    description: 'Time when leaderboard becomes available (0-23 hours)',
    type: 'number',
  },
  {
    settingKey: 'app_name',
    settingValue: 'NamChamp',
    description: 'Application name',
    type: 'string',
  },
];

async function initDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Create super admin
    console.log('📝 Creating default super admin...');
    const existingAdmin = await SuperAdmin.findOne({ username: DEFAULT_ADMIN.username });

    if (existingAdmin) {
      console.log('⚠️  Super admin already exists');
    } else {
      const admin = await SuperAdmin.create(DEFAULT_ADMIN);
      console.log('✅ Super admin created successfully');
      console.log('📧 Username:', admin.username);
      console.log('📧 Email:', admin.email);
      console.log('🔑 Default Password:', DEFAULT_ADMIN.password);
      console.log('⚠️  IMPORTANT: Change this password after first login!');
    }

    // Initialize settings
    console.log('⚙️  Initializing settings...');
    for (const setting of DEFAULT_SETTINGS) {
      const existing = await Settings.findOne({ settingKey: setting.settingKey });
      if (!existing) {
        await Settings.create(setting);
        console.log('✅ Created setting:', setting.settingKey);
      } else {
        console.log('⚠️  Setting already exists:', setting.settingKey);
      }
    }

    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  }
}

initDatabase();
