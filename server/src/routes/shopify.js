// server/routes/shopify.js
const express = require('express');
const router = express.Router();
const ShopifyService = require('../shopify/service');
const { authenticateUser } = require('../middleware/auth');

router.get('/products', authenticateUser, async (req, res) => {
  try {
    const products = await ShopifyService.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/products/:id', authenticateUser, async (req, res) => {
  try {
    const product = await ShopifyService.getProduct(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/checkout', authenticateUser, async (req, res) => {
  try {
    const checkout = await ShopifyService.createCheckout(req.body.lineItems);
    res.json(checkout);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create checkout' });
  }
});

module.exports = router;