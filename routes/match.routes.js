const express = require('express');
const authJWTMiddleware = require("../middleware/auth.middleware");
const router = express.Router();
const matchController = require("../controllers/match.controller");

router.use(authJWTMiddleware);
router.get('/', matchController.getPartners);
router.get('/chatted', matchController.getChattedPartners)

module.exports = router;