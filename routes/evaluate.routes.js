const express = require("express");
const router = express.Router();
const authJWTMiddleware = require("../middleware/auth.middleware");
const evaluateController = require("../controllers/evaluate.controller");

router.use(authJWTMiddleware);
router.get('/all', evaluateController.getEvaluatingProfile);

module.exports = router;