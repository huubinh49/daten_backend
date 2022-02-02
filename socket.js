const io = require("./config/socket")(8900, {
    cors: {
      origin: "http://localhost:3000",
    },
  });
  
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
    //   io.emit("getUsers", socketIds);
    });
  
    // TODO: send and get message
    socket.on("sendMessage", (message) => {
      const user = getUser(receiverId);
      io.to(user.socketId).emit("getMessage", message);
    });
  
    //when disconnect
    socket.on("disconnect", () => {
      console.log("a user disconnected!");
      removeUser(socket.id);
    //   io.emit("getUsers", socketIds);
    });
  });