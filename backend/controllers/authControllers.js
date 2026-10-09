const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const otpStore = new Map();
const transporter =
  process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      })
    : null;

const getAdminEmails = () => {
  const configured = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return configured.length
    ? configured
    : process.env.EMAIL_USER
      ? [process.env.EMAIL_USER.toLowerCase()]
      : [];
};

const createToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

const adminLogin = async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password || "");
  const adminEmail = String(process.env.ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();

  if (!adminEmail || !process.env.ADMIN_PASS) {
    return res
      .status(500)
      .json({ message: "Admin credentials are not configured" });
  }

  if (email !== adminEmail || password !== process.env.ADMIN_PASS) {
    return res.status(401).json({ message: "Invalid admin email or password" });
  }

  const user = await User.findOneAndUpdate(
    { email: adminEmail },
    { $set: { isAdmin: true } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return res.json({
    message: "Admin login successful",
    token: createToken(user),
    user: { id: user._id, email: user.email, isAdmin: true },
  });
};

const sendOTP = async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "Enter a valid email address" });
  }

  if (
    email ===
    String(process.env.ADMIN_EMAIL || "")
      .trim()
      .toLowerCase()
  ) {
    return res
      .status(400)
      .json({ message: "Use the admin login option for this email" });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  try {
    if (transporter) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Technuvex login code",
        text: `Your Technuvex login code is ${otp}. It expires in 5 minutes.`,
      });
    } else {
      console.log(`Development OTP for ${email}: ${otp}`);
    }

    const response = { message: "OTP sent successfully" };
    if (!transporter && process.env.NODE_ENV !== "production") {
      response.message = "Email is not configured; use the development OTP";
      response.devOtp = otp;
    }
    return res.json(response);
  } catch (error) {
    console.error("OTP email failed:", error.message);

    if (process.env.NODE_ENV !== "production" && error.code === "EAUTH") {
      console.log(`Development OTP for ${email}: ${otp}`);
      return res.json({
        message: "Gmail rejected the SMTP login; use the development OTP",
        devOtp: otp,
      });
    }

    return res.status(502).json({ message: "Unable to send OTP email" });
  }
};

const verifyOTP = async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const otp = String(req.body.otp || "").trim();
  const stored = otpStore.get(email);

  if (!stored)
    return res
      .status(400)
      .json({ message: "OTP not found. Request a new code." });
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return res
      .status(400)
      .json({ message: "OTP expired. Request a new code." });
  }
  if (stored.otp !== otp)
    return res.status(400).json({ message: "Invalid OTP" });

  const isAdmin = getAdminEmails().includes(email);
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { isAdmin } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  otpStore.delete(email);
  return res.json({
    message: "Login successful",
    token: createToken(user),
    user: { id: user._id, email: user.email, isAdmin: user.isAdmin },
  });
};

module.exports = { adminLogin, sendOTP, verifyOTP };
