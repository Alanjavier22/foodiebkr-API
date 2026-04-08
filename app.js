// Modulos
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { errors } from "./API/connection/error.js";

import producto from "./API/routes/producto.js";
import usuario from "./API/routes/usuario.js";
import cotizaciones from "./API/routes/cotizaciones.js";
import clientes from "./API/routes/cliente.js";
import ventas from "./API/routes/ventas.js";
import inventario from "./API/routes/inventario.js";
import oferta from "./API/routes/oferta.js";
import cursos from "./API/routes/cursos.js";

import { authMiddleware } from "./API/middlewares/authMiddleware.js";

import generarPdf from "./API/routes/pdf.js";
import auditoria from "./API/routes/auditoria.js";
import dashboard from "./API/routes/dashboard.js";
import email from "./API/routes/email.js";
import paypal from "./API/routes/paypal.js";

// Constantes
const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(express.static("public"));

// Configurar cabeceras y CORS
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(cors());
app.use((req, res, next) => {
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
app.use("/api/ventas", authMiddleware, ventas);
app.use("/api/inventario", authMiddleware, inventario);
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
