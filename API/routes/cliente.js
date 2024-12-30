import express from "express";

//@ts-ignore
import clientes from "../controllers/clientes.js";
import store from "../connection/dbposgres.js";
import response from "../connection/response.js";

const router = express.Router();
const cliente = clientes(store());

router.post("/upsert/", function (req, res, next) {
  cliente
    .upsert(req.body, req.headers["authorization"], null)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/consultar-cedula/:cedula", function (req, res, next) {
  cliente
    .consultarCedula(req.params)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/consultar/:estado", function (req, res, next) {
  cliente
    .consultar(req.params)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/buscar/:campo/:valor/:estado", function (req, res, next) {
  cliente
    .consultarBusqueda(req.params)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

export default router;
