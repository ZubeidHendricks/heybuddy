// server/shopify/client.js
const Client = require('shopify-buy');

const shopifyClient = Client.buildClient({
  domain: process.env.SHOPIFY_SHOP_NAME,
  storefrontAccessToken: process.env.SHOPIFY_ACCESS_TOKEN
});





