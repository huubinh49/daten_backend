const socket = require("socket.io");

class Socket {
  constructor() {
    this.io = null;
    this.userSocketIDMapper = {}; // userID - socketID
  }

  init(httpServer) {

    this.io = socket(httpServer, {
      cors: {
        origins: JSON.parse(process.env.SOCKET_ORIGINS)
      }
    });
    console.log('Socket is ready!')

    this.io.on("connection", (socket) => {

      //take userId and socketId from user
      socket.on("add-user", (payload) => {
        this.userSocketIDMapper[payload.userId] = socket.id;
      });

      socket.on("send-message", (message) => {
        const recipientSocketId = this.userSocketIDMapper[message.recipientId];
        const senderSocketId = this.userSocketIDMapper[message.senderId];
        try {
          if (recipientSocketId)
            this.io.to(recipientSocketId).emit("new-message", message);
          if (senderSocketId)
            this.io.to(senderSocketId).emit("new-message", message);
        } catch (error) {
          console.log(error)
        }
      });

      socket.on("disconnect", () => {
        this.userSocketIDMapper.remove(socket.id);
      });
    });
    return this.io;
  }

  sendToUser(userId, event, payload) {
    try {
      const socketId = this.userSocketIDMapper[userId];
      if (socketId) {
        this.io.to(socketId).emit(event, payload)
      }
    } catch (error) {
      console.log(error)
    }
  }
}

class CallableSocket extends Socket {

  constructor() {
    super();
    this.roomUserIdsMapper = {}; // roomID - [userIDs]
    this.socketRoomIDMapper = {}; // socketID - roomID
  }

  init(httpServer) {
    super.init(httpServer);
    this.io.on("connection", (socket) => {
      const events = ['call-request', 'call-accepted', 'call-rejected', 'call-cancel']
      events.forEach(event => {
        socket.on(event, (payload) => {
          this.io.to(this.userSocketIDMapper[payload.toUID]).emit(event, payload);
        })
      })

      socket.on('join-room', (roomId, userDetails) => {
        // adding all user to a room so that we can broadcast messages
        socket.join(roomId);

        // adding user information to room
        if (this.roomUserIdsMapper[roomId]) {
          this.roomUserIdsMapper[roomId].push({
            socketId: socket.id,
            ...userDetails
          });
        } else {
          this.roomUserIdsMapper[roomId] = [{
            socketId: socket.id,
            ...userDetails
          }];
        }

        // specify which room this socket is in
        this.socketRoomIDMapper[socket.id] = roomId;
        const usersInRoom = this.roomUserIdsMapper[roomId].filter(
          (user) => user.socketId !== socket.id
        );

        // when a new user has joined, send the information of users who have already joined in room.
        socket.emit('users-present-in-room', usersInRoom);
      });

      socket.on('initiate-signal', (payload) => {
        const roomId = this.socketRoomIDMapper[socket.id];
        const room = this.roomUserIdsMapper[roomId];
        if (room) {
          const user = room.find((user) => user.socketId === socket.id);
          // when a peer wants to initiate signal, send the user information along with signal
          this.io.to(payload.userToSignal).emit('user-joined', {
            signal: payload.signal,
            callerId: payload.callerId,
            fullName: user.fullName
          });
        }

      });

      // once the peer acknowledge signal sends the acknowledgement back so that it can stream peer to peer.
      socket.on('ack-signal', (payload) => {
        this.io.to(payload.callerId).emit('signal-accepted', {
          signal: payload.signal,
          id: socket.id,
        });
      });


      socket.on("disconnect", () => {
        const roomId = this.socketRoomIDMapper[socket.id];
        if (roomId) {
          // Remove this user from room 
          let room = this.roomUserIdsMapper[roomId];
          if (room) {
            room = room.filter((user) => user.socketId !== socket.id);
            this.roomUserIdsMapper[roomId] = room;
          }
          socket.to(roomId).emit('user-disconnected', socket.id);
        }
      });
    });
  }
}


const socketServer = new CallableSocket()
module.exports = socketServer