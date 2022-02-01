const express = require("express");
const router = express.Router();
const authJWTMiddleware = require("../middleware/auth.middleware")
const multer = require('multer')
const storage = multer.memoryStorage();
const limits = { fileSize: 1000 * 1000 * 12 }; // limit to 12mb
const upload = multer({ storage, limits });
const profileController = require("../controllers/profile.controller")
router.use(authJWTMiddleware);
router.use(upload.any())
router.get("/", profileController.getProfile);
router.post('/', profileController.createProfile);
router.post('/update', profileController.updateProfile);
module.exports = router;