const express = require('express');
const router = express.Router();
const countController = require('../controllers/countController');
const auth = require('../middleware/auth');

// All routes are protected
router.post('/increment', auth, countController.incrementCount);
router.get('/today', auth, countController.getTodayCount);
router.post('/toggle-status', auth, countController.toggleCountingStatus);
router.post('/sync', auth, countController.syncCount);
router.get('/leaderboard', auth, countController.getLeaderboard);

module.exports = router;
