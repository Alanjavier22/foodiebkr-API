// Modulos
import express from "express";

import { errors } from "./API/connection/error.js";

import producto from "./API/routes/producto.js";
import usuario from "./API/routes/usuario.js";
import cotizaciones from "./API/routes/cotizaciones.js";
import clientes from "./API/routes/cliente.js";
import ventas from "./API/routes/ventas.js";
import inventario from "./API/routes/inventario.js";
import oferta from "./API/routes/oferta.js";
import cursos from "./API/routes/cursos.js";

import generarPdf from "./API/routes/pdf.js";
import auditoria from "./API/routes/auditoria.js";
import dashboard from "./API/routes/dashboard.js";
import email from "./API/routes/email.js";
import paypal from "./API/routes/paypal.js";

// Constantes
const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(express.json({ limit: "500mb" }));
app.use(
  express.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(express.static("public"));

// Configurar cabeceras y CORS
app.use((req, res, next) => {
  // Permitir orígenes
  res.header("Access-Control-Allow-Origin", "*");

  // Permitir encabezados específicos
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );

  // Métodos permitidos
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");

  // Configuración para evitar caché
  res.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  res.header("Surrogate-Control", "no-store");

  next();
});

// Rutas
app.use("/api/producto", producto);
app.use("/api/usuario", usuario);
app.use("/api/cotizacion", cotizaciones);
app.use("/api/cliente", clientes);
app.use("/api/ventas", ventas);
app.use("/api/inventario", inventario);
app.use("/api/oferta", oferta);
app.use("/api/cursos", cursos);
app.use("/api/email", email);
app.use("/api/paypal", paypal);
app.use("/api/dashboard", dashboard);
app.use("/api/auditoria", auditoria);
app.use("/api/generarPdf", generarPdf);

// Manejo de errores
app.use(errors);

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});
