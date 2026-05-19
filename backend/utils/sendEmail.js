const nodemailer = require('nodemailer');

/**
 * Send email using Nodemailer with Gmail SMTP
 * @param {Object} options - Email options (email, subject, message, html)
 */
const sendEmail = async (options) => {
  try {
    console.log(`[Nodemailer] Preparing to dispatch email to: ${options.email}`);
    
    // 1. Verify environment credentials
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.warn('[Nodemailer Warning] SMTP_EMAIL or SMTP_PASSWORD is not set in environment variables. Falling back to debug log mode.');
      console.log(`[SMTP Debug Output] Send to: ${options.email}\nSubject: ${options.subject}\nText: ${options.message}`);
      // For development, we return a mock successful delivery if credentials aren't set
      return { messageId: 'mock-debug-id-' + Date.now() };
    }

    // 2. Configure Gmail SMTP Transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,     // Your Gmail Address
        pass: process.env.SMTP_PASSWORD  // Your 16-character Gmail App Password
      }
    });

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'UniKart'}" <${process.env.SMTP_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message || '',
      html: options.html
    };

    console.log('[Nodemailer] Handshaking with Gmail SMTP...');
    const info = await transporter.sendMail(mailOptions);
    console.log('[Nodemailer Success] Message dispatched successfully! Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('[Nodemailer Exception] SMTP transaction aborted:', error.message);
    throw new Error(`Email delivery aborted: ${error.message}`);
  }
};

module.exports = sendEmail;
