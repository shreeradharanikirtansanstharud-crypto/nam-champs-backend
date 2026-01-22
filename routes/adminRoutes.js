const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.post('/login', adminController.login);

// Protected routes (require admin authentication)
router.get('/users', adminAuth, adminController.getAllUsers);
router.post('/reset-password', adminAuth, adminController.resetUserPassword);

// Settings routes
router.get('/settings', adminController.getSettings); // Public read
router.post('/settings', adminAuth, adminController.updateSettings); // Admin only

module.exports = router;
