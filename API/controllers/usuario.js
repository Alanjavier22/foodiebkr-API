//Dependencias
import bcryptjs from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

import { error } from "../connection/error.js";

//Constantes
import clientes from "./clientes.js";
import email from "./email.js";

export default function (sentences) {
  async function login(data, clientIp) {
    let { username, pass } = data;

    const _user = await sentences.selectJoin(
      pasteleria,
      "usuario",
      ["*"],
      { email: username },
      [
        {
          name: "rol",
          as: "id_rol_rol",
          required: true,
          select: ["rol"],
          // where: {},
        },
      ],
      true
    );

    if (_user.length !== 0) {
      const {
        id_usuario,
        id_rol,
        cedula,
        nombre,
        password,
        email,
        codigo_empleado,
      } = _user[0];

      let isValid = await bcryptjs.compare(pass, password);

      if (!isValid) throw error("Credenciales incorrecta");

      const token = await jwt.sign(
        {
          id_usuario,
          nombre,
          cedula,
          email,
          codigo_empleado,
          rol: _user[0]["id_rol_rol.rol"],
          id_rol,
          usuario_ingreso: nombre,
          ip_ingreso: clientIp,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: 2,
        }
      );

      return token;
    }

    throw error("Usuario no registrado", 400);
  }

  async function register(data, clientIp) {
    const password = await bcryptjs.hash(data.pass, 10);
    delete data.pass;

    const exiteUser = await sentences.rawQuery(
      `Select * from pastel.usuario where cedula = '${data.cedula}' or email = '${data.email}'`
    );

    if (exiteUser.length === 0) {
      await sentences.insert(pasteleria, "usuario", {
        ...data,
        password,
        id_rol: 4,
        ip_ingreso: clientIp,
      });

      let [{ _id_cliente = null } = {}] = await clientes(
        sentences
      ).consultarCedula(data);

      if (_id_cliente) data.id = _id_cliente;

      return await clientes(sentences).upsert(data, "", clientIp);
    }

    throw new Error("Ya existe un usuario con la cédula o correo ingresado");
  }

  async function recovery(data) {
    const exiteUser = await sentences.rawQuery(
      `Select * from pastel.usuario where email = '${data.email}'`
    );

    if (exiteUser.length !== 0) {
      return await email(sentences).recuperarPass(exiteUser[0]);
    }

    throw new Error("Correo no registrado", 201);
  }

  async function changed(data) {
    const password = await bcryptjs.hash(data.newPass, 10);

    const exiteUser = await sentences.rawQuery(
      `Select * from pastel.usuario where id_usuario = ${data.id_usuario}`
    );

    if (exiteUser.length !== 0) {
      let datos = {
        ...exiteUser[0],
        password,
      }
      
      return await update(datos);
    }

    throw new Error("No se pudo cambiar la contraseña", 201);
  }

  async function empleados() {
    return await sentences.select(
      pasteleria,
      "usuario",
      ["id_usuario", "id_rol", "cedula", "nombre", "codigo_empleado", "email"],
      { id_rol: { [Op.in]: [1, 3] } }
    );
  }

  async function update(data) {
    return await sentences.update(
      pasteleria,
      "usuario",
      {
        ...data,
      },
      { cedula: data.cedula }
    );
  }

  return {
    //GET
    empleados,
    //POST
    login,
    register,
    update,
    recovery,
    changed,
  };
}
