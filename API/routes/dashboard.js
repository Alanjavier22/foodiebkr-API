import express from "express";

import dashboard from "../controllers/dashboard.js";
import store from "../connection/dbposgres.js";
import response from "../connection/response.js";

const router = express.Router();
const _dashboard = dashboard(store());

router.get("/mayor-compra", function (req, res, next) {
  _dashboard
    .mayorCompra(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/producto-mas-vendido", function (req, res, next) {
  _dashboard
    .productosMasVendido(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/cliente-mayor-cotizacion", function (req, res, next) {
  _dashboard
    .clienteMayorCotizacion(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/producto-mas-cotizacion", function (req, res, next) {
  _dashboard
    .masCotizado(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/ventas-fecha", function (req, res, next) {
  _dashboard
    .fechaMasVentasPorMes(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/ventas-fecha-semana", function (req, res, next) {
  _dashboard
    .fechaMasVentasPorSemana(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/cotizacion-fecha", function (req, res, next) {
  _dashboard
    .fechaMasCotizacionesPorMes(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/cotizacion-fecha-semana", function (req, res, next) {
  _dashboard
    .fechaMasCotizacionesPorSemana(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/", function (req, res, next) {
  _dashboard
    .ventasTotales(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/dia", function (req, res, next) {
  _dashboard
    .ventasTotalesDia(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

export default router;
