import express from "express";

import ventas from "../controllers/ventas.js";
import store from "../connection/dbposgres.js";
import response from "../connection/response.js";

const router = express.Router();
const venta = ventas(store());

router.post("/upsert", function (req, res, next) {
    venta
    .upsert(req.body, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/consultar/:realizado_por/:estado/:fechaInicio/:fechaFin", function (req, res, next) {
    venta
    .consultar(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/consultar/:realizado_por", function (req, res, next) {
    venta
    .consultar(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/actualizar-estado/", function (req, res, next) {
    venta
    .actualizarEstados(req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

export default router;
