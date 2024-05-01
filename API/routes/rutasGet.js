import express from "express";

import Controllers from "../controllers/Procesos.js";
import store from "../connection/dbposgres.js";
import response from "../connection/response.js";

//Constantes
const router = express.Router();
const Controller = process.env.DEVLOCAL == 'true' ? Controllers() : Controllers(store());

router.get("/clientes/", function (req, res, next) {
  Controller.clientes(req.query)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/cotizaciones/", function (req, res, next) {
  Controller.cotizaciones(req.query)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/categoria/", function (req, res, next) {
  Controller.categoriaProducto(req.query)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/subCategorias/", function (req, res, next) {
  Controller.subCategoriaProducto(req.query)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/detalles/", function (req, res, next) {
  Controller.detallesProducto(req.query)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/menuProductos/", function (req, res, next) {
  Controller.menuProducto(req.query)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

export default router;
