import express from "express";

//@ts-ignore
import inventarios from "../controllers/inventario.js";
import store from "../connection/dbposgres.js";
import response from "../connection/response.js";

const router = express.Router();
const inventario = inventarios(store());

router.post("/upsert/", function (req, res, next) {
  inventario
    .upsert(req.body, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/consultar/:estado", function (req, res, next) {
  inventario
    .consultar(req.params)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/consultar/subproducto/:id_producto/:estado", function (req, res, next) {
  inventario
    .consultarSubproductos(req.params)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get(
  "/consultar/inventario/:id_producto/:id_subproducto/:estado",
  function (req, res, next) {
    inventario
      .consultarInventario(req.params)
      .then((data) => {
        response.success(req, res, data, 200);
      })
      .catch(next);
  }
);

router.get(
  "/consultar/detalles/inventario/:id_inventario",
  function (req, res, next) {
    inventario
      .consultarDetalles(req.params)
      .then((data) => {
        response.success(req, res, data, 200);
      })
      .catch(next);
  }
);

router.get("/consultar-opciones", function (req, res, next) {
  inventario
    .consultarOpciones(req.params)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/actualizar-stock", function (req, res, next) {
  inventario
    .actualizarStocks(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});


export default router;
