import express from "express";

import Controllers from "../controllers/Procesos.js";
import store from "../connection/dbposgres.js";
import response from "../connection/response.js";

//Constantes
const router = express.Router();
const Controller = process.env.DEVLOCAL == 'true' ? Controllers() : Controllers(store());

router.post("/cliente/", function (req, res, next) {
  Controller.insertClientes(req.body)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.post("/cotizaciones/", function (req, res, next) {
  Controller.insertCotizaciones(req.body)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.post("/login", function (req, res, next) {
  Controller.login(req.body)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

export default router;
