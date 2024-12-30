//Dependencias
import decodeToken from "../../utils/decodeToken.js";

//Constantes
import clientes from "./Clientes.js";
import email from "./email.js";
import ventas from "./ventas.js";
import auditoria from "./auditoria.js";

import {
  formatData,
  formatOptions,
  totalEstimatedPrice,
} from "../../utils/formatData.js";

import _fieldRequired from "../data/_fieldRequired.js";
import { uploadImg } from "./FileController.js";

export default function (sentences) {
  async function insertar(data, clientIp) {
    const { cliente, cotizacion } = data;

    const _clientes = clientes(sentences);

    let [{ _id_cliente = null, estado = false } = {}] =
      await _clientes.consultarCedula(cliente);

    if (_id_cliente) {
      cliente.id = _id_cliente;
      cliente.estado = estado;
      delete cliente.apellido;
      delete cliente.nombre;
      delete cliente.estado_cliente;
    }

    const [{ id_cliente = null } = {}] = await _clientes.upsert(
      cliente,
      "",
      clientIp
    );
    _id_cliente = id_cliente;

    let cotizacionFormat = null;

    if (Number(cotizacion.id_producto) === 5) {
      const { opciones = {} } = cotizacion;

      const opcionesTransformadas = formatOptions(opciones);
      const totalPrecioEstimado = totalEstimatedPrice(opciones);

      cotizacion.opciones = opcionesTransformadas;
      cotizacion["precio_estimado"] = totalPrecioEstimado;

      cotizacionFormat = cotizacion;
    } else {
      cotizacionFormat = formatData(cotizacion);
    }

    const { imagen = null, descripcion = null } = cotizacion;

    const { url, blob_name } = await uploadImg({
      imagen: imagen,
      blob_name: data.blob_name,
    });

    delete cotizacion.imagen;
    delete cotizacionFormat.imagen;

    await sentences.insert(pasteleria, "cotizacion", {
      id_cliente: _id_cliente,
      foto: url,
      blob_name,
      descripcion,
      json_cotizacion: JSON.stringify(cotizacionFormat),
      estado_cotizacion: "Nt",
      ip_ingreso: clientIp,
    });

    await email(sentences).sendNotification(data, "cotizacion");

    await email(sentences).sendNotificationCliente(
      cotizacionFormat,
      _id_cliente,
      "insert"
    );

    return [1];
  }

  async function actualizar(data, token) {
    const { usuario_ingreso: atendido_por } = decodeToken(token);

    const estado_cotizacion = data.envio !== "-" ? data.envio : data.estado;
    const usuario_ingreso = data.estado !== "Nt" ? atendido_por : null;

    const id_cotizacion = data.id;
    delete data.id;

    let jsonUpdate = await jsonCotizacion(id_cotizacion);

    jsonUpdate = {
      ...jsonUpdate,
      estado: data.estado,
      envio: data.estado === "A" && data.envio !== "-" ? data.envio : null,
      precio_final:
        data.envio === "Ac"
          ? "$" + data.precio_final?.replace(/\$/g, "")
          : data.precio_final?.replace(/\$/g, ""),
      atendido_por: usuario_ingreso,
      observacion_rechazo: data.observacion_rechazo || "",
    };

    await sentences.update(
      pasteleria,
      "cotizacion",
      {
        json_cotizacion: JSON.stringify(jsonUpdate),
        estado_cotizacion,
        // usuario_ingreso,
      },
      { id_cotizacion }
    );

    if (data.estado === "A") {
      await sentences.update(
        pasteleria,
        "cliente",
        { estado_cliente: true },
        { id_cliente: data.id_cliente }
      );
    }

    if (data.envio === "Ac") {
      await ventas(sentences).insertFromCotizacion({ id_cotizacion }, token);
    }

    await email(sentences).sendNotificationCliente(jsonUpdate, data.id_cliente);

    return await auditoria(sentences).insert(
      {
        seccion: "Cotización",
        proceso: "Actualización",
        descripcion: `Actualización de cotización ${
          jsonUpdate.producto || ""
        } - ${id_cotizacion || ""}`,
        detalles: JSON.stringify(data),
      },
      token
    );
  }

  async function cotizacionesRealizadas(token) {
    const { cedula } = decodeToken(token);

    let cotizaciones = await sentences.selectJoin(
      pasteleria,
      "cotizacion",
      ["json_cotizacion"],
      {},
      [
        {
          name: "cliente",
          as: "id_cliente_cliente",
          required: true,
          select: ["nombre"],
          where: { cedula },
        },
      ],
      true,
      [["id_cotizacion", "asc"]]
    );

    const uniqueCotizaciones = new Set();

    const result = cotizaciones
      .map((item) => {
        const jsonCotizacion = JSON.parse(item.json_cotizacion);

        return {
          id_producto: jsonCotizacion.id_producto,
          nombre: jsonCotizacion.producto,
        };
      })
      .filter((item) => {
        const identifier = `${item.id_producto}-${item.nombre}`;
        if (uniqueCotizaciones.has(identifier)) {
          return false;
        } else {
          uniqueCotizaciones.add(identifier);
          return true;
        }
      });

    return result;
  }

  async function consultar(token) {
    const { nombre, id_rol, cedula } = decodeToken(token);

    let cotizaciones = await sentences.select(
      pasteleria,
      "cotizacion",
      ["id_cotizacion", "id_cliente", "json_cotizacion"],
      {},
      [["id_cotizacion", "DESC"]]
    );

    cotizaciones = cotizaciones.map((item) => {
      const jsonCotizacion = JSON.parse(item.json_cotizacion);

      const envioStr = jsonCotizacion.envio === "Ac" ? "Aceptado" : "Rechazado";

      return {
        id_cotizacion: item.id_cotizacion,
        id_cliente: item.id_cliente,
        id_producto: jsonCotizacion.id_producto,
        producto: jsonCotizacion.producto,
        precio_estimado: jsonCotizacion.precio_estimado || "0.00",
        cantidad: jsonCotizacion.cantidad,
        pisos: jsonCotizacion.pisos,
        estado: jsonCotizacion.estado === "Nt" ? "No Atendido" : "Atendido",
        envio: jsonCotizacion.envio ? envioStr : null,
        atendido_por: jsonCotizacion?.atendido_por?.trim() ?? null,
        imagenPago: jsonCotizacion?.imagenPago ?? null,
      };
    });

    if (Number(id_rol) === 3) {
      return cotizaciones.filter(
        (item) => item.atendido_por == null || item.atendido_por == nombre
      );
    }

    if (Number(id_rol) === 4) {
      let [{ _id_cliente }] = await clientes(sentences).consultarCedula({
        cedula,
      });

      return cotizaciones.filter((item) => item.id_cliente === _id_cliente);
    }

    return cotizaciones;
  }

  async function consultarProducto(params, token) {
    const { id_producto, estado, envio, atendido_por } = params;

    let response = await consultar(token);

    if (atendido_por !== "0")
      response = response.filter(
        (item) => item.atendido_por === atendido_por?.trim()
      );

    if (id_producto)
      response = response.filter(
        (item) => Number(item.id_producto) === Number(id_producto)
      );

    if (estado !== "0")
      response = response.filter((item) => item.estado === estado);

    if (envio !== "0")
      response = response.filter((item) => item.envio === envio);

    return response;
  }

  async function consultarDetalles({ id }) {
    const cotizacion = await sentences.select(pasteleria, "cotizacion", ["*"], {
      id_cotizacion: id,
    });

    const [{ json_cotizacion, id_cliente, foto }] = cotizacion;

    const jsonCotizacion = JSON.parse(json_cotizacion);

    const _cotizacion = {
      id,
      id_cliente,
      imagen: foto,
      ...jsonCotizacion,
    };

    const getCliente = await clientes(sentences).consultarID({ id_cliente });

    const _clienteDt = {
      id: id_cliente,
      ...getCliente[0],
    };

    const adicionales = await consultaCamposRequeridos(jsonCotizacion);

    return {
      cliente: _clienteDt,
      cotizacion: _cotizacion,
      adicionales,
    };
  }

  async function jsonCotizacion(id_cotizacion) {
    const [{ json_cotizacion } = {}] = await sentences.rawQuery(
      `Select json_cotizacion from pasteleria.cotizacion where id_cotizacion = ${id_cotizacion}`
    );

    return JSON.parse(json_cotizacion);
  }

  async function consultaCamposRequeridos({ id_producto }) {
    let adicionales = await sentences.rawQuery(`
      select a.nombre, a.id_adicional as key 
      from pasteleria.adicional a
      inner join pasteleria.producto p
        on p.id_producto = a.id_producto
      where a.id_producto = ${id_producto}
      order by a.nombre asc
    `);

    return adicionales.map((item) => item.nombre);
  }

  async function adicionales({ id_producto, nombre }) {
    const result = [];
    let fieldRequired = {};

    const _adicionales = await sentences.selectJoin(
      pasteleria,
      "adicional",
      ["id_adicional", "nombre", "requerido", "descripcion"],
      { id_producto, estado_adicional: true },
      [
        {
          name: "producto",
          as: "id_producto_producto",
          required: true,
          select: ["id_producto", "nombre"],
          // where: {},
        },
      ],
      true,
      [
        ["id_adicional", "ASC"],
        ["requerido", "ASC"],
      ]
    );

    for (let adicional of _adicionales) {
      const _nombre = adicional.nombre.toLowerCase();

      const _adicional = await sentences.select(
        pasteleria,
        "categoria_adicional",
        [
          ["id_categoria_adicional", "key"],
          "id_categoria_adicional",
          "descripcion",
          "nombre",
          "valor",
        ],
        { id_adicional: adicional.id_adicional },
        [["id_categoria_adicional", "ASC"]]
      );

      if (adicional.requerido) {
        fieldRequired[_nombre] = "";
      }

      result.push({
        nombre: _nombre,
        key: adicional.id_adicional,
        requerido: adicional.requerido,
        descripcion: adicional.descripcion,
        id_adicional: adicional.id_adicional,
        opciones: _adicional,
      });
    }

    const _field =
      _fieldRequired[`_producto_${id_producto}`] ||
      _fieldRequired[`_producto_0`];

    if (_field) {
      fieldRequired = { ...fieldRequired, ..._field };
    }

    return {
      fieldRequired: {
        ...fieldRequired,
        id_producto: Number(id_producto),
        producto: nombre,
      },
      adicional: result,
    };
  }

  async function categorias({ id_producto, nombre }) {
    const result = [];
    let fieldRequired = {};

    const _subproductos = await sentences.selectJoin(
      pasteleria,
      "subproducto",
      ["id_subproducto", "nombre", "estado_subproducto"],
      { id_producto },
      [
        {
          name: "producto",
          as: "id_producto_producto",
          required: true,
          select: ["id_producto", "nombre"],
          // where: {},
        },
      ],
      true,
      [["id_subproducto", "ASC"]]
    );

    for (let subproducto of _subproductos) {
      const _nombre = subproducto.nombre.toLowerCase();
      const id_subproducto = subproducto.id_subproducto;

      const _categoria = await sentences.select(
        pasteleria,
        "categoria",
        [["id_categoria", "key"], "id_categoria", "nombre", "valor"],
        { id_subproducto, id_producto },
        [["id_categoria", "ASC"]]
      );

      // if (subproducto.requerido) {
      //   fieldRequired[_nombre] = "";
      // }

      result.push({
        nombre: _nombre,
        key: subproducto.id_subproducto,
        // requerido: subproducto.requerido,
        id_subproducto: subproducto.id_subproducto,
        opciones: _categoria,
      });
    }

    const _field =
      _fieldRequired[`_producto_${id_producto}`] ||
      _fieldRequired[`_producto_0`];

    if (_field) {
      fieldRequired = { ...fieldRequired, ..._field };
    }

    return {
      fieldRequired: {
        ...fieldRequired,
        id_producto: Number(id_producto),
        producto: nombre,
      },
      categoria: result,
    };
  }

  async function updateComprobante(
    { id_cotizacion, imagen, blobNamePago },
    token
  ) {
    let cotizaciones = await sentences.select(
      pasteleria,
      "cotizacion",
      ["id_cotizacion", "id_cliente", "json_cotizacion"],
      { id_cotizacion },
      [["id_cotizacion", "DESC"]]
    );

    const jsonCotizacion = JSON.parse(cotizaciones[0].json_cotizacion);

    const { url, blob_name } = await uploadImg({
      imagen: imagen,
      blob_name: blobNamePago,
    });

    let newJsonCotizacion = {
      ...jsonCotizacion,
      imagenPago: url,
      blobNamePago: blob_name,
    };

    return await sentences.update(
      pasteleria,
      "cotizacion",
      {
        json_cotizacion: JSON.stringify(newJsonCotizacion),
      },
      { id_cotizacion }
    );
  }

  return {
    //GET
    consultar,
    cotizacionesRealizadas,
    consultarProducto,
    consultarDetalles,
    consultaCamposRequeridos,
    adicionales,
    categorias,
    //POST
    insertar,
    actualizar,
    updateComprobante,
  };
}
