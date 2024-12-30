import express from "express";

import productos from "../controllers/producto.js";
import store from "../connection/dbposgres.js";
import response from "../connection/response.js";

const router = express.Router();
const producto = productos(store());

router.get("/", function (req, res, next) {
  producto
    .consultarProductos(false)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/consultar/:estado", function (req, res, next) {
  producto
    .consultar(req.params)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/consultar/subproducto/:id_producto/:estado", function (req, res, next) {
  producto
    .consultarSubproductos(req.params)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get(
  "/consultar/categoria/:id_producto/:id_subproducto/:estado",
  function (req, res, next) {
    producto
      .consultarCategoria(req.params)
      .then((data) => {
        response.success(req, res, data, 200);
      })
      .catch(next);
  }
);

router.get(
  "/consultar/detalles/categoria/:id_categoria",
  function (req, res, next) {
    producto
      .consultarDetallesCategoria(req.params)
      .then((data) => {
        response.success(req, res, data, 200);
      })
      .catch(next);
  }
);

router.get("/buscar/:nombre/:id_producto", function (req, res, next) {
  producto
    .consultarNombreCategoria(req.params)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/consultar-opciones", function (req, res, next) {
  producto
    .consultarOpciones(req.params)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.post("/upsert/", function (req, res, next) {
  producto
    .upsert(req.body, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.post("/subproducto/upsert/", function (req, res, next) {
  producto
    .upsertSubproducto(req.body, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.post("/categoria/upsert/", function (req, res, next) {
  producto
    .upsertCategoria(req.body, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/pisos/porciones/:nombre", function (req, res, next) {
  producto
    .consultarPisosPorciones(req.params)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});


export default router;
