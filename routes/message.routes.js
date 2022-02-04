const express = require("express");
const router = express.Router();
const authJWTMiddleware = require("../middleware/auth.middleware");
const messageController = require("../controllers/message.controller");

router.use(authJWTMiddleware);
router.get('/', messageController.getMessage);
router.post('/', messageController.createMessage);
router.post('/seen', messageController.seenMessage);
module.exports = router;