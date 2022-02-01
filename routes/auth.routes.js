const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();
const createError = require("http-errors");

/*---------- Public Routes ----------*/

router.post(
  '/refresh-token', 
  authController.refreshToken
)

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