const express = require("express");

const router = express.Router();

const {
  adminLogin,
  sendOTP,
  verifyOTP,
} = require("../controllers/authControllers");

router.post("/admin-login", adminLogin);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

module.exports = router;
