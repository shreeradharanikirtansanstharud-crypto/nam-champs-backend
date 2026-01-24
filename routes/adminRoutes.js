const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// Session-based auth middleware for HTML routes
const sessionAuth = (req, res, next) => {
  if (!req.session || !req.session.adminId) {
    return res.redirect('/admin/login');
  }
  next();
};

// ============ HTML PAGES (Session-based) ============

// Login routes
router.get('/login', adminController.renderLoginPage);
router.post('/login', adminController.htmlLogin);
router.get('/logout', adminController.logout);

// Dashboard routes
router.get('/dashboard', sessionAuth, adminController.renderDashboard);

// User management routes
router.get('/users', sessionAuth, adminController.renderUsersList);
router.post('/reset-password', sessionAuth, adminController.resetUserPassword);
router.get('/users/:userId/counts', sessionAuth, adminController.renderUserCounts);

// Settings routes
router.get('/settings', sessionAuth, adminController.renderSettings);
router.post('/settings/update', sessionAuth, adminController.updateSettingsForm);
router.post('/settings/create', sessionAuth, adminController.createSetting);

// ============ API ROUTES (JWT Token-based - for mobile/external clients) ============

// API login
router.post('/api/login', adminController.apiLogin);

// Protected API routes (require admin authentication via JWT)
router.get('/api/users', adminAuth, adminController.getAllUsers);
router.post('/api/reset-password', adminAuth, adminController.apiResetUserPassword);

// Settings API routes
router.get('/api/settings', adminController.getSettings); // Public read
router.post('/api/settings', adminAuth, adminController.updateSettings); // Admin only

module.exports = router;
