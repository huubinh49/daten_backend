const jwt = require("jsonwebtoken");
const createErrors = require("http-errors")

module.exports = (req, res, next) => {
    try{
      // check header for the token
      const [signed, token] = req.headers['authorization'].split(" ");
      // decode token
      if (signed === "JWT" && token) {
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
    }catch(error){
      return next(createErrors.Unauthorized("Failed to authorize"))
    }
}