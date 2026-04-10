// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const { createServer } = require('http');
// const { Server } = require('socket.io');

// const authRoutes = require('./routes/auth');
// const agentRoutes = require('./routes/agent');
// const profileRoutes = require('./routes/profile');
// const dashboardRoutes = require('./routes/dashboard');

// const app = express();
// const httpServer = createServer(app);
// const io = new Server(httpServer, {
//   cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
// });

// app.use(helmet({ contentSecurityPolicy: false }));
// app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
// app.use(morgan('dev'));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
// app.use('/api/', limiter);

// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);
//   socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
// });
// app.set('io', io);

// app.use('/api/auth', authRoutes);
// app.use('/api/agent', agentRoutes);
// app.use('/api/profile', profileRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// app.get('/api/health', (req, res) => res.json({ status: 'PlaCIQ 2.0 Operational', version: '2.0.0', timestamp: new Date() }));

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: err.message || 'Internal Server Error' });
// });

// const MONGO_URI = process.env.MONGO_URI || '';
// const PORT = process.env.PORT || 5000;

// if (MONGO_URI) {
//   mongoose.connect(MONGO_URI)
//     .then(() => {
//       console.log('✅ MongoDB Atlas connected');
//       httpServer.listen(PORT, () => console.log(`🚀 PlaCIQ 2.0 running on port ${PORT}`));
//     })
//     .catch(err => {
//       console.error('MongoDB error:', err.message);
//       httpServer.listen(PORT, () => console.log(`🚀 PlaCIQ 2.0 running on port ${PORT} (no DB)`));
//     });
// } else {
//   httpServer.listen(PORT, () => console.log(`🚀 PlaCIQ 2.0 running on port ${PORT}`));
// }

// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const { createServer } = require('http');
// const { Server } = require('socket.io');

// const authRoutes = require('./routes/auth');
// const agentRoutes = require('./routes/agent');
// const profileRoutes = require('./routes/profile');
// const dashboardRoutes = require('./routes/dashboard');

// const app = express();
// const httpServer = createServer(app);

// // 1. FIX: Trust Render's proxy to prevent Rate Limit ValidationErrors
// app.set('trust proxy', 1);

// // 2. Setup Socket.io with proper CORS
// const io = new Server(httpServer, {
//   cors: { 
//     origin: process.env.FRONTEND_URL || 'https://placiq-frontend.onrender.com', 
//     methods: ['GET', 'POST'],
//     credentials: true
//   }
// });

// // 3. Middleware
// app.use(helmet({ contentSecurityPolicy: false }));
// app.use(cors({ 
//   origin: process.env.FRONTEND_URL || 'https://placiq-frontend.onrender.com', 
//   credentials: true 
// }));
// app.use(morgan('dev'));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// // 4. Rate Limiting (Now works correctly behind proxy)
// const limiter = rateLimit({ 
//   windowMs: 15 * 60 * 1000, 
//   max: 200,
//   standardHeaders: true,
//   legacyHeaders: false
// });
// app.use('/api/', limiter);

// // 5. Socket Logic
// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);
//   socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
// });
// app.set('io', io);

// // 6. Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/agent', agentRoutes);
// app.use('/api/profile', profileRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// // Health Check
// app.get('/api/health', (req, res) => res.json({ 
//   status: 'PlaCIQ 2.0 Operational', 
//   version: '2.0.0', 
//   timestamp: new Date() 
// }));

// // Error Handling
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: err.message || 'Internal Server Error' });
// });

// // 7. Server & Database Connection
// const MONGO_URI = process.env.MONGO_URI || '';
// const PORT = process.env.PORT || 10000; // Default to Render's preferred port

// if (MONGO_URI) {
//   mongoose.connect(MONGO_URI)
//     .then(() => {
//       console.log('✅ MongoDB Atlas connected');
//       httpServer.listen(PORT, () => console.log(`🚀 PlaCIQ 2.0 running on port ${PORT}`));
//     })
//     .catch(err => {
//       console.error('MongoDB error:', err.message);
//       httpServer.listen(PORT, () => console.log(`🚀 PlaCIQ 2.0 running on port ${PORT} (no DB)`));
//     });
// } else {
//   httpServer.listen(PORT, () => console.log(`🚀 PlaCIQ 2.0 running on port ${PORT}`));
// }

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agent');
const profileRoutes = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const httpServer = createServer(app);

// 1. Render/Proxy Setup
app.set('trust proxy', 1);

// 2. Socket.io Configuration
const io = new Server(httpServer, {
  cors: { 
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173'], // Allow Local + Prod
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 3. Security & Global Middleware
app.use(helmet({ 
  contentSecurityPolicy: false, // Required for some AI script executions
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
  credentials: true 
}));

app.use(morgan('dev'));
// Increase limits for Resume Buffers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// 4. Rate Limiting (Applied specifically to API)
const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 300, // Slightly increased for 2026 agent-heavy traffic
  message: { error: "Too many requests, please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// 5. Socket Logic & Global Access
io.on('connection', (socket) => {
  console.log('⚡ AI Sync Connected:', socket.id);
  socket.on('disconnect', () => console.log('❌ AI Sync Disconnected'));
});
app.set('io', io);

// 6. Routes
app.use('/api/auth', authRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Enhanced Health Check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ 
    status: 'Operational', 
    services: { api: 'OK', database: dbStatus },
    version: '2.0.0', 
    timestamp: new Date() 
  });
});

// 7. Robust Error Handling
app.use((err, req, res, next) => {
  // If the error is a Multer error (File too large)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Max limit is 5MB.' });
  }
  console.error('🔥 Server Error:', err.message);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error',
    path: req.path
  });
});

// 8. DB Connection & Boot
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 10000;

const startServer = () => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 PlaCIQ 2.0 running on port ${PORT}`);
  });
};

if (MONGO_URI) {
  mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000 // Stop waiting after 5s
  })
    .then(() => {
      console.log('✅ MongoDB Atlas Linked');
      startServer();
    })
    .catch(err => {
      console.error('❌ MongoDB Connection Failure:', err.message);
      console.log('⚠️ Entering Degraded Mode (No DB)');
      startServer();
    });
} else {
  console.warn('⚠️ No MONGO_URI found in .env');
  startServer();
}