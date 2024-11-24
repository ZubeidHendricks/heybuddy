// client/src/services/shopify.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_SERVER_URL;

export const shopifyService = {
  async getProducts() {
    const response = await axios.get(`${API_URL}/api/shop/products`);
    return response.data;
  },

  async getProduct(productId) {
    const response = await axios.get(`${API_URL}/api/shop/products/${productId}`);
    return response.data;
  },

  async createCheckout(lineItems) {
    const response = await axios.post(`${API_URL}/api/shop/checkout`, { lineItems });
    return response.data;
  }
};