const ESSerializer = require('esserializer');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/mongodb');
const  bodyParser = require("body-parser");
const cors = require("cors");
require("./middleware/oauth.middleware");
const authRoutes = require('./routes/auth.routes');
const oauthRoutes = require('./routes/oauth.routes');
const profileRoutes = require("./routes/profile.routes");
const matchRoutes = require("./routes/match.routes");
const evaluateRoutes = require("./routes/evaluate.routes");
const messageRoutes = require("./routes/message.routes");

const fs = require('fs');
// Set up Global configuration access
dotenv.config();
const app = express();


var corsOptions = {
    origin: "http://localhost:3000"
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended:  true }));
app.use(bodyParser.urlencoded({ extended:  true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    console.log('data received:', req.body);
    next();
})

// connect Mongo db
connectDB();

app.use('/auth', authRoutes);
app.use('/auth', oauthRoutes);
app.use('/profile', profileRoutes);
app.use('/matches', matchRoutes);
app.use('/evaluate', evaluateRoutes);
app.use('/messages', messageRoutes);

// Error handler middleware
app.use((err, req, res, next) => {
    if(err)
    res.status(err.status).send({
        error: err.message
    });
});
const PORT = process.env.PORT || 5000;
//Create Redis client on Redis port

app.listen(PORT, () => {
  console.log(`Server is up and running on ${PORT} ...`);
});


// this function is called when you want the server to die gracefully
// i.e. wait for existing connections
var gracefulShutdown = function() {
    console.log("Received kill signal, shutting down gracefully.");

    server.close(function() {
      console.log("Closed out remaining connections.");
      process.exit()
    });
    
     // if after 
     setTimeout(function() {
         console.error("Could not close connections in time, forcefully shutting down");
         process.exit()
    }, 10*1000);
    // ReferenceError: ESSerializer is not defined
    fs.writeFile( "bloom_object.json", ESSerializer.serialize(bloom_filter), 'utf-8', function(err) {
        process.exit()  
    })
}
  
// listen for TERM signal .e.g. kill 
process.on ('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', gracefulShutdown);