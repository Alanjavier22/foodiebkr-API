//Dependencias
import { Op } from "sequelize";
import decodeToken from "../../utils/decodeToken.js";
import formatDate from "../../utils/formateDate.js";
import formatDatev2 from "../../utils/formatDatev2.js";

//Constantes
import clientes from "./clientes.js";
import email from "./email.js";
import auditoria from "./auditoria.js";

export default function (sentences) {
  async function upsert(data, token) {
    const { ip_ingreso, usuario_ingreso } = decodeToken(token);

    const proceso = data.id_oferta ? "Actualización" : "Ingreso";

    data.ip_ingreso = ip_ingreso;
    data.usuario_ingreso = usuario_ingreso;
    data.porcentaje_descuento = Number(data.porcentaje_descuento || "0");

    if (data.id_oferta) {
      const id_oferta = data.id_oferta;
      delete data.id_oferta;
      await sentences.update(pasteleria, "oferta", data, { id_oferta });
    } else {
      const ofertas = await sentences.select(pasteleria, "oferta", ["*"], {
        codigo_descuento: data.codigo_descuento,
      });

      if (ofertas.length !== 0)
        throw new Error("Código de descuento ya registrado!", 201);

      await sentences.insert(pasteleria, "oferta", data);
    }

    return await auditoria(sentences).insert(
      {
        seccion: "Oferta",
        proceso,
        descripcion: `${proceso} de código de descuento ${data.codigo_descuento}`,
        detalles: JSON.stringify(data),
      },
      token
    );
  }

  async function consultar({ codigo }, token) {
    const { cedula } = decodeToken(token);
    const fecha_actual = new Date();

    const oferta = await sentences.select(pasteleria, "oferta", ["*"], {
      codigo_descuento: codigo,
      fecha_fin_oferta: { [Op.gte]: fecha_actual },
      fecha_inicio_oferta: { [Op.lte]: fecha_actual },
    });

    if (oferta.length !== 0) {
      const [{ id }] = await clientes(sentences).consultarCedula({ cedula });

      const codigoRegistrado = await sentences.select(
        pasteleria,
        "codigo_descuento_cliente",
        ["*"],
        {
          id_cliente: id,
          codigo_descuento: codigo,
        }
      );

      if (codigoRegistrado.length !== 0)
        throw new Error("Código ya ha sido utilizado", 201);

      return { datos: oferta[0].porcentaje_descuento };
    }

    throw new Error("Código de oferta no existente", 201);
  }

  async function actualizarOfertaCliente({ codigo = null }, token) {
    const { cedula } = decodeToken(token);

    if (codigo) {
      const [{ id }] = await clientes(sentences).consultarCedula({ cedula });

      const codigoRegistrado = await sentences.select(
        pasteleria,
        "codigo_descuento_cliente",
        ["*"],
        {
          id_cliente: id,
          codigo_descuento: codigo,
        }
      );

      if (codigoRegistrado.length === 0) {
        return await sentences.insert(pasteleria, "codigo_descuento_cliente", {
          id_cliente: id,
          codigo_descuento: codigo,
        });
      }
    }
  }

  async function ofertasRegistradas() {
    const ofertas = await sentences.select(pasteleria, "oferta", ["*"], {}, [
      ["fecha_inicio_oferta", "asc"],
    ]);

    return ofertas.map((item) => ({
      ...item,
      estadoStr: item.estado_oferta ? "Activo" : "Inactivo",
      _fecha_fin_oferta: formatDate(item.fecha_fin_oferta),
      _fecha_inicio_oferta: formatDate(item.fecha_inicio_oferta),
      fecha_fin_oferta: formatDatev2(item.fecha_fin_oferta),
      fecha_inicio_oferta: formatDatev2(item.fecha_inicio_oferta),
    }));
  }

  async function consultarCliente() {
    // precio_estimado --Esto es valor gastado pero por motivos de front se cambia el nombre
    const comproMas = await sentences.rawQuery(`
      SELECT
        c.id_cliente as id,
        c.id_cliente,
        CONCAT(c.nombre, ' ', c.apellido) AS nombre_completo,
        c.telefono,
        c.email,
        SUM(v.valor) AS precio_estimado
      FROM
          pasteleria.cliente c
      JOIN
          pasteleria.venta v ON c.id_cliente = v.id_cliente
      GROUP BY
          c.id_cliente, nombre_completo, c.telefono, c.email
      ORDER BY precio_estimado DESC;
    `);

    let ultimosRegistrados = await sentences.rawQuery(`
      SELECT
          id_cliente as id,
          id_cliente,
          CONCAT(nombre, ' ', apellido) AS nombre_completo,
          telefono,
          email,
          fecha
      FROM
          pasteleria.cliente
      ORDER BY
          fecha DESC
      LIMIT 10;
    `);

    ultimosRegistrados = ultimosRegistrados.map((item) => ({
      ...item,
      fecha: formatDate(item.fecha),
    }));

    return { comproMas, ultimosRegistrados };
  }

  async function enviarCodigoDescuento(data, token) {
    const { selectedRows, codigo_descuento } = data;

    let oferta = await sentences.select(pasteleria, "oferta", ["*"], {
      codigo_descuento,
    });

    oferta = oferta.map((item) => ({
      ...item,
      _fecha_fin_oferta: formatDate(item.fecha_fin_oferta),
      _fecha_inicio_oferta: formatDate(item.fecha_inicio_oferta),
    }));

    for (let item of selectedRows) {
      await email(sentences).sendNotificationCodigoDescuento(item, oferta[0]);
    }

    return await auditoria(sentences).insert(
      {
        seccion: "Oferta",
        proceso: "Asignación",
        descripcion: `Enviar códigos de descuento a los clientes seleccionados`,
        detalles: JSON.stringify(data),
      },
      token
    );
  }

  return {
    //GET
    consultar,
    ofertasRegistradas,
    consultarCliente,
    //POST
    upsert,
    actualizarOfertaCliente,
    enviarCodigoDescuento,
  };
}
