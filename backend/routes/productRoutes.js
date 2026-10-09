const express = require("express");

const {
  getProducts,
  createProduct,
} = require("../controllers/productController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getProducts);

router.post("/", requireAuth, requireAdmin, createProduct);

module.exports = router;
