const express = require('express');
const authJWTMiddleware = require("../middleware/auth.middleware");
const router = express.Router();
const matchController = require("../controllers/match.controller");

router.use(authJWTMiddleware);
router.get('/', matchController.getMatch);
router.get('/all', matchController.getPartners);
router.get('/chatted', matchController.getChattedPartners)
router.get('/private-chatted', matchController.getPrivatelyChattedPartners)

module.exports = router;