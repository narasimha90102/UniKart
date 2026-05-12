const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Resend } = require('resend');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Connect to database
connectDB(); // Uncomment when valid MONGO_URI is added to .env

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: false
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

require('./config/socket')(io); // Mount socket logic

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// Enable CORS for all origins in development
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: false
}));

// Rate limiting (Disabled for local development to prevent 429 errors)
// const limiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 mins
//   max: 100 // 100 requests per 10 mins
// });
// app.use(limiter);

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const User = require('./models/User');

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to DB
    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "UniKart OTP Verification",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #1B8C50; text-align: center;">UniKart Verification</h2>
          <p>Hello,</p>
          <p>Your student verification code is:</p>
          <div style="background: #f9f9f9; padding: 20px; font-size: 32px; font-weight: 900; letter-spacing: 10px; text-align: center; border-radius: 8px; color: #1B8C50; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #666; text-align: center;">This code will expire in 10 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 11px; color: #999; text-align: center;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({
      success: true,
      message: process.env.NODE_ENV === 'development' 
        ? `OTP sent successfully (Dev Mode: Use ${otp})` 
        : "OTP sent successfully",
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('OTP Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});



// Root route
app.get('/', (req, res) => {
  res.send('UniKart API is running...');
});

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
