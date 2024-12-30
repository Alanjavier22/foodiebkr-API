import express from "express";

import paypal from "../controllers/paypal.js";
import store from "../connection/dbposgres.js";
import response from "../connection/response.js";

const router = express.Router();
const _paypal = paypal(store());

router.post("/create-paypal-order", function (req, res, next) {
  _paypal
    .createOrder(req.body, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.post("/capture-paypal-order", function (req, res, next) {
  _paypal
    .captureOrder(req.body, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data.data, 200, data.mensaje);
    })
    .catch(next);
});

export default router;
