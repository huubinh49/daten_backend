const socket = require("socket.io");

class IDManager {
  constructor() {
    this.ids = {};
  }
  add(userId, id) {
    this.ids[userId] = id;
  };

  remove(id) {
    for (let user in this.ids)
      if (this.ids[user] == id) {
        this.ids[user] = null;
        delete this.ids[user]
      }
  };

  get(userId) {
    return this.ids[userId];
  };
  get_reversed(id) {
    for (let user in this.ids)
      if (this.ids[user] == id) {
        return user;
      }
    return null;
  }
}
class Socket {
  constructor() {
    console.log("Initializing socket")
    this.io = null;
    this.UserSocket = new IDManager(); // userId - socketId
    this.users = {};
    this.socketRoomMap = {};
  }

  getPartnerPeerJS(peerid) {
    for (let peer of this.peers) {
      if (peerId == peer[0]) {
        return peer[1]
      }
      if (peerId == peer[1]) {
        return peer[0]
      }
    }
    return null;
  }
  init(httpServer) {

    this.io = socket(httpServer, {
      cors: {
        origins: ['http://localhost:3000']
      }
    });
    console.log('Socket is ready!')

    this.io.on("connection", (socket) => {
      //when connect
      console.log("A user connected.");

      //take userId and socketId from user
      socket.on("addUser", (payload) => {
        console.log("add user: ", this.UserSocket.ids)
        this.UserSocket.add(payload.userId, socket.id);
      });
      const events = ['call-request', 'accepted', 'rejected', 'cancel-call']
      events.forEach(event => {
        socket.on(event, (payload) => {
          this.io.to(this.UserSocket.get(payload.toUID)).emit(event, payload);
        })
      })

      socket.on('join-room', (roomId, userDetails) => {
        // adding all user to a room so that we can broadcast messages
        socket.join(roomId);
        console.log("a user joined room")
        // adding map users to room
        if (this.users[roomId]) {
          this.users[roomId].push({
            socketId: socket.id,
            ...userDetails
          });
        } else {
          this.users[roomId] = [{
            socketId: socket.id,
            ...userDetails
          }];
        }

        // adding map of socketid to room
        this.socketRoomMap[socket.id] = roomId;
        const usersInThisRoom = this.users[roomId].filter(
          (user) => user.socketId !== socket.id
        );

        // once a new user has joined sending the details of users who are already present in room.
        socket.emit('users-present-in-room', usersInThisRoom);
      });

      socket.on('initiate-signal', (payload) => {
        const roomId = this.socketRoomMap[socket.id];
        let room = this.users[roomId];
        let fullName = '';
        if (room) {
          const user = room.find((user) => user.socketId === socket.id);
          fullName = user.fullName;
        }

        // once a peer wants to initiate signal, To old user sending the user details along with signal
        this.io.to(payload.userToSignal).emit('user-joined', {
          signal: payload.signal,
          callerId: payload.callerId,
          fullName,
        });
      });

      // once the peer acknowledge signal sending the acknowledgement back so that it can stream peer to peer.
      socket.on('ack-signal', (payload) => {
        this.io.to(payload.callerId).emit('signal-accepted', {
          signal: payload.signal,
          id: socket.id,
        });
      });

      socket.on("sendMessage", (message) => {
        console.log("new message: ", message)
        const recipientSocket = this.UserSocket.get(message.recipientId);
        const senderSocket = this.UserSocket.get(message.senderId);
        try {
          if (recipientSocket)
            this.io.to(recipientSocket).emit("newMessage", message);
          if (senderSocket)
            this.io.to(senderSocket).emit("newMessage", message);
        } catch (error) {
          console.log(error)
        }
      });
      //when disconnect
      socket.on("disconnect", () => {
        const roomId = this.socketRoomMap[socket.id];
        if (roomId) {
          console.log("a call disconnected!");
          // Remove this user from room 
          let room = this.users[roomId];
          if (room) {
            room = room.filter((user) => user.socketId !== socket.id);
            this.users[roomId] = room;
          }
          socket.to(roomId).emit('user-disconnected', socket.id);
        } else {
          console.log("a user disconnected!");
          this.UserSocket.remove(socket.id);
        }
      });
    });
    return this.io;
  }
  getIO() {
    if (!this.io) {
      throw new Error('Socket.io is not initialized')
    }
    return this.io
  }
  sendTo(userId, event, payload) {
    try {
      let userSocket = this.UserSocket.get(userId);
      if (userSocket) {
        console.log("Sending event ", event, "payload: ", payload)
        this.io.to(userSocket).emit(event, payload)
      }
    } catch (error) {
      console.log(error)
    }
  }

}
const socketServer = new Socket()
module.exports = socketServer
