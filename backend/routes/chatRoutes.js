const express = require('express');
const {
  getConversations,
  getHistory,
  markChatAsRead,
  getUnreadCount,
  deleteMessage,
  deleteConversation,
  updateOrderRequest,
  sendMessage
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/send', sendMessage);
router.get('/conversations', getConversations);
router.get('/history/:room', getHistory);
router.get('/unread-count', getUnreadCount);
router.put('/mark-read/:otherUserId', markChatAsRead);
router.put('/order-request/:messageId', updateOrderRequest);
router.delete('/message/:id', deleteMessage);
router.delete('/conversation/:otherUserId', deleteConversation);

module.exports = router;
