const mongoose = require("mongoose");
const { Schema } = mongoose;

const ShopifyBalance = new Schema({
  currency: {
    type: String,
    default: null,
  },
  amount: {
    type: Number,
    default: null,
  },
});

module.exports = mongoose.model("shopify_balance", ShopifyBalance);
