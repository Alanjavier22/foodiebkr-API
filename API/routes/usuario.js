import express from "express";

import usuarios from "../controllers/usuario.js";
import store from "../connection/dbposgres.js";
import response from "../connection/response.js";

const router = express.Router();
const usuario = usuarios(store());

router.post("/login", function (req, res, next) {
  // Obtener la IP del cliente
  const clientIp =
    req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"];

  usuario
    .login(req.body, clientIp)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.post("/account-recovery", function (req, res, next) {
  usuario
    .recovery(req.body)
    .then((data) => {
      response.success(
        req,
        res,
        [1],
        200,
        "Correo enviado para recuperación de cuenta"
      );
    })
    .catch(next);
});

router.post("/changed-pass", function (req, res, next) {
  usuario
    .changed(req.body)
    .then((data) => {
      response.success(
        req,
        res,
        [1],
        200,
        "Contraseña actualizada"
      );
    })
    .catch(next);
});

router.post("/register", function (req, res, next) {
  // Obtener la IP del cliente
  const clientIp =
    req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"];

  usuario
    .register(req.body, clientIp)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/empleados", function (req, res, next) {
  usuario
    .empleados()
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

export default router;
