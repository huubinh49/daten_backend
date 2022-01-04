const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/mongodb');
const  bodyParser = require("body-parser");
const cors = require("cors");
require("./middleware/oauth.middleware");
const authRoutes = require('./routes/auth.routes');
const oauthRoutes = require('./routes/oauth.routes');
const profileRoutes = require("./routes/profile.routes");
// Set up Global configuration access
dotenv.config();
const redis = require("./config/redis");
const app = express();


var corsOptions = {
    origin: "http://localhost:3000"
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended:  false }));
app.use(bodyParser.urlencoded({ extended:  false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    console.log(req.body);
    next();
})
connectDB();

app.use('/auth', authRoutes);
app.use('/auth', oauthRoutes);
app.use('/profile', profileRoutes);

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
