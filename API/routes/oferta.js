import express from "express";

import ofertas from "../controllers/oferta.js";
import store from "../connection/dbposgres.js";
import response from "../connection/response.js";

const router = express.Router();
const oferta = ofertas(store());

router.get("/descuento/:codigo", function (req, res, next) {
  oferta
    .consultar(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data.datos, 200, "Codigo aplicado");
    })
    .catch(next);
});

router.get("/registradas", function (req, res, next) {
  oferta
    .ofertasRegistradas(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/consultar/clientes", function (req, res, next) {
  oferta
    .consultarCliente(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.post("/upsert", function (req, res, next) {
  oferta
    .upsert(req.body, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.post("/enviar-codigo-descuento", function (req, res, next) {
  oferta
    .enviarCodigoDescuento(req.body, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

export default router;
