const usersInRooms = {}; 
const socketToRoom = {}; 

export default function webrtcHandler(io, socket) {
  socket.on('join-call', (roomID) => {
    if (usersInRooms[roomID]) {
      if (usersInRooms[roomID].length >= 6) {
        socket.emit('room-full');
        return;
      }
      usersInRooms[roomID].push(socket.id);
    } else {
      usersInRooms[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;

    const usersInThisRoom = usersInRooms[roomID].filter((id) => id !== socket.id);
    socket.emit('all-users', usersInThisRoom);
  });

  socket.on('send-offer', (payload) => {
    io.to(payload.userToSignal).emit('user-joined', {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });

  socket.on('returning-signal', (payload) => {
    io.to(payload.callerID).emit('receiving-returned-signal', {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on('send-ice-candidate', (payload) => {
    io.to(payload.target).emit('receive-ice-candidate', {
      candidate: payload.candidate,
      sender: socket.id,
    });
  });

  const handleDisconnect = () => {
    const roomID = socketToRoom[socket.id];
    if (roomID) {
      let room = usersInRooms[roomID];
      if (room) {
        usersInRooms[roomID] = room.filter((id) => id !== socket.id);
      }
      socket.broadcast.to(roomID).emit('user-disconnected', socket.id);
      delete socketToRoom[socket.id];
    }

  };

  socket.on('leave-call', handleDisconnect);
  socket.on('disconnect', handleDisconnect);
}
