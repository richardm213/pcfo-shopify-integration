const mongoose = require("mongoose");
const { Schema } = mongoose;

const ShopifyTransaction = new Schema({
  id: {
    type: String,
    default: null,
  },
  order_id: {
    type: String,
    default: null,
  },
  amount: {
    type: Number,
    default: null,
  },
  currency: {
    type: String,
    default: null,
  },
  user_id: {
    type: String,
    default: null,
  },
  processed_at: {
    type: String,
    default: null,
  },
  remote_reference: {
    type: String,
    default: null,
  },
  payment_details: {
    type: String,
    default: null,
  },
  payment_method: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("shopify_transaction", ShopifyTransaction);
