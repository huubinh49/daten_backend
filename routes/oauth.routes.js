const express = require('express');
const passport = require('passport');
const auth = require("../controllers/auth.controller")
const router = express.Router();

router.post('/google/token', passport.authenticate(
    'google-token', { session: false }), auth.oauth2
);

router.post('/facebook/token', passport.authenticate(
    'facebook-token', { session: false }), auth.oauth2
);

module.exports = router;