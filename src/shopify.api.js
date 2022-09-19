const express = require("express");
const router = express.Router();
const ShopifyController = require("../controllers/shopify.controller");

router.route("/").get(ShopifyController.shopify);
router.route("/login").get(ShopifyController.login);
router.route("/auth/callback").get(ShopifyController.callback);
router.route("/balance").get(ShopifyController.balance);
router.route("/transactions").get(ShopifyController.transactions);
router.route("/inflow_transactions").get(ShopifyController.inflow_transactions);
router
  .route("/outflow_transactions")
  .get(ShopifyController.outflow_transactions);
module.exports = router;
