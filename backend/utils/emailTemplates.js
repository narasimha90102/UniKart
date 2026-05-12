/**
 * UniKart Branded Email Templates
 */

const colors = {
  primary: '#1B8C50',
  primaryLight: '#f0fdf4',
  text: '#1a1a1a',
  textMuted: '#666666',
  white: '#ffffff',
  bg: '#f5fbf7'
};

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UniKart</title>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: ${colors.text}; background-color: ${colors.bg}; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: ${colors.white}; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .header { background: ${colors.primary}; padding: 40px 20px; text-align: center; }
    .logo { width: 150px; height: auto; }
    .content { padding: 40px; }
    .footer { padding: 30px; text-align: center; font-size: 12px; color: ${colors.textMuted}; background: #fafafa; }
    .button { display: inline-block; padding: 16px 32px; background-color: ${colors.primary}; color: ${colors.white} !important; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0; }
    .otp-card { background: ${colors.primaryLight}; border: 2px dashed ${colors.primary}; border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center; }
    .otp-code { font-size: 42px; font-weight: 900; letter-spacing: 10px; color: ${colors.primary}; margin: 0; }
    h1 { font-size: 24px; font-weight: 800; margin-bottom: 20px; tracking: -0.5px; }
    p { margin-bottom: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://unikart.vercel.app/logo.png" alt="UniKart" class="logo">
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>UniKart Campus Marketplace</strong></p>
      <p>Connecting verified students safely.</p>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
        <p>&copy; 2024 UniKart. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

exports.otpTemplate = (otp) => baseTemplate(`
  <h1>Verify your email</h1>
  <p>Hello Student,</p>
  <p>Thank you for joining UniKart! To complete your registration and verify your campus identity, please use the following one-time password (OTP):</p>
  <div class="otp-card">
    <p style="text-transform: uppercase; font-size: 10px; font-weight: 800; color: ${colors.primary}; margin-bottom: 10px; letter-spacing: 2px;">Your Verification Code</p>
    <h2 class="otp-code">${otp}</h2>
  </div>
  <p style="font-size: 13px; color: ${colors.textMuted};">This code is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
`);

exports.welcomeTemplate = (name) => baseTemplate(`
  <h1>Welcome to the Community, ${name}!</h1>
  <p>Your account has been successfully verified and approved by the campus administrator.</p>
  <p>You can now start listing your items, browsing deals from other students, and chatting securely within our community.</p>
  <div style="text-align: center;">
    <a href="https://unikart.vercel.app/login" class="button">Start Exploring</a>
  </div>
  <p>Happy trading!</p>
`);

exports.approvalPendingTemplate = () => baseTemplate(`
  <h1>Almost there!</h1>
  <p>Your email has been successfully verified.</p>
  <p>Your registration is now being reviewed by our <strong>Campus Administrators</strong> to ensure the safety and integrity of our student-only marketplace.</p>
  <p>This process usually takes less than 24 hours. We will send you another email as soon as your account is activated.</p>
  <p>Thank you for your patience!</p>
`);

exports.passwordResetTemplate = (otp) => baseTemplate(`
  <h1>Reset your password</h1>
  <p>We received a request to reset the password for your UniKart account.</p>
  <p>Use the following secure OTP to proceed with your password reset:</p>
  <div class="otp-card" style="border-color: #666; background: #f4f4f4;">
    <p style="text-transform: uppercase; font-size: 10px; font-weight: 800; color: #666; margin-bottom: 10px; letter-spacing: 2px;">Password Reset Code</p>
    <h2 class="otp-code" style="color: #333;">${otp}</h2>
  </div>
  <p style="font-size: 13px; color: ${colors.textMuted};">This code is valid for 10 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
`);
