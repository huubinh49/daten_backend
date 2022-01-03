const jwt = require("jsonwebtoken");
const createErrors = require("http-errors")

module.exports = (req, res, next) => {
    // check header for the token
    var token = req.headers['Authorization'].split(" ")[1];

    console.log(token)
    // decode token
    if (token) {
      // verifies secret and checks if the token is expired
      jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) =>{      
        if (err) {
          return next(createErrors[400]("Invalid token"));    
        } else {
          // if everything is good, save to request for use in other routes
          req.user = decoded;    
          next();
        }
      });

    } else {
      // if there is no token  
      return next(createErrors[403]("Access denied"))
    }
}