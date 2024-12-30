//Dependencias
import { Op } from "sequelize";
import decodeToken from "../../utils/decodeToken.js";
import formatDate from "../../utils/formateDate.js";

import usuario from "./usuario.js";

export default function (sentences) {
  async function upsert(data, token, ipClient) {
    let _ip_ingreso, _usuario_ingreso;

    if (!ipClient) {
      const { ip_ingreso: ip_user, usuario_ingreso: user_ingreso } =
        decodeToken(token);

      _ip_ingreso = ip_user;
      _usuario_ingreso = user_ingreso;
    } else {
      _ip_ingreso = ipClient;
      _usuario_ingreso = null;
    }

    if (data.id) {
      const id_cliente = data.id;
      delete data.id;
      delete data.id_cliente;

      await sentences.update(
        pasteleria,
        "cliente",
        { ...data, estado_cliente: data.estado },
        { id_cliente }
      );

      await usuario(sentences).update(data);
    } else {
      await sentences.insert(pasteleria, "cliente", {
        ...data,
        ip_ingreso: _ip_ingreso,
        usuario_ingreso: _usuario_ingreso,
      });
    }

    return await sentences.rawQuery(
      `Select id_cliente from pastel.cliente where cedula = '${data.cedula}'`
    );
  }

  async function consultar({
    estado = true,
    cedula = null,
    nombre = null,
    apellido = null,
    email = null,
  }) {
    const result = [];

    let filtro = {
      estado_cliente: estado,
    };

    if (cedula) filtro.cedula = cedula;
    if (nombre) filtro.nombre = { [Op.iLike]: `${nombre}%` };
    if (apellido) filtro.apellido = { [Op.iLike]: `${apellido}%` };
    if (email) filtro.email = { [Op.iLike]: `${email}%` };

    const clientes = await sentences.select(pasteleria, "cliente", ["*"], filtro);

    for (let item of clientes) {
      const [{ id_rol = 4 } = {}] = await sentences.rawQuery(
        `Select id_rol from pastel.usuario where cedula = '${item.cedula}'`
      );

      result.push({
        id: item.id_cliente,
        id_rol,
        cedula: item.cedula,
        nombre: item.nombre,
        apellido: item.apellido,
        email: item.email,
        telefono: item.telefono,
        direccion: item.direccion,
        fecha_ingreso: formatDate(item.fecha),
        estado: item.estado_cliente,
        estadoStr: item.estado_cliente ? "Activo" : "Inactivo",
      });
    }

    return result;
  }

  async function consultarCedula({ cedula }) {
    return await sentences.rawQuery(
      `Select id_cliente as _id_cliente, estado_cliente as estado, id_cliente as id, *
        from pastel.cliente where cedula = '${cedula}'`
    );
  }

  async function consultarID(data) {
    return await sentences.rawQuery(
      `Select * from pastel.cliente where id_cliente = ${data.id_cliente}`
    );
  }

  async function consultarBusqueda({ campo, valor, estado = true }) {
    return await consultar({ [campo]: valor, estado });
  }

  return {
    //GET
    consultar,
    consultarCedula,
    consultarID,
    consultarBusqueda,
    //POST
    upsert,
  };
}
