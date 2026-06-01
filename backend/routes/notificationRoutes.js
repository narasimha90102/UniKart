const express = require('express');
const { getNotifications, markRead, clearNotifications, markSingleRead, deleteSingleNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/mark-read', markRead);
router.put('/:id/mark-read', markSingleRead);
router.delete('/', clearNotifications);
router.delete('/:id', deleteSingleNotification);

module.exports = router;
