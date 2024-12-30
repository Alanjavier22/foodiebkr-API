//Dependencias
import decodeToken from "../../utils/decodeToken.js";
import formatDate from "../../utils/formateDate.js";

//Constantes
import clientes from "./clientes.js";
import inventario from "./inventario.js";
import paypal from "./paypal.js";
import auditoria from "./auditoria.js";
import { Op } from "sequelize";
import email from "./email.js";

export default function (sentences) {
  //#################----FUNCIONES PRINCIPALES----#################
  async function upsert(data, token) {
    const { ip_ingreso, usuario_ingreso } = decodeToken(token);

    const id_venta = data.id_venta || null;
    delete data.id_venta;

    const proceso = id_venta ? "Actualización" : "Ingreso";

    if (id_venta) {
      await sentences.update(
        "pastel",
        "venta",
        {
          ...data,
          ip_ingreso,
          usuario_ingreso,
        },
        { id_venta }
      );
    } else {
      await sentences.insert("pastel", "venta", {
        ...data,
        ip_ingreso,
        usuario_ingreso,
      });
    }

    return await auditoria(sentences).insert(
      {
        seccion: "Ventas",
        proceso,
        descripcion: `${proceso} de datos para ventas por ${data.realizado_por}`,
        detalles: JSON.stringify(data),
      },
      token
    );
  }

  async function consultar(
    { realizado_por, estado, fechaInicio, fechaFin },
    token
  ) {
    const { id_rol, cedula } = decodeToken(token);
    let filtro = {};

    let filtroCliente = Number(id_rol) === 4 ? { cedula } : {};

    if (fechaInicio !== "-") {
      // Convertir la cadena de fecha a un objeto Date
      const fechaObjeto = new Date(fechaInicio);

      // Restar un día (86400000 milisegundos)
      fechaObjeto.setDate(fechaObjeto.getDate() + 1);

      // Formatear de nuevo la fecha a "YYYY-MM-DD"
      const nuevaFecha = fechaObjeto.toISOString().split("T")[0];

      filtro = {
        fecha: { [Op.between]: [nuevaFecha, fechaFin] },
      };
    }

    let ventas = await sentences.selectJoin(
      "pastel",
      "venta",
      ["*"],
      { realizado_por, ...filtro },
      [
        {
          name: "cliente",
          as: "id_cliente_cliente",
          required: true,
          select: ["nombre"],
          where: filtroCliente,
        },
      ],
      true,
      [
        // ["id_venta", "desc"],
        ["fecha", "desc"],
      ]
    );

    if (realizado_por === "Cotizacion") return ventas.map(processVenta);

    if (realizado_por === "Tienda") {
      let result = [];

      for (let item of ventas) {
        const { datos, orderData, datosCliente } = JSON.parse(item.json_venta);

        const { status, purchase_units } = orderData;
        const { value, breakdown } = purchase_units[0].amount;

        const estado =
          Number(id_rol) === 4 ? status : datos.estado?.replace("_", " ");

        let items = {
          cursos: [],
          inventario: [],
          producto: [],
        };

        datos.items.forEach((item) => {
          if (item.description === "cursos") {
            items.cursos.push(item);
          } else if (item.description === "inventario") {
            items.inventario.push(item);
          } else if (item.description === "producto") {
            items.producto.push(item);
          }
        });

        // Eliminar propiedades con arreglos vacíos
        Object.keys(items).forEach((key) => {
          if (items[key].length === 0) {
            delete items[key];
          }
        });

        result.push({
          ...item,
          seccion: datos.seccion || "producto",
          datosTotales: {
            total: value,
            impuesto: breakdown?.tax_total?.value || "0",
            descuento: breakdown?.discount?.value || null,
            subtotal: breakdown?.item_total?.value || "0",
          },
          items,
          valor: `$${item.valor}`,
          estado,
          fechaStr: formatDate(item.fecha),
          json_venta: datos,
          datosCliente,
        });
      }

      if (estado && estado !== "-") {
        result = result.filter((item) => item.estado === estado);
      }

      return result;
    }
  }

  //#################----FUNCIONES PARA COTIZACIONES----#################
  async function insertFromCotizacion({ id_cotizacion }, token) {
    let cotizaciones = await sentences.select(
      "pastel",
      "cotizacion",
      ["*"],
      { id_cotizacion },
      [["id_cotizacion", "DESC"]]
    );

    const {
      precio_final = "0",
      producto,
      descripcion,
    } = JSON.parse(cotizaciones[0].json_cotizacion);

    const valor = precio_final.replace(/[,$]/g, "");

    const data = {
      id_cliente: cotizaciones[0].id_cliente,
      json_venta: JSON.stringify(cotizaciones),
      descripcion_compra: `Cotización - ${producto} ${
        descripcion ? `(${descripcion})` : ""
      }`,
      valor: parseFloat(valor),
      estado_venta: true,
      realizado_por: "Cotizacion",
    };

    if (Number(cotizaciones[0].id_cotizacion) === Number(id_cotizacion)) {
      const [{ id_venta = null } = {}] = await buscarId({
        id_cotizacion: cotizaciones[0].id_cotizacion,
      });

      if (id_venta) data.id_venta = id_venta;
    }

    return await upsert(data, token);
  }

  async function buscarId(data) {
    const { id_cotizacion } = data;

    return await sentences.rawQuery(`
        SELECT id_venta
        FROM pastel.venta,
            jsonb_array_elements(json_venta::jsonb) AS cot
        WHERE cot->>'id_cotizacion' = '${id_cotizacion}' and realizado_por = 'Cotizacion';
      `);
  }

  //#################----FUNCIONES PARA TIENDA----#################

  async function insertFromStore(
    orderData,
    datosCliente,
    token,
    id_venta = null
  ) {
    const { id, purchase_units } = orderData;

    await clientes(sentences).upsert(datosCliente, token, null);

    const [
      {
        description,
        amount: { value },
        items,
        payments: { captures },
      },
    ] = purchase_units;

    await inventario(sentences).actualizarStocks(items, token);

    let estado = captures[0].status;
    if (captures[0].status_details) estado = captures[0].status_details.reason;

    const json_venta = {
      orderData,
      datosCliente,
      datos: {
        orderID: id,
        description,
        value,
        items,
        captures,
        estado,
      },
    };

    const data = {
      id_cliente: datosCliente._id_cliente,
      json_venta: JSON.stringify(json_venta),
      descripcion_compra: description,
      valor: parseFloat(value),
      estado_venta: true,
      realizado_por: "Tienda",
    };

    if (id_venta) data.id_venta = id_venta;

    await upsert(data, token);

    await email(sentences).sendNotificationCliente(
      data,
      data.id_cliente,
      "ventas"
    );

    return [1];
  }

  async function actualizarEstados(token) {
    let ventas = await sentences.selectJoin(
      "pastel",
      "venta",
      ["*"],
      { realizado_por: "Tienda" },
      [
        {
          name: "cliente",
          as: "id_cliente_cliente",
          required: true,
          select: ["nombre"],
          where: {},
        },
      ],
      true,
      [["id_venta", "desc"]]
    );

    for (let item of ventas) {
      const { datos, datosCliente } = JSON.parse(item.json_venta);
      const estado = datos.estado?.replace("_", " ").split(" ")[0];

      //Consulta los datos del paypal
      const newOrderData = await paypal(sentences).checkoutOrder(datos);
      const [{ payments }] = newOrderData.purchase_units;

      if (
        payments.captures[0].status === "COMPLETED" &&
        payments.captures[0].status !== estado
      ) {
        await insertFromStore(
          newOrderData,
          {
            ...datosCliente,
            _id_cliente: item.id_cliente,
            id: item.id_cliente,
          },
          token,
          item.id_venta
        );
      }
    }

    return await auditoria(sentences).insert(
      {
        seccion: "Ventas",
        proceso: "Actualización",
        descripcion: `Actualización de estados de las ventas realizadas por paypal`,
        detalles: JSON.stringify({ ventas_procesadas: ventas.length }),
      },
      token
    );
  }

  //#################----FUNCIONES----#################

  const formatCotizacion = (item) => {
    const jsonCotizacion = JSON.parse(item.json_cotizacion);
    const estadoStr =
      jsonCotizacion.estado === "Nt" ? "No Atendido" : "Atendido";
    return {
      ...item,
      estado: estadoStr,
      nombre_producto: jsonCotizacion.producto,
      id_producto: jsonCotizacion.id_producto,
    };
  };

  const processVenta = (item) => {
    let json_venta = JSON.parse(item.json_venta).map(formatCotizacion);

    let estadoStr = json_venta.length ? json_venta[0].estado : "";
    let id_cotizacion = json_venta.length ? json_venta[0].id_cotizacion : "";
    let nombre_producto = json_venta.length
      ? json_venta[0].nombre_producto
      : "";
    let id_producto = json_venta.length ? json_venta[0].id_producto : "";

    return {
      ...item,
      valor: `$${item.valor}`,
      estado: estadoStr,
      fechaStr: formatDate(item.fecha),
      id_cotizacion,
      id_producto,
      nombre_producto,
      json_venta,
    };
  };

  return {
    //GET
    consultar,
    actualizarEstados,
    //POST
    upsert,
    insertFromCotizacion,
    insertFromStore,
  };
}
