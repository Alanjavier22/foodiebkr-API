import express from "express";

import auditoria from "../controllers/auditoria.js";
import store from "../connection/dbposgres.js";
import response from "../connection/response.js";

const router = express.Router();
const _auditoria = auditoria(store());

router.get("/", function (req, res, next) {
  _auditoria
    .consultar(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.post("/insert", function (req, res, next) {
  _auditoria
    .insert(req.body, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

export default router;
