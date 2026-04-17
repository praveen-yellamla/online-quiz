require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const superAdminRoutes = require('./routes/superAdmin');
const studentRoutes = require('./routes/student');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Attach io to request object for easy access in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(morgan('dev'));

app.get('/api/test', (req, res) => {
  res.json({ message: "Backend working" });
});

const path = require('path');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/student', studentRoutes);

// Static Asset Management (Enables unified hosting on Render)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Deep Linking Support: Redirects all non-API routes to the React SPA entry point
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`CGS Quiz Platform Backend running on port ${PORT}`);
});

// Socket logic
io.on('connection', (socket) => {
  console.log('Real-time node connected:', socket.id);

  socket.on('join_track', ({ language, role }) => {
    if (role === 'super_admin') {
      socket.join('global_oversight');
      console.log(`Node ${socket.id} joined GLOBAL OVERSIGHT`);
    } else if (language) {
      const room = `track_${language.toLowerCase()}`;
      socket.join(room);
      console.log(`Node ${socket.id} joined ${room}`);
    }
  });

  socket.on('disconnect', () => console.log('Node disconnected:', socket.id));
});

// Added a heartbeat to keep the event loop active (Solves unexpected process exits)
setInterval(() => {}, 60000);
