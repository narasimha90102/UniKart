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
  origin: '*', // Allow all origins for development (Vite binds to network IP usually)
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
app.use('/api/support', require('./routes/supportRoutes'));



// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) =>
    res.sendFile(
      path.resolve(__dirname, '../', 'frontend', 'dist', 'index.html')
    )
  );
} else {
  // Root route for development
  app.get('/', (req, res) => {
    res.send('UniKart API is running...');
  });
}

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
