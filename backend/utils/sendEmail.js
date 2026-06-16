const nodemailer = require('nodemailer');

/**
 * sendEmail — Brevo SMTP PRIMARY, Resend SDK FALLBACK (only if RESEND_API_KEY set)
 *
 * CRITICAL: RESEND_TEST_EMAIL redirect logic is intentionally REMOVED.
 * Emails ALWAYS go to options.email (the requesting user), never to admin.
 *
 * @param {Object} options - { email, subject, message, html }
 */
const sendEmail = async (options) => {
  const toEmail   = options.email;
  const fromEmail = process.env.FROM_EMAIL || 'noreplyunikart@gmail.com';
  const fromName  = process.env.FROM_NAME  || 'UniKart';

  // ── Runtime config dump ───────────────────────────────────────────────────
  console.log('\n=== EMAIL DISPATCH STARTED ===');
  console.log(`Recipient   : ${toEmail}`);
  console.log(`Sender      : "${fromName}" <${fromEmail}>`);
  console.log(`Subject     : ${options.subject}`);
  console.log(`SMTP_HOST   : ${process.env.SMTP_HOST   || 'NOT SET'}`);
  console.log(`SMTP_PORT   : ${process.env.SMTP_PORT   || 'NOT SET'}`);
  console.log(`SMTP_EMAIL  : ${process.env.SMTP_EMAIL  || 'NOT SET'}`);
  console.log(`SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? '[CONFIGURED]' : 'NOT SET'}`);
  console.log(`FROM_EMAIL  : ${process.env.FROM_EMAIL  || 'NOT SET'}`);

  // ── 1. PRIMARY: Brevo SMTP via Nodemailer ─────────────────────────────────
  if (process.env.SMTP_HOST && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
    const port   = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = port === 465;

    console.log(`\n[SMTP] Connecting to ${process.env.SMTP_HOST}:${port} (secure=${secure})...`);

    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });

    try {
      console.log('[SMTP] Running transporter.verify()...');
      await transporter.verify();
      console.log('[SMTP] Connected successfully.');
      console.log('[SMTP] Authentication successful.');
    } catch (verifyErr) {
      console.error(`[SMTP] Connection/Auth FAILED: ${verifyErr.message}`);
      console.error('[SMTP] Full verify error:', verifyErr.stack || verifyErr);
      // Fall through to Resend
      return await sendViaResendFallback(toEmail, fromEmail, fromName, options);
    }

    try {
      console.log(`[SMTP] Sending email to recipient: ${toEmail}`);
      const mailOptions = {
        from:    `"${fromName}" <${fromEmail}>`,
        to:      toEmail,
        subject: options.subject,
        text:    options.message || '',
        html:    options.html    || '',
      };
      console.log('[SMTP] Mail options:', JSON.stringify({ from: mailOptions.from, to: mailOptions.to, subject: mailOptions.subject }));

      const info = await transporter.sendMail(mailOptions);

      console.log(`[SMTP] Email sent SUCCESSFULLY to: ${toEmail}`);
      console.log(`[SMTP] SMTP Response: ${JSON.stringify(info.response)}`);
      console.log(`[SMTP] Message ID: ${info.messageId}`);
      console.log('=== EMAIL DISPATCH COMPLETE (via Brevo SMTP) ===\n');
      return info;

    } catch (sendErr) {
      console.error(`[SMTP] Send FAILED to ${toEmail}: ${sendErr.message}`);
      console.error('[SMTP] Full send error:', sendErr.stack || sendErr);
      // Fall through to Resend
    }
  } else {
    console.warn('[SMTP] Skipping — SMTP_HOST / SMTP_EMAIL / SMTP_PASSWORD not all set.');
  }

  // ── 2. FALLBACK: Resend SDK ───────────────────────────────────────────────
  return await sendViaResendFallback(toEmail, fromEmail, fromName, options);
};

/**
 * Resend SDK fallback — sends directly to toEmail.
 * NOTE: Resend free tier ONLY delivers to the verified account owner.
 *       On sandbox accounts this will fail for third-party recipients.
 *       There is NO RESEND_TEST_EMAIL redirect — email goes to toEmail.
 */
const sendViaResendFallback = async (toEmail, fromEmail, fromName, options) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('[sendEmail] All email providers exhausted — no credentials configured.');
  }

  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log(`\n[Resend] Attempting delivery to: ${toEmail}`);

    const { data, error } = await resend.emails.send({
      from:    `${fromName} <onboarding@resend.dev>`,
      to:      [toEmail],   // ← Always the requesting user, never admin
      subject: options.subject,
      text:    options.message || '',
      html:    options.html    || '',
    });

    if (error) {
      console.error('[Resend] Delivery FAILED:', JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Resend delivery failed');
    }

    console.log(`[Resend] Email sent SUCCESSFULLY to: ${toEmail}`);
    console.log('[Resend] Response:', JSON.stringify(data));
    console.log('=== EMAIL DISPATCH COMPLETE (via Resend) ===\n');
    return data;

  } catch (err) {
    console.error('[Resend] Exception:', err.message);
    throw err;
  }
};

module.exports = sendEmail;
