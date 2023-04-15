// This example sets up an endpoint using the Express framework.
// Watch this video to get started: https://youtu.be/rPR2aJ6XnAc.
require('dotenv').config();
const express = require("express");
const app = express();
const stripe_key = process.env.STRIPE_KEY
const CORS_URL = process.env.CORS_URL
const SUCCESS_PAGE = process.env.SUCCESS_PAGE
const CANCEL_PAGE = process.env.CANCEL_PAGE
const stripe = require("stripe")(stripe_key);


app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
  res.setHeader("Access-Control-Allow-Origin", CORS_URL);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.post("/create-checkout-session", async (req, res) => {
  let cards = req.body.cards;
  let line_items = [];
  let unit_count = 0;
  cards.forEach((e) => {
    let product = {};
    if (e.cards) {
      if (Object.keys(e.cards).length > 0) {
        let keys = Object.keys(e.cards);
        keys.forEach((name) => {
          product = {};
          let splitted = name.split("_");
          let card_name = splitted[1];
          let card_version = splitted[2];
          let quantity = e.cards[name].Quantity;
          unit_count += quantity;
          product["price_data"] = {
            currency: "usd",
            product_data: {
              name: card_name + " " + card_version,
            },
            unit_amount: 100,
          };
          product["quantity"] = quantity;
          line_items.push(product);
        });
      }
    }
  });

  let unit_price = 200;

  if (unit_count < 9) unit_price = 200;
  else if (unit_count < 49) unit_price = 150;
  else if (unit_count < 199) unit_price = 100;
  else if (unit_count > 200) unit_price = 75;
  line_items.forEach((e) => {
    e.price_data.unit_amount = unit_price;
  });
  console.log(line_items);
  const session = await stripe.checkout.sessions.create({
    // line_items: [
    //   {
    //     price_data: {
    //       currency: "usd",
    //       product_data: {
    //         name: "Ponder",
    //       },
    //       unit_amount: 2000,
    //     },
    //     quantity: 1,
    //   },
    //   {
    //     price_data: {
    //       currency: "usd",
    //       product_data: {
    //         name: "Thallid",
    //       },
    //       unit_amount: 2000,
    //     },
    //     quantity: 1,
    //   },
    // ],
    line_items: line_items,
    mode: "payment",
    shipping_address_collection : {
      'allowed_countries': ['US'],
    },
    success_url: CORS_URL + "/" + SUCCESS_PAGE,
    cancel_url: CORS_URL + "/" + CANCEL_PAGE,
  });

  res.send(session.url);
});

app.listen(4242, () => console.log(`Listening on port ${4242}!`));
