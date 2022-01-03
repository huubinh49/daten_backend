const jwt = require('jsonwebtoken');
const User = require("../models/User")
const createError = require("http-errors");
const redis = require("../config/redis");

async function signup(req, res, next) {
    try { 
        const {email, password} = req.body
        if(!email || !password){
            return next(createError.BadRequest("Not enough information"))
        }
        let user = await User.findOne({ email: req.body.email })

        if (user) 
          return next(createError[400]("User is existing"))
        user = await User.create({ email, password });
        const accessToken = createAccessToken(user);
        const refreshToken = await createRefreshToken(user);
        res.status(201).json({ 
          access_token: accessToken,
          refresh_token: refreshToken 
        });
    } catch (err) {
      return next(createError[400]("An error occurs"))
    }
}

function createAccessToken (user) {
  return jwt.sign(
    { email: user.email, id: user._id}, 
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  )
}
async function createRefreshToken(user){
  return new Promise((resolve, reject) =>{
    jwt.sign(
    { email: user.email, id: user._id}, process.env.JWT_REFRESH_SECRET,{ expiresIn: '12h' }, 
    (err, token) => {
      if(err) reject(err);
      redis.set(user._id.toString(), token, "EX", 12*60*60, (err, reply) => {
        if(err){
          return reject(createError.InternalServerError())
        }
        resolve(token)
      })
    })
  })
}
async function verifyRefreshToken(refreshToken) {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, payload) => {
      if(err){
        return reject(err);
      }
      // Get user id and check in redis if the refresh token isn't expired yet
      redis.get(payload.id, (err, reply) => {
        if(err){
          return reject(createError.InternalServerError());
        }
        if(refreshToken === reply){
          return resolve(payload)
        }
        return reject(createError.Unauthorized("Token is expired!"))
      })
    })
  })
}
async function login(req, res, next) {
    
  try {
    const { email, password } = req.body;
    if(!email || !password){
      return next(createError.BadRequest("Not enough information"))
    }
    const user = await User.findOne({ email: email })
    
    // If this user isn't exist
    if (!user) 
      return next(createError.Unauthorized('User not found'))
    // If this user doesn't have password because he logined by Oauth  
    if(user.googleId || user.facebookId)
    return next(createError.Unauthorized(`This user must login by ${user.googleId? 'Google' : 'Facebook'} OAuth`))
    
    user.comparePassword(password, async (err, isMatch) => {
      if(err){
        return next(createError.Unauthorized("An error occurs"));
      }
      if (isMatch) {
        try{
          const accessToken = createAccessToken(user);
          const refreshToken = await createRefreshToken(user);
          res.status(200).json({ 
            access_token: accessToken,
            refresh_token: refreshToken 
          });
        }catch(error){
          return next(createError[400](error))
        }
      }else{ 
        return next(createError.Unauthorized("Invalid credentials"));
      }
    })
  }
  catch (err) {
    return next(createError.Unauthorized("An error occurs"));
  }
}


async function oauth2(req, res, next) {
  if (!req.user) {
    return next(createError.Unauthorized("Authentication failed"));
  }
  try{
    const { email } = req.user;
    let user = await User.findOne({ where: { email } });
    if(!user){
      // if the user login by OAuth didn't signup
      user = await req.user.save(); 
    }
    const accessToken = createAccessToken(user);
    const refreshToken = await createRefreshToken(user);
    res.status(200).json({ 
      access_token: accessToken,
      refresh_token: refreshToken 
    });
  }catch(error){
    return next(createError[500]("Something went wrong"))
  }
  
}
async function logout(req, res, next) {
  try {
    const {refreshToken} = req.body
    if(!requestToken){
      throw createError.BadRequest();
    }
    const user = await verifyRefreshToken(refreshToken)
    redis.del(user._id.toString(), (err, reply) => {
      if(err){
        throw createError.InternalServerError();
      }
      res.json({
        message: "Logout successfully"
      })
    })
  } catch (error) {
    return next(error)
  }
}
module.exports = {
  signup,
  login,
  logout,
  oauth2,
  createRefreshToken,
  createAccessToken, 
  verifyRefreshToken
}