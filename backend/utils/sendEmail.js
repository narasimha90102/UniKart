const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email using Resend
 * @param {Object} options - Email options (email, subject, message, html)
 */
const sendEmail = async (options) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.FROM_NAME || 'UniKart'} <onboarding@resend.dev>`,
      to: options.email,
      subject: options.subject,
      text: options.message || '',
      html: options.html,
    });

    if (error) {
      console.error('[Resend Error]:', error);
      throw new Error(error.message);
    }

    console.log('[Resend Success]: Email sent successfully', data.id);
    return data;
  } catch (error) {
    console.error('[Resend Exception]:', error.message);
    throw error;
  }
};

module.exports = sendEmail;
