import express from "express";

//@ts-ignore
import cotizaciones from "../controllers/cotizaciones.js";
import store from "../connection/dbposgres.js";
import response from "../connection/response.js";

const router = express.Router();
const cotizacion = cotizaciones(store());

router.post("/insert/", function (req, res, next) {
  // Obtener la IP del cliente
  const clientIp =
    req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"];

  cotizacion
    .insertar(req.body, clientIp)
    .then((data) => {
      response.success(req, res, data, 200, "Cotización enviada con éxito");
    })
    .catch(next);
});

router.post("/actualizar/", function (req, res, next) {
  cotizacion
    .actualizar(req.body, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.post("/insert/img-pago", function (req, res, next) {
  cotizacion
    .updateComprobante(req.body, req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/consultar/", function (req, res, next) {
  cotizacion
    .consultar(req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/consultar/productos", function (req, res, next) {
  cotizacion
    .cotizacionesRealizadas(req.headers["authorization"])
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get(
  "/consultar-producto/:id_producto/:estado/:envio/:atendido_por",
  function (req, res, next) {
    cotizacion
      .consultarProducto(req.params, req.headers["authorization"])
      .then((data) => {
        response.success(req, res, data, 200);
      })
      .catch(next);
  }
);

router.get("/detalles/:id", function (req, res, next) {
  cotizacion
    .consultarDetalles(req.params)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/categoria/:id_producto/:nombre", function (req, res, next) {
  cotizacion
    .categorias(req.params)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

router.get("/adicional/:id_producto/:nombre", function (req, res, next) {
  cotizacion
    .adicionales(req.params)
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

export default router;
