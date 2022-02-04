const socket = require("socket.io");
let io
const init = (httpServer) => {
  // const io = require("./socket").init(8900, {
  //   cors: {
  //     origin: "http://localhost:3000",
  //   },
  // });
  io = socket(httpServer);
  console.log('Socket is ready!')
  let socketIds = {};
  const addUser = (userId, socketId) => {
    socketIds[userId] = socketId;
  };
  
  const removeUser = (socketId) => {
    for(let user in socketIds)
    if(socketIds[user] == socketId){
      socketIds[user]= null;
      delete socketIds[user]
    }
  };
  
  const getUser = (userId) => {
    return socketIds[userId];
  };
  
  io.on("connection", (socket) => {
    //when connect
    console.log("A user connected.");
  
    //take userId and socketId from user
    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
    });
  
    // TODO: send and get message
    socket.on("sendMessage", (message) => {
      const  recipientSocket = getUser(message.recipientId);
      const  senderSocket = getUser(message.senderId);
      try{
        if(recipientSocket)
        io.to(recipientSocket).emit("newMessage", message);
        if(senderSocket)
        io.to(senderSocket).emit("newMessage", message);
      }catch(error){
        console.log(error)
      }
    });
  
    //when disconnect
    socket.on("disconnect", () => {
      console.log("a user disconnected!");
      removeUser(socket.id);
    //   io.emit("getUsers", socketIds);
    });
  });
  return io;
}
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized')
  }
  return io
}
module.exports = {
  init,
  getIO
}
