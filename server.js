const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Stockage des paires d'identifiants de socket et de room
const socketToRoom = {};

io.on('connection', socket => {
  socket.on('joinRoom', (roomId, userId) => {
    socket.join(roomId);
    socketToRoom[socket.id] = roomId;
    socket.emit('joined', roomId, userId);
  });

  socket.on('disconnect', () => {
    const roomId = socketToRoom[socket.id];
    if (roomId) {
      socket.to(roomId).emit('userLeft', socket.id);
      delete socketToRoom[socket.id];
    }
  });

  socket.on('offer', (offer, targetUserId) => {
    io.to(targetUserId).emit('offer', offer, socket.id);
  });

  socket.on('answer', (answer, targetUserId) => {
    io.to(targetUserId).emit('answer', answer, socket.id);
  });

  socket.on('iceCandidate', (candidate, targetUserId) => {
    io.to(targetUserId).emit('iceCandidate', candidate, socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
