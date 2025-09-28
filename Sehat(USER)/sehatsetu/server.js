const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  
  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Store active rooms and connections
  const activeRooms = new Map();
  const userSockets = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('join-room', (data) => {
      const { roomId, userId, userName, role } = data;
      
      console.log(`User ${userId} (${userName}) joining room ${roomId} as ${role}`);
      
      // Store user socket mapping
      userSockets.set(userId, socket.id);
      
      // Join socket room
      socket.join(roomId);
      
      // Initialize room if it doesn't exist
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, {
          id: roomId,
          participants: new Map()
        });
      }
      
      const room = activeRooms.get(roomId);
      room.participants.set(userId, {
        id: userId,
        name: userName,
        role: role,
        socketId: socket.id
      });
      
      // Notify user they joined successfully
      socket.emit('room-joined', {
        roomId,
        userId,
        role,
        participants: Array.from(room.participants.values())
      });
      
      // Notify other participants
      socket.to(roomId).emit('user-joined', {
        userId,
        userName,
        role
      });
    });

    // WebRTC signaling
    socket.on('offer', (data) => {
      const { roomId, offer, targetUserId } = data;
      const targetSocket = userSockets.get(targetUserId);
      if (targetSocket) {
        io.to(targetSocket).emit('offer', {
          offer,
          fromUserId: data.fromUserId
        });
      }
    });

    socket.on('answer', (data) => {
      const { roomId, answer, targetUserId } = data;
      const targetSocket = userSockets.get(targetUserId);
      if (targetSocket) {
        io.to(targetSocket).emit('answer', {
          answer,
          fromUserId: data.fromUserId
        });
      }
    });

    socket.on('ice-candidate', (data) => {
      const { roomId, candidate, targetUserId } = data;
      const targetSocket = userSockets.get(targetUserId);
      if (targetSocket) {
        io.to(targetSocket).emit('ice-candidate', {
          candidate,
          fromUserId: data.fromUserId
        });
      }
    });

    // Call controls
    socket.on('toggle-mute', (data) => {
      const { roomId, userId, isMuted } = data;
      socket.to(roomId).emit('user-muted', {
        userId,
        isMuted
      });
    });

    socket.on('toggle-video', (data) => {
      const { roomId, userId, isVideoOn } = data;
      socket.to(roomId).emit('user-video-toggled', {
        userId,
        isVideoOn
      });
    });

    socket.on('end-call', (data) => {
      const { roomId, userId } = data;
      socket.to(roomId).emit('call-ended', {
        endedBy: userId
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Find and remove user from rooms
      for (const [roomId, room] of activeRooms.entries()) {
        for (const [userId, participant] of room.participants.entries()) {
          if (participant.socketId === socket.id) {
            room.participants.delete(userId);
            userSockets.delete(userId);
            
            // Notify other participants
            socket.to(roomId).emit('user-left', {
              userId,
              userName: participant.name
            });
            
            // Clean up empty rooms
            if (room.participants.size === 0) {
              activeRooms.delete(roomId);
            }
            break;
          }
        }
      }
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
