const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    console.log(`User ${socket.id} joining room ${roomId}`);
    
    // Leave any previous rooms
    if (socket.roomId) {
      socket.leave(socket.roomId);
    }
    
    // Join the new room
    socket.join(roomId);
    socket.roomId = roomId;
    
    // Track room participants
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);
    
    // Notify other users in the room
    socket.to(roomId).emit('user-joined', socket.id);
    
    console.log(`User ${socket.id} joined room ${roomId}`);
    console.log(`Room ${roomId} now has ${rooms.get(roomId).size} participants`);
  });

  socket.on('offer', (offer) => {
    console.log(`Offer from ${socket.id}`);
    socket.to(socket.roomId).emit('offer', offer);
  });

  socket.on('answer', (answer) => {
    console.log(`Answer from ${socket.id}`);
    socket.to(socket.roomId).emit('answer', answer);
  });

  socket.on('ice-candidate', (candidate) => {
    console.log(`ICE candidate from ${socket.id}`);
    socket.to(socket.roomId).emit('ice-candidate', candidate);
  });

  socket.on('leave-room', () => {
    if (socket.roomId) {
      console.log(`User ${socket.id} leaving room ${socket.roomId}`);
      
      // Remove from room tracking
      if (rooms.has(socket.roomId)) {
        rooms.get(socket.roomId).delete(socket.id);
        
        // Clean up empty rooms
        if (rooms.get(socket.roomId).size === 0) {
          rooms.delete(socket.roomId);
        }
      }
      
      // Notify other users
      socket.to(socket.roomId).emit('user-left', socket.id);
      socket.leave(socket.roomId);
      
      console.log(`User ${socket.id} left room ${socket.roomId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.roomId) {
      // Remove from room tracking
      if (rooms.has(socket.roomId)) {
        rooms.get(socket.roomId).delete(socket.id);
        
        // Clean up empty rooms
        if (rooms.get(socket.roomId).size === 0) {
          rooms.delete(socket.roomId);
        }
      }
      
      // Notify other users
      socket.to(socket.roomId).emit('user-left', socket.id);
      
      console.log(`User ${socket.id} disconnected from room ${socket.roomId}`);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Server ready for video calls`);
});
