//Modulos
import express from "express";

import { errors } from "./API/connection/error.js";

import rutasGet from "./API/routes/rutasGet.js";
import rutasPost from "./API/routes/rutasPost.js";

//Constantes
const app = express();
const PORT = process.env.PORT || 8080;

//middlewares
app.use(express.json({ limit: "500mb" }));
app.use(
  express.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(express.static("public"));

// Configurar cabeceras y cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

// RUTAS

app.use("/api/consulta", rutasGet);
app.use("/api/insert", rutasPost);

app.use(errors);

app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});
