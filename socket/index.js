const socket = require("socket.io");

class IDManager{
  constructor(){
    this.ids = {};
  }
  add(userId, id){
    this.ids[userId] = id;
  };
  
  remove(id){
    for(let user in this.ids)
    if(this.ids[user] == id){
      this.ids[user]= null;
      delete this.ids[user]
    }
  };
  
  get(userId){
    return this.ids[userId];
  };
  get_reversed(id){
    for(let user in this.ids)
    if(this.ids[user] == id){
     return user;
    }
    return null;
  }
}
class Socket{
  constructor(){
    console.log("Initializing socket")
    this.io = null;
    this.UserSocket = new IDManager(); // userId - socketId
    this.CallSocket = new IDManager(); // userId - socketId(call)
    this.PeerIds = new IDManager(); // userId - peerId 
    this.peers = [] // contains the userId of each peer
  }
 
  getPartnerPeerJS(peerid){
    for(let peer of this.peers){
      if(peerId == peer[0]){
        return peer[1]
      }
      if(peerId == peer[1]){
        return peer[0]
      }
    }
    return null;
  }
  init(httpServer) {

    this.io = socket(httpServer,  {
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
        console.log("add user: ", payload)
        this.UserSocket.add(payload.userId, socket.id);
      });
    
      // TODO: send and get message
      socket.on("sendMessage", (message) => {
        console.log("new message: ", message)
        const recipientSocket = this.UserSocket.get(message.recipientId);
        const senderSocket = this.UserSocket.get(message.senderId);
        try{
          if(recipientSocket)
          this.io.to(recipientSocket).emit("newMessage", message);
          if(senderSocket)
          this.io.to(senderSocket).emit("newMessage", message);
        }catch(error){
          console.log(error)
        }
      });
      // Socket event for video call
      socket.on('peer-connected', (userData) => {
        const { peerId, userID } = userData;
        const callEvents = ['reject-call', 'call', 'call-info', 'display-media', 'user-video-off', 'broadcast-message']
        
        callEvents.forEach(callEvent => {
          socket.on(callEvent, (response) => {
            socket.to(this.CallSocket.get(response.toUID)).emit(callEvent, response)
          })
        })
        socket.on('call-established', (data) => {
          this.peers.push([userID, this.PeerIds.get_reversed(data.caller)])
        })
        // TODO: modified that send to calling partner
        socket.on('disconnect', () => {
          // If a callee is disconnect, send it to other
          const partnerPeerId = this.getPartnerPeerJS(peerId);
          if(partnerPeerId)
            socket.to(partnerPeerId).emit('user-disconnected', peerId)
        });
        socket.on('display-media', (value) => {
            socket.to().emit('display-media', {userID, value });
        });
        // socket.on('broadcast-message', (message) => {
        //     socket.to(roomID).broadcast.emit('new-broadcast-message', {...message, userData});
        // });
        // socket.on('reconnect-user', () => {
        //     socket.to(roomID).broadcast.emit('new-user-connect', userData);
        // // });
        
        socket.on('user-video-off', (value) => {
          const partnerPeerId = this.getPartnerPeerJS(peerId);
          if(partnerPeerId)
            socket.to(partnerPeerId).emit('user-video-off', value);
        });
      });
      //when disconnect
      socket.on("disconnect", () => {
        console.log("a user disconnected!");
        this.UserSocket.remove(socket.id);
      //   this.io.emit("getUsers", this.socketIds);
      });
    });
    return this.io;
  }
  getIO (){
    if (!this.io) {
      throw new Error('Socket.io is not initialized')
    }
    return this.io
  }
  sendTo(userId, event, payload) {
    try {
      const userSocket = this.UserSocket.get(userId);
      if(userSocket){
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
