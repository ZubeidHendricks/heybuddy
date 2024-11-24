// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebRTCServer } = require('./webrtc');
const authRoutes = require('./routes/auth');
const shopifyRoutes = require('./routes/shopify');

app.use('/api/auth', authRoutes);
app.use('/api/shop', shopifyRoutes);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Store active shopping sessions
const activeSessions = new Map();

// Session management
class ShoppingSession {
  constructor(id, hostId) {
    this.id = id;
    this.hostId = hostId;
    this.participants = new Map();
    this.currentView = null;
    this.cursors = new Map();
  }

  addParticipant(userId, userData) {
    this.participants.set(userId, {
      ...userData,
      joinedAt: Date.now()
    });
  }

  removeParticipant(userId) {
    this.participants.delete(userId);
    this.cursors.delete(userId);
  }

  updateCursor(userId, position) {
    this.cursors.set(userId, position);
  }

  updateView(view) {
    this.currentView = view;
  }

  getSessionState() {
    return {
      id: this.id,
      hostId: this.hostId,
      participants: Array.from(this.participants.entries()),
      cursors: Array.from(this.cursors.entries()),
      currentView: this.currentView
    };
  }
}

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Create new shopping session
  socket.on('create_session', ({ userId, userName }) => {
    const sessionId = generateSessionId();
    const session = new ShoppingSession(sessionId, socket.id);
    session.addParticipant(socket.id, { userId, userName, isHost: true });
    activeSessions.set(sessionId, session);
    
    socket.join(sessionId);
    socket.emit('session_created', { sessionId, state: session.getSessionState() });
  });

  // Join existing session
  socket.on('join_session', ({ sessionId, userId, userName }) => {
    const session = activeSessions.get(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    session.addParticipant(socket.id, { userId, userName, isHost: false });
    socket.join(sessionId);
    
    // Notify all participants
    io.to(sessionId).emit('participant_joined', {
      userId,
      userName,
      state: session.getSessionState()
    });

    // Initialize WebRTC connection
    WebRTCServer.initializeConnection(socket, sessionId);
  });

  // Update cursor position
  socket.on('cursor_move', ({ sessionId, position }) => {
    const session = activeSessions.get(sessionId);
    if (session) {
      session.updateCursor(socket.id, position);
      socket.to(sessionId).emit('cursor_updated', {
        userId: socket.id,
        position
      });
    }
  });

  // Sync view state
  socket.on('sync_view', ({ sessionId, view }) => {
    const session = activeSessions.get(sessionId);
    if (session && session.hostId === socket.id) {
      session.updateView(view);
      socket.to(sessionId).emit('view_updated', { view });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    for (const [sessionId, session] of activeSessions.entries()) {
      if (session.participants.has(socket.id)) {
        session.removeParticipant(socket.id);
        
        // If host disconnected, end session
        if (session.hostId === socket.id) {
          io.to(sessionId).emit('session_ended', { reason: 'Host disconnected' });
          activeSessions.delete(sessionId);
        } else {
          // Notify others of participant leaving
          io.to(sessionId).emit('participant_left', {
            userId: socket.id,
            state: session.getSessionState()
          });
        }
        break;
      }
    }
  });
});

// Helper function to generate session ID
function generateSessionId() {
  return 'SHOP-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});