import express from "express";

import pdf from "../controllers/pdf.js";
import store from "../connection/dbposgres.js";
import response from "../connection/response.js";

const router = express.Router();
const _pdf = pdf(store());

router.post("/", function (req, res, next) {
  _pdf
    .generatePdf(req.body, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

export default router;