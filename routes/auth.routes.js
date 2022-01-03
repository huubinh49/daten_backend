const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();
const createError = require("http-errors");

/*---------- Public Routes ----------*/

router.post(
  '/refresh-token', 
  async (req, res, next) => {
    const {refresh_token} = req.body;
    if(!refresh_token) next(createError.BadRequest());
    authController.verifyRefreshToken(refresh_token).then((user)=>{
      const newAccessToken = authController.createAccessToken(user);
      res.json({
        access_token: newAccessToken,
        refresh_token: refresh_token
      });
    }).catch(error=>{
      if(error.name === "JsonWebTokenError"){
        return next(createError.Unauthorized("Invalid token"))
      }
      return next(createError.Unauthorized(error.message))
    }); 
})

router.post(
  '/signup',
  authController.signup
);
router.post(
    '/login',
    authController.login
);  
router.delete(
  '/logout',
  authController.logout
)
module.exports = router;