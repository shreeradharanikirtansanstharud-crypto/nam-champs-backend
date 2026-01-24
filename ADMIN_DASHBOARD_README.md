# NamChamps Admin Dashboard

Complete backend admin management system built with Express.js and HTML/EJS templates.

## Features

### 🎯 User Management
- **View all users** - Search and filter users by name, username, or email
- **View user details** - See complete user information
- **Reset password** - Admin can directly reset user passwords
- **User counts** - View individual user's daily count history with charts

### 📊 Dashboard
- **Real-time statistics**
  - Total users count
  - Active users today
  - Average daily count
  - Total counts across all users
  
- **Interactive charts** (using Chart.js)
  - Daily count trend (last 30 days)
  - User registrations (last 30 days)
  - Top 5 active users (doughnut chart)
  - Weekly active users (bar chart)

### ⚙️ Settings Management
- **View all settings** - See current system configuration
- **Update settings** - Modify existing settings via form
- **Create new settings** - Add custom settings with different types:
  - Text
  - Number
  - Boolean (toggle switch)
  - Time (hour value 0-24)
- **System info** - View Node.js version and environment

### 🔐 Authentication
- **Session-based login** - Secure super admin portal
- **Session management** - Auto-logout after 7 days
- **API JWT support** - Legacy API routes still support JWT tokens for mobile clients

## Installation

### Prerequisites
- Node.js >= 14
- MongoDB connection string
- JWT_SECRET environment variable

### Setup

1. **Install dependencies** (already done)
   ```bash
   cd backend
   npm install
   ```

2. **Set environment variables** in `.env`
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_jwt_secret_key
   PORT=5001
   ```

3. **Start the server**
   ```bash
   npm start        # Production
   npm run dev      # Development with nodemon
   ```

4. **Access the admin portal**
   - URL: `http://localhost:5001/admin/login`
   - Login with your super admin credentials

## File Structure

```
backend/
├── controllers/
│   └── adminController.js      # All admin dashboard logic
├── routes/
│   └── adminRoutes.js          # Admin routes (HTML + API)
├── views/                      # EJS templates
│   ├── layout.ejs             # Master layout
│   ├── login.ejs              # Login page
│   ├── dashboard.ejs          # Dashboard with charts
│   ├── users.ejs              # Users list & management
│   ├── user-counts.ejs        # User counts history
│   └── settings.ejs           # Settings management
├── public/
│   └── css/
│       └── admin-style.css    # Custom styles
└── server.js                   # Main server file
```

## Routes

### HTML Pages (Session-based)
```
GET    /admin/login                    - Login page
POST   /admin/login                    - Process login
GET    /admin/logout                   - Logout user
GET    /admin/dashboard                - Dashboard
GET    /admin/users                    - Users list
POST   /admin/reset-password           - Reset password (form)
GET    /admin/users/:userId/counts     - User counts history
GET    /admin/settings                 - Settings page
POST   /admin/settings/update          - Update settings
POST   /admin/settings/create          - Create new setting
```

### API Routes (JWT-based)
```
POST   /api/admin/login                - API login
GET    /api/admin/users                - Get all users
POST   /api/admin/reset-password       - Reset password (API)
GET    /api/admin/settings             - Get settings
POST   /api/admin/settings             - Update setting
```

## Key Features

### Dashboard Statistics
- Real-time count of total users and active users
- Average daily count calculation
- Chart data for last 30 days

### User Management
- Full-text search across name, username, and email
- Individual user details modal
- Password reset with validation (min 6 characters)
- View complete count history per user

### Advanced Charts
- **Line chart** - Daily count trends
- **Bar chart** - User registrations and weekly summaries
- **Doughnut chart** - Top 5 active users distribution

### Settings Types
- **Time settings** - For operational hours (0-24)
- **Text settings** - Configuration strings
- **Number settings** - Numeric configuration
- **Boolean settings** - Feature flags and toggles

## UI Features

- **Bootstrap 5** - Responsive grid system
- **Chart.js** - Interactive data visualization
- **Font Awesome** - Icons throughout
- **Responsive design** - Works on desktop and tablet
- **Dark navbar** - Professional appearance
- **Modals** - User details and password reset
- **Session persistence** - 7-day auto-logout
- **Flash messages** - Success and error notifications

## Security

- ✅ Session-based authentication with 7-day timeout
- ✅ Password hashing with bcryptjs
- ✅ Admin permission checks
- ✅ CSRF-ready structure (add tokens if needed)
- ✅ Protected routes requiring admin login
- ✅ No passwords exposed in API responses

## Styling

Custom CSS includes:
- Card hover effects
- Button animations
- Status badges
- Responsive tables
- Alert styling
- Custom scrollbar styling
- Mobile-friendly responsive design

## Usage Examples

### View Dashboard
1. Navigate to `http://localhost:5001/admin/login`
2. Enter super admin credentials
3. View real-time statistics and charts

### Reset User Password
1. Go to Users page
2. Click "Reset Pass" on any user
3. Enter new password (min 6 characters)
4. Submit form

### Manage Settings
1. Go to Settings page
2. Modify existing settings or create new ones
3. Click "Save All Settings" to update

### Check User Progress
1. Go to Users page
2. Click "Counts" on any user
3. View count history with trend charts

## Notes

- All HTML pages require session-based admin login
- API routes still support legacy JWT tokens for backward compatibility
- Charts automatically refresh with latest data
- Password reset doesn't require email confirmation (direct password change)
- Settings are stored in MongoDB with timestamps

## Future Enhancements

- Add email notifications on password reset
- Export user data to CSV/Excel
- Advanced filtering and sorting
- Admin activity log
- CSRF token protection
- Two-factor authentication
- API rate limiting
