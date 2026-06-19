const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const compression = require('compression');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Determine allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://10.169.56.55:5173',
  'http://192.168.238.1:5173',
  'http://172.25.163.6:5173',
  'https://unikart-campus.vercel.app',
  'https://unikart-app.loca.lt',
  process.env.CLIENT_URL,
].filter(Boolean);

// In production with tunnel, allow all origins temporarily
const corsOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.loca.lt') || origin.includes('localhost')) {
    callback(null, true);
  } else {
    callback(null, true); // Allow all for local dev tunnel access
  }
};


// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: false
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.set('io', io);

require('./config/socket')(io); // Mount socket logic

// Body parser
app.use(express.json());

// Enable response compression (gzip)
app.use(compression());

// Dev logging middleware
if (process.env.NODE_ENV !== 'production' && process.env.LOAD_TESTING !== 'true') {
  app.use(morgan('dev'));
}

// Security headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// Enable CORS
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

// Rate limiting (enabled in production)
if (process.env.NODE_ENV === 'production' && process.env.LOAD_TESTING !== 'true') {
  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 200 // 200 requests per 10 mins
  });
  app.use(limiter);
}

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  const fs = require('fs');

  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    app.get('*', (req, res) =>
      res.sendFile(path.resolve(frontendPath, 'index.html'))
    );
  } else {
    console.warn('[Server] Frontend dist not found at:', frontendPath);
    app.get('/', (req, res) => {
      res.json({ message: 'UniKart API is running (production mode, frontend served separately)' });
    });
  }
} else {
  // Root route for development
  app.get('/', (req, res) => {
    res.send('UniKart API is running...');
  });
}

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections (prevents silent crashes)
process.on('unhandledRejection', (err) => {
  console.error('[FATAL] Unhandled Promise Rejection:', err.message || err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err.message || err);
  process.exit(1);
});
