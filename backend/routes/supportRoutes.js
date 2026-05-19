const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Submit a support / contact form message
// @route   POST /api/support/contact
// @access  Private
router.post('/contact', protect, async (req, res) => {
  const { category, subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ success: false, message: 'Subject and message are required.' });
  }
  // TODO: Integrate with Resend / email service to forward to support@unikart.in
  console.log(`[SUPPORT] Category: ${category} | Subject: ${subject} | User: ${req.user?.id}`);
  res.json({ success: true, message: 'Your message has been received. We will respond within 24 hours.' });
});

// @desc    Submit a report
// @route   POST /api/support/report
// @access  Private
router.post('/report', protect, async (req, res) => {
  const { category, message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Description is required.' });
  }
  console.log(`[REPORT] Type: ${category} | User: ${req.user?.id}`);
  res.json({ success: true, message: 'Report submitted. Our team will review it within 24 hours.' });
});

module.exports = router;
