const Shopify = require("@shopify/shopify-api");
require("dotenv").config();
const ShopifyBalance = global.appRequire("model.shopify_balance");
const ShopifyTransaction = global.appRequire("model.shopify_transaction");

const SHOP = process.env.SHOP;
const API_KEY = process.env.API_KEY;
const API_SECRET_KEY = process.env.API_SECRET_KEY;
const SCOPES =
  "read_orders,write_orders,read_products,write_products,read_shopify_payments_payouts,read_customers";
var token = "";
var prod_data = "";
var bal_data = "";
var tender_transactions_data = "";
var customers_data = "";
var orders_data = "";
var orders_count_data = "";
var payment_transactions_data = "";
var client = null;
Shopify.default.Context.initialize({
  API_KEY,
  API_SECRET_KEY,
  SCOPES: [SCOPES],
  HOST_NAME: "37e0-75-55-254-139.ngrok.io/",
  IS_EMBEDDED_APP: true,
  API_VERSION: Shopify.ApiVersion.October21, // all supported versions are available, as well as "unstable" and "unversioned"
});
const ACTIVE_SHOPIFY_SHOPS = {};

const shopify = async (req, res) => {
  if (ACTIVE_SHOPIFY_SHOPS[SHOP] === undefined) {
    res.redirect(`/v0.1/shopify/login`);
  } else {
    res.send(
      "TOKEN: " +
        token +
        `<br/><br/>` +
        "PRODUCT DATA: " +
        JSON.stringify(prod_data["body"]) +
        `<br/><br/>` +
        "BALANCE DATA: " +
        JSON.stringify(bal_data["body"]) +
        `<br/><br/>` +
        "TENDER TRANSACTION DATA: " +
        JSON.stringify(
          tender_transactions_data["body"]["tender_transactions"]
        ) +
        `<br/><br/>` +
        "CUSTOMERS DATA: " +
        JSON.stringify(customers_data["body"]) +
        `<br/><br/>` +
        "ORDERS DATA: " +
        JSON.stringify(orders_data["body"]) +
        `<br/><br/>` +
        "ORDERS COUNT DATA: " +
        JSON.stringify(orders_count_data["body"]) +
        `<br/><br/>` +
        "PAYMENT TRASACTION DATA: " +
        JSON.stringify(payment_transactions_data["body"])
    );
    res.end();
  }
};

const login = async (req, res) => {
  let authRoute = await Shopify.default.Auth.beginAuth(
    req,
    res,
    SHOP,
    "v0.1/shopify/auth/callback",
    false
  );
  return res.redirect(authRoute);
};

//OAuth process
const callback = async (req, res) => {
  try {
    const session = await Shopify.default.Auth.validateAuthCallback(
      req,
      res,
      req.query
    );

    ACTIVE_SHOPIFY_SHOPS[SHOP] = session.scope;
    console.log("MY TOKEN: " + session.accessToken);
    token = session.accessToken;
    client = new Shopify.default.Clients.Rest(
      session.shop,
      session.accessToken
    );

    const products = await client.get({
      path: "products",
    });
    prod_data = products;

    const balance = await client.get({
      path: "shopify_payments/balance",
    });
    bal_data = balance;

    const tender_transactions = await client.get({
      path: "tender_transactions",
    });
    tender_transactions_data = tender_transactions;

    const customers = await client.get({
      path: "customers",
      query: { fields: "id,first_name,last_name,email,total_spent" },
    });
    customers_data = customers;

    const orders = await client.get({
      path: "orders",
      query: { status: "any", fields: "id,name,total_price" },
    });
    orders_data = orders;

    const orders_count = await client.get({
      path: "orders/count",
      query: { status: "any" },
    });
    orders_count_data = orders_count;

    const payments_transactions = await client.get({
      path: "shopify_payments/balance/transactions",
      query: { payout_id: "623721858" },
    });
    payment_transactions_data = payments_transactions;
  } catch (error) {
    console.error("You have already installed this app to your store.");
  }
  return res.redirect("/v0.1/shopify/");
};

const balance = async (req, res) => {
  const data = await client.get({
    path: "shopify_payments/balance",
  });
  ShopifyBalance.create({
    currency: data["body"]["balance"][0]["currency"],
    amount: parseFloat(data["body"]["balance"][0]["amount"]),
  });
  res.send(data["body"]);
};

const transactions = async (req, res) => {
  const data = await client.get({
    path: "tender_transactions",
  });
  var count = 0;
  var str1 = "";
  while (count < data["body"]["tender_transactions"].length) {
    ShopifyTransaction.create({
      id: data["body"]["tender_transactions"][count]["id"],
      order_id: data["body"]["tender_transactions"][count]["order_id"],
      amount: data["body"]["tender_transactions"][count]["amount"],
      currency: data["body"]["tender_transactions"][count]["currency"],
      user_id: data["body"]["tender_transactions"][count]["user_id"],
      processed_at: data["body"]["tender_transactions"][count]["processed_at"],
      remote_reference:
        data["body"]["tender_transactions"][count]["remote_reference"],
      payment_details:
        data["body"]["tender_transactions"][count]["payment_details"],
      payment_method:
        data["body"]["tender_transactions"][count]["payment_method"],
    });
    str1 +=
      JSON.stringify(data["body"]["tender_transactions"][count]) + `<br/><br/>`;
    count++;
  }
  res.send(str1);
};

const inflow_transactions = async (req, res) => {
  const data = await client.get({
    path: "tender_transactions",
  });
  var count = 0;
  var str1 = "";
  while (count < data["body"]["tender_transactions"].length) {
    if (parseFloat(data["body"]["tender_transactions"][count]["amount"]) > 0) {
      str1 +=
        JSON.stringify(data["body"]["tender_transactions"][count]) +
        `<br/><br/>`;
    }
    count++;
  }
  res.send(str1);
};

const outflow_transactions = async (req, res) => {
  const data = await client.get({
    path: "tender_transactions",
  });
  var count = 0;
  var str1 = "";
  while (count < data["body"]["tender_transactions"].length) {
    if (parseFloat(data["body"]["tender_transactions"][count]["amount"]) < 0) {
      str1 +=
        JSON.stringify(data["body"]["tender_transactions"][count]) +
        `<br/><br/>`;
    }
    count++;
  }
  res.send(str1);
};

module.exports = {
  shopify,
  login,
  callback,
  balance,
  transactions,
  inflow_transactions,
  outflow_transactions,
};
