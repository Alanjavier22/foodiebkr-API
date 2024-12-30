//@ts-check
import jwt from "jsonwebtoken";
import { error } from "../API/connection/error.js";

export default function decodeToken(token) {
  if (!token) {
    throw error("Se requiere token de autenticación", 401);
  }

  if (token.toLowerCase().includes("bearer ")) {
    token = token.split(" ")[1];
  }
  let decoded = jwt.decode(token);
  // console.log(decoded);
  if (!decoded) {
    throw error("Token no valido", 401);
  }
  let {
    // @ts-ignore
    id_usuario,
    // @ts-ignore
    id_rol,
    // @ts-ignore
    usuario_ingreso,
    // @ts-ignore
    ip_ingreso,
    // @ts-ignore
    rol,
    // @ts-ignore
    nombre,
    // @ts-ignore
    cedula,
    // @ts-ignore
    jti,
    // @ts-ignore
    expires_in,
    // @ts-ignore
    iat,
    // @ts-ignore
    exp,
  } = decoded;

  return {
    id_usuario,
    id_rol,
    rol,
    nombre,
    cedula,
    usuario_ingreso,
    ip_ingreso,
    jti,
    expires_in,
    iat,
    exp,
  };
}
