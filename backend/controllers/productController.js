const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, image } = req.body;

    if (
      !name?.trim() ||
      !image?.trim() ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        message: "Name, image URL, and a valid non-negative price are required",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description?.trim() || "",
      price: Number(price),
      image: image.trim(),
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getProducts,
  createProduct,
};
