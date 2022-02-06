const socket = require("socket.io");

class Socket{
  constructor(){
    console.log("Initializing socket")
    this.io = null;
    this.socketIds = {};
  }
  addUser(userId, socketId){
    this.socketIds[userId] = socketId;
  };
  
  removeUser(socketId){
    for(let user in this.socketIds)
    if(this.socketIds[user] == socketId){
      this.socketIds[user]= null;
      delete this.socketIds[user]
    }
  };
  
  getUser(userId){
    return this.socketIds[userId];
  };

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
        this.addUser(payload.userId, socket.id);
      });
    
      // TODO: send and get message
      socket.on("sendMessage", (message) => {
        console.log("new message: ", message)
        const  recipientSocket = this.getUser(message.recipientId);
        const  senderSocket = this.getUser(message.senderId);
        try{
          if(recipientSocket)
          this.io.to(recipientSocket).emit("newMessage", message);
          if(senderSocket)
          this.io.to(senderSocket).emit("newMessage", message);
        }catch(error){
          console.log(error)
        }
      });
    
      //when disconnect
      socket.on("disconnect", () => {
        console.log("a user disconnected!");
        this.removeUser(socket.id);
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
      const userSocket = this.getUser(userId);
      if(userSocket)
      this.io.to(userSocket).emit(event, payload) 
    } catch (error) {
      console.log(error)
    }
  }
}
const socketServer = new Socket()
module.exports = socketServer
