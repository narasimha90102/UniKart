const Message = require('../models/Message');
const Notification = require('../models/Notification');

/**
 * Automatically creates and broadcasts a review request to the buyer
 * through User Notifications, User Chat, and Order payload.
 * 
 * @param {Object} order - The completed Order mongoose document
 */
exports.sendReviewRequest = async (order) => {
  try {
    const buyerId = order.user.toString();
    const sellerId = order.seller.toString();
    const productId = order.product.toString();
    const orderId = order._id.toString();

    // 1. Send review request through User Notifications
    const notification = await Notification.create({
      user: buyerId,
      title: 'Delivered successfully',
      message: 'Your order has been delivered successfully. Please rate and review this product.',
      type: 'order',
      senderId: sellerId,
      senderName: 'UniKart System',
      orderId: order._id,
      productId: order.product
    });

    // 2. Send review request through User Chat
    const room = [buyerId, sellerId].sort().join('-');
    
    // Prevent duplicate review request messages in chat for the same order
    const existingMsg = await Message.findOne({
      isReviewRequest: true,
      reviewOrderId: order._id
    });

    if (!existingMsg) {
      const chatMsg = await Message.create({
        sender: sellerId, // Seller sends request to buyer
        receiver: buyerId,
        content: 'Your order has been delivered successfully. Please rate and review this product.',
        room,
        isReviewRequest: true,
        reviewOrderId: order._id,
        orderProduct: order.product,
        orderStatus: 'accepted'
      });

      // 3. Real-time broadcasts if global.io socket instance is available
      if (global.io) {
        const payload = {
          _id: chatMsg._id,
          senderId: sellerId,
          receiverId: buyerId,
          senderName: 'UniKart System',
          content: chatMsg.content,
          room,
          read: false,
          createdAt: chatMsg.createdAt,
          isReviewRequest: true,
          reviewOrderId: orderId,
          orderProduct: order.product,
          orderStatus: 'accepted'
        };
        // Emit to chat room
        global.io.to(room).emit('receive_message', payload);
        
        // Emit to buyer's private channel
        global.io.to(buyerId).emit('new_notification', notification);
      }
    }
    
    console.log(`[ReviewHelper] Review request auto-sent successfully for Order: ${orderId}`);
  } catch (err) {
    console.error('[ReviewHelper] Error sending review request:', err);
  }
};
