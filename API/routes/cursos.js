import express from "express";

import cursos from "../controllers/cursos.js";
import store from "../connection/dbposgres.js";
import response from "../connection/response.js";

const router = express.Router();
const curso = cursos(store());

router.post("/upsert", function (req, res, next) {
  curso
    .upsert(req.body, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/:estado", function (req, res, next) {
  curso
    .consultar(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/detalles/:id_cursos", function (req, res, next) {
  curso
    .detalles(req.params, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

export default router;
