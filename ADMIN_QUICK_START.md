# Admin Dashboard - Quick Start Guide

## Access the Admin Portal

### 1. **Login**
   - URL: `http://localhost:5001/admin/login`
   - Use your super admin username and password
   - Auto-logout after 7 days of inactivity

### 2. **Dashboard**
   - View real-time statistics
   - See interactive charts for trends
   - Monitor active users and counts

### 3. **User Management** (`/admin/users`)
   - **Search Users** - Find by name, username, or email
   - **View Details** - Click "View" to see full user info
   - **Reset Password** - Click "Reset Pass" and enter new password
   - **Check Counts** - Click "Counts" to see daily count history

### 4. **User Counts** (`/admin/users/{userId}/counts`)
   - **Statistics**
     - Total count across all days
     - Number of active days
     - Average daily count
     - Last count value
   - **Charts**
     - Line chart showing count trend
     - Weekly summary bar chart
   - **History Table** - Day-by-day count breakdown

### 5. **Settings Management** (`/admin/settings`)
   - **View Settings** - See all current system settings
   - **Update Settings** - Modify values and save
   - **Create New Setting** - Add custom settings
     - Choose type: Text, Number, Boolean, or Time
     - Add description for reference
   - **System Info** - View Node.js version and environment

## Available Charts

### Dashboard Charts
1. **Daily Count Trend** (Last 30 Days)
   - Line chart showing daily total counts
   - Helps identify usage patterns

2. **User Registrations** (Last 30 Days)
   - Bar chart of new registrations per day
   - Track user growth

3. **Top 5 Active Users**
   - Doughnut chart showing top contributors
   - Visual distribution of activity

4. **Weekly Active Users**
   - Bar chart of active users by day
   - Week-at-a-glance overview

### User Counts Charts
1. **Count Trend** (Individual User)
   - Personal count history
   - Performance tracking

2. **Weekly Summary**
   - Week-by-week aggregation
   - Progress visualization

## Common Tasks

### Reset a User's Password
```
1. Go to /admin/users
2. Find the user (use search if needed)
3. Click "Reset Pass" button
4. Enter new password (min 6 characters)
5. Confirm password
6. (Optional) Check "Send email notification"
7. Click "Reset Password"
```

### Add a New System Setting
```
1. Go to /admin/settings
2. Scroll to "Add New Setting" card
3. Enter setting key (lowercase, underscores only)
4. Enter setting value
5. Select type (Text/Number/Boolean/Time)
6. Add optional description
7. Click "Add Setting"
```

### Check User Activity
```
1. Go to /admin/users
2. Click "Counts" on the user
3. View charts and daily history
4. Analyze trends and patterns
```

### Update System Settings
```
1. Go to /admin/settings
2. Modify any setting values
3. Click "Save All Settings"
4. Refresh page to confirm changes
```

## Dashboard Statistics

| Metric | Description |
|--------|-------------|
| Total Users | All registered users |
| Active Users Today | Users with count > 0 today |
| Avg Daily Count | Average count per user |
| Total Counts | Sum of all counts ever |

## Setting Types

| Type | Example | Use Case |
|------|---------|----------|
| Text | "App Name" | Configuration strings |
| Number | 100 | Numeric limits/values |
| Boolean | true/false | Feature flags |
| Time | 20 (hour) | Operational hours (0-24) |

## UI Features

- **Responsive Design** - Works on desktop, tablet, mobile
- **Dark Navbar** - Professional appearance
- **Card Layouts** - Organized information
- **Modals** - User details, password reset
- **Data Tables** - Searchable, sortable lists
- **Chart Visualization** - Interactive graphs
- **Flash Messages** - Success/error notifications

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Go to Dashboard | Click logo "NamChamps Admin" |
| Search Users | `Ctrl + F` in browser |
| Refresh Page | `Ctrl + R` or `F5` |

## Logout

- Click "Logout" in top-right navigation
- Or session auto-expires after 7 days

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't login | Check username/password, verify admin exists in DB |
| Charts not showing | Wait for data to load, check browser console |
| Settings not saving | Ensure all required fields filled, check server logs |
| Password reset fails | Check minimum 6 character requirement |

## API Endpoints (for external clients)

```bash
# Admin login (returns JWT)
POST /api/admin/login
{ "username": "admin", "password": "password" }

# Get all users
GET /api/admin/users
Header: Authorization: Bearer {token}

# Reset user password
POST /api/admin/reset-password
Header: Authorization: Bearer {token}
{ "userId": "...", "newPassword": "..." }

# Get settings
GET /api/admin/settings

# Update setting
POST /api/admin/settings
Header: Authorization: Bearer {token}
{ "settingKey": "key", "settingValue": "value" }
```

## File Locations

- **Admin Views**: `backend/views/*.ejs`
- **Admin Styles**: `backend/public/css/admin-style.css`
- **Admin Controller**: `backend/controllers/adminController.js`
- **Admin Routes**: `backend/routes/adminRoutes.js`
- **Documentation**: `backend/ADMIN_DASHBOARD_README.md`

---

**Need help?** Check the console logs or the full README in `backend/ADMIN_DASHBOARD_README.md`
