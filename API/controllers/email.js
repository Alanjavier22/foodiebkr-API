//Dependencias
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

export default function (sentences) {
  const htmlHeader = `
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Notificación</title>
      <style>
          table {
              width: 100%;
              border-collapse: collapse;
          }
          table, th, td {
              border: 1px solid black;
          }
          th, td {
              padding: 8px;
              text-align: left;
          }
      </style>
    </head>
    <body style="font-family: monospace; background-color: #ffffff !important">
      <div style="height: 100%; background-color: #ffffff">
        <div
          style="
            background-color: #88e3d5;
            padding: 10px 0px 10px 0px;
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
          <h1 style="color: #fff; padding: 0px 20px; font-size: 22px">
            Foodie Baker
          </h1>
        </div>
  `;

  const htmlFooter = `
        <p
          style="
            background: #88e3d5;
            color: #fff;
            padding: 20px 0px;
            font-size: 12px !important;
          "
        >
        </p>
        </div>
      </body>
    </html>
  `;

  async function sendEmail(mail_options) {
    mail_options = { ...mail_options, from: process.env.MAIL };

    console.log({
      user: process.env.MAIL,
      pass: process.env.MAILPSSWD,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL,
        pass: process.env.MAILPSSWD,
      },
    });

    // verify connection configuration
    transporter.verify(function (error, success) {
      if (error) console.log(error);
      else console.log("Server is ready to take our messages");
    });

    transporter.sendMail(mail_options, (error, info) => {
      if (error) console.log(error);
      else console.log("Email enviado!!");
    });
  }

  async function recuperarPass(usuario) {
    const { id_usuario, nombre, apellido, email } = usuario;

    const token = jwt.sign(usuario, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    const url_reset = `${process.env.URLAPP}/reset_password/${id_usuario}/${token}`;

    const mail_options = {
      to: email,
      subject: `Foodie Baker - Recuperar Clave`,
      html: `${htmlHeader}
        <div
          style="text-align: center; background-color: #fff !important; margin: auto; width: 80%"
        >
          <h1 style="color: #13a9ff; font-size: 1.7em">Cambio de contraseña</h1>
          <p style="color: #2e2d2d; font-size: 1.2em">
            Hola ${nombre} ${apellido}. Hemos recibido su solicitud de cambio de contraseña. 
            Por favor, haga clic en el siguiente botón para continuar:
          </p>
          <p>
            <a
              target="_blank"
              href="${url_reset}"
              style="
                color: #fff;
                text-decoration: none;
                background: #13a9ff;
                border: 0;
                border-radius: 5px;
                padding: 10px;
              "
            >
              Cambiar contraseña
            </a>
          </p>
          <p style="color: #2e2d2d; font-size: 1.2em">
            Ten en cuenta que este enlace caduca luego de 1 hora.
          </p>
        </div>
      ${htmlFooter}
      `,
    };

    return await sendEmail(mail_options);
  }

  async function sendNotificationCliente(
    data,
    id_cliente,
    opcion = "actualizaciones"
  ) {
    const cliente = await sentences.select(
      pasteleria,
      "cliente",
      ["cedula", "nombre", "apellido", "email"],
      { id_cliente }
    );

    if (cliente.length !== 0) {
      if (opcion === "actualizaciones") {
        viewNotificationCotizacionActualizacion({
          cliente: cliente[0],
          cotizacion: data,
        });
      }
      if (opcion === "insert") {
        viewNotificationCotizacionIngreso({
          cliente: cliente[0],
          data,
        });
      }
      if (opcion === "ventas") {
        viewNotificationVenta({
          cliente: cliente[0],
          data,
        });
      }
    }
  }

  async function sendNotification(data, opcion) {
    const usuarios = await sentences.select(
      pasteleria,
      "usuario",
      ["id_usuario", "id_rol", "cedula", "nombre", "apellido", "email"],
      // { id_rol: { [Op.in]: [1] } }
      { id_rol: { [Op.in]: [1, 3] } }
    );

    for (let usuario of usuarios) {
      if (opcion === "cotizacion") {
        await viewNotificationCotizacion({
          usuario,
          cotizacion: data.cotizacion,
        });
      }
      if (opcion === "contacto") {
        await viewNotificationContacto({ usuario, contacto: data });
      }
    }
  }

  async function viewNotificationContacto({ usuario, contacto }) {
    const mail_options = {
      to: usuario.email,
      subject: `Foodie Baker - Notificación`,
      html: `${htmlHeader}
        <div
          style="text-align: center; background-color: #fff !important; margin: auto; width: 90%"
        >
            <h1 style="color: #13a9ff; font-size: 1.7em">Notificación</h1>
            <p style="color: #2e2d2d; font-size: 1.2em; text-align: start">
                Hola ${usuario.nombre} ${usuario.apellido}, se ha recibido una solicitud de contacto.
            </p>
            <div style="color: #2e2d2d; margin-top: 30px">
            <h2 style="color: #13a9ff; font-size: 1.4em">Detalles del contacto</h2>
                <p style="color: #2e2d2d; font-size: 1.2em; text-align: start">
                    Nombre: ${contacto.nombre}
                </p>  
                <p style="color: #2e2d2d; font-size: 1.2em; text-align: start">
                    Correo: ${contacto.email}
                </p>
                <p style="color: #2e2d2d; font-size: 1.2em; text-align: start">
                    Teléfono: ${contacto.telefono}
                </p>
                <p style="color: #2e2d2d; font-size: 1.2em; text-align: start">
                    Asunto: ${contacto.asunto}
                </p>
                <p style="color: #2e2d2d; font-size: 1.2em; text-align: start">
                    Mensaje: ${contacto.mensaje}
                </p>
            </div>
        </div>
      ${htmlFooter}
      `,
    };

    return await sendEmail(mail_options);
  }

  async function viewNotificationCotizacion({ usuario, cotizacion }) {
    const mail_options = {
      to: usuario.email,
      subject: `Foodie Baker - Notificación`,
      html: `${htmlHeader}
        <div
          style="text-align: center; background-color: #fff !important; margin: auto; width: 90%"
        >
            <h1 style="color: #13a9ff; font-size: 1.7em">Notificación de productos</h1>
            <p style="color: #2e2d2d; font-size: 1.2em; text-align: start">
                Hola ${usuario.nombre} ${
        usuario.apellido
      }, se ha recibido una nuevo cotización.
            </p>
            <div style="color: #2e2d2d; margin-top: 30px">
                <p style="color: #2e2d2d; font-size: 1.2em; text-align: start">
                    Cotización: ${cotizacion.producto}
                </p>  
                <p style="color: #2e2d2d; font-size: 1.2em; text-align: start">
                    Descripción: ${cotizacion.descripcion || ""}
                </p>
            </div>
            <p style="margin: 20px  40px;">
                <a
                target="_blank"
                href="${process.env.URLAPP}/cotizaciones"
                style="
                    color: #fff;
                    text-decoration: none;
                    background: #13a9ff;
                    border: 0;
                    border-radius: 5px;
                    padding: 10px;
                "
                >
                Ir a cotizaciones
                </a>
            </p>
        </div>
      ${htmlFooter}
      `,
    };

    return await sendEmail(mail_options);
  }

  async function viewNotificationVenta({ cliente, data }) {
    // Crear el contenido HTML dinámicamente
    let initialData = `
        <p><strong>Detalle:</strong> ${data.descripcion_compra}</p>
        <p><strong>Fecha de venta:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Total:</strong> $${data.valor || "0.00"}</p>
    `;

    let tableRows = "";

    // Verificar si hay datos en json_venta
    if (data.json_venta) {
        const ventaData = JSON.parse(data.json_venta);
        const items = ventaData.datos.items;

        tableRows += `
            <table>
                <thead>
                    <tr>
                        <th>Nombre del Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Impuesto</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
        `;

        items.forEach((item) => {
            const totalValue = (parseFloat(item.unit_amount.value) + (item.tax ? parseFloat(item.tax.value) : 0)) * item.quantity;
            tableRows += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unit_amount.value}</td>
                    <td>$${item.tax ? item.tax.value : '0.00'}</td>
                    <td>$${totalValue.toFixed(2)}</td>
                </tr>
            `;
        });

        tableRows += `
                </tbody>
            </table>
        `;
    }

    const mail_options = {
        to: cliente.email,
        subject: `Foodie Baker - Notificación`,
        html: `${htmlHeader}
            <div style="text-align: center; background-color: #fff !important; margin: auto; width: 90%">
                <h1 style="color: #13a9ff; font-size: 1.7em">Notificación de Venta</h1>
                <p style="color: #2e2d2d; font-size: 1.2em; text-align: start">
                    Hola ${cliente.nombre} ${cliente.apellido}, estos son los detalles de tu venta.
                </p>
            </div>
            <div style="background-color: #fff !important; margin: auto; width: 90%">
                ${initialData}
            </div>
            <div style="text-align: center; background-color: #fff !important; margin: auto; width: 90%">
                ${tableRows}
                <p style="margin: 20px  40px;">
                    <a target="_blank" href="${process.env.URLAPP}/mis-compras"
                    style="color: #fff; text-decoration: none; background: #13a9ff; border: 0; border-radius: 5px; padding: 10px;">
                    Ir a mis compras
                    </a>
                </p>
            </div>
        ${htmlFooter}`,
    };

    return await sendEmail(mail_options);
}


  async function viewNotificationCotizacionIngreso({ cliente, data }) {
    // Crear el contenido HTML dinámicamente
    let initialData = `
        <p><strong>Producto:</strong> ${data.producto}</p>
        <p><strong>Estado:</strong> No Atendido </p>
        <p><strong>Fecha de Cotización:</strong> ${data.fecha_cotizacion}</p>
        <p><strong>Precio Estimado:</strong> $${
          data.precio_estimado || "0.00"
        }</p>
        `;

    let tableRows = "";

    // Si existen opciones, genera una tabla por cada opción
    if (data.opciones && data.opciones.length > 0) {
      data.opciones.forEach((opcion) => {
        tableRows += `
          <h2>${opcion.nombre}</h2>
          <table>
              <thead>
                  <tr>
                      <th>Nombre</th>
                      <th>Detalles</th>
                  </tr>
              </thead>
              <tbody>
          `;

            for (let key in opcion.datos) {
              if (
                ![
                  "producto",
                  "id_producto",
                  "estado",
                  "fecha_cotizacion",
                  "precio_estimado",
                  "opciones",
                ].includes(key)
              ) {
                tableRows += `
                <tr>
                    <td>${key}</td>
                    <td>${opcion.datos[key]}</td>
                </tr>
                `;
              }
            }

            tableRows += `
              </tbody>
          </table>
          `;
          });
        } else {
          // Si no existen opciones, genera la tabla con el resto de los datos
          for (let key in data) {
            if (
              ![
                "producto",
                "id_producto",
                "estado",
                "fecha_cotizacion",
                "precio_estimado",
                "opciones",
              ].includes(key)
            ) {
              tableRows += `
              <tr>
                  <td>${key}</td>
                  <td>${data[key]}</td>
              </tr>
              `;
            }
          }

        tableRows = `
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Detalles</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
      `;
    }

    const mail_options = {
      to: cliente.email,
      subject: `Foodie Baker - Notificación`,
      html: `${htmlHeader}
            <div
                style="text-align: center; background-color: #fff !important; margin: auto; width: 90%"
              >
                  <h1 style="color: #13a9ff; font-size: 1.7em">Notificación de cotización</h1>
                  <p style="color: #2e2d2d; font-size: 1.2em; text-align: start">
                      Hola ${cliente.nombre} ${cliente.apellido}, estos son los detalles de tu cotización.
                  </p>
            </div>
          <div
            style="background-color: #fff !important; margin: auto; width: 90%"
          >
            ${initialData}
          </div>
          <div
            style="text-align: center; background-color: #fff !important; margin: auto; width: 90%"
          >
            ${tableRows}
            <p style="margin: 20px  40px;">
                <a
                target="_blank"
                href="${process.env.URLAPP}/mis-cotizaciones"
                style="
                    color: #fff;
                    text-decoration: none;
                    background: #13a9ff;
                    border: 0;
                    border-radius: 5px;
                    padding: 10px;
                "
                >
                Ir a mis cotizaciones
                </a>
            </p>
          </div>
      ${htmlFooter}
      `,
    };

    return await sendEmail(mail_options);
  }

  async function viewNotificationCotizacionActualizacion({
    cliente,
    cotizacion,
  }) {
    const mail_options = {
      to: cliente.email,
      subject: `Foodie Baker - Notificación`,
      html: `${htmlHeader}
        <div
          style="text-align: center; background-color: #fff !important; margin: auto; width: 90%"
        >
            <h1 style="color: #13a9ff; font-size: 1.7em">Notificación de cotización</h1>
            <p style="color: #2e2d2d; font-size: 1.2em; text-align: start">
                Hola ${cliente.nombre} ${
        cliente.apellido
      }, se ha recibido una actualización sobre tu cotización realizada.
            </p>
            <div style="color: #2e2d2d; margin-top: 30px">
                <p style="color: #13a9ff; font-size: 1.2em; text-align: start">
                    Cotización: <span style="color: #2e2d2d;">${
                      cotizacion.producto
                    } </span>
                </p>
                ${
                  cotizacion.atendido_por &&
                  `<p style="color: #13a9ff; font-size: 1.2em; text-align: start">
                      Atendido por: <span style="color: #2e2d2d;">${
                        cotizacion.atendido_por || ""
                      }</span>
                    </p>`
                }
                <p style="color: #13a9ff; font-size: 1.2em; text-align: start">
                    Estado de la cotización: <span style="color: #2e2d2d;">${
                      cotizacion.estado === "A" ? "Atendido" : "No Atendido"
                    }</span>
                </p>
                <p style="color: #13a9ff; font-size: 1.2em; text-align: start">
                    Estado del envio: <span style="color: #2e2d2d;">${
                      cotizacion.envio === "Ac"
                        ? "Aceptado"
                        : cotizacion.envio === "R"
                        ? "Rechazado"
                        : "En espera del comprobate"
                    }</span>
                </p>
                ${
                  cotizacion.observacion_rechazo &&
                  ` <p style="color: #13a9ff; font-size: 1.2em; text-align: start">
                      Motivo del rechazo: <span style="color: #2e2d2d;"> ${cotizacion.observacion_rechazo}</span>
                    </p>`
                }
                ${
                  cotizacion.precio_final &&
                  `<p style="color: #13a9ff; font-size: 1.2em; text-align: start">
                      Precio final: <span style="color: #2e2d2d;">${
                        cotizacion.precio_final || "$0.00"
                      }</span>
                    </p>`
                }
                  <p style="color: #13a9ff; font-size: 1.2em; text-align: start; margin-top: 5px, margin-bottom: 7px">
                      ${
                        cotizacion.envio
                          ? ""
                          : "**No olvides de enviarnos el comprobante de pago para pasar tu estado de envio a aceptado."
                      }
                  </p>
                
            </div>
            <p style="margin: 20px  40px;">
                <a
                target="_blank"
                href="${process.env.URLAPP}/mis-cotizaciones"
                style="
                    color: #fff;
                    text-decoration: none;
                    background: #13a9ff;
                    border: 0;
                    border-radius: 5px;
                    padding: 10px;
                "
                >
                Ir a mis cotizaciones
                </a>
            </p>
        </div>
      ${htmlFooter}
      `,
    };

    return await sendEmail(mail_options);
  }

  async function sendNotificationCodigoDescuento(data, oferta) {
    const mail_options = {
      to: data.email,
      subject: `Foodie Baker - Notificación`,
      html: `${htmlHeader}
        <div
          style="text-align: center; background-color: #fff !important; margin: auto; width: 90%"
        >
            <h1 style="color: #13a9ff; font-size: 1.7em">Notificación</h1>
            <p style="color: #2e2d2d; font-size: 1.2em; text-align: start">
                Hola ${data.nombre_completo}, has sido seleccionado para obtener un código de descuento!.
            </p>
            <div style="color: #2e2d2d; margin-top: 30px">
                <p style="color: #2e2d2d; font-size: 1.2em; text-align: start">
                    Código de descuento: <span style="color: #13a9ff;"> ${oferta.codigo_descuento} </span>
                </p>  
                <p style="color: #2e2d2d; font-size: 1.2em; text-align: start">
                    Este código te brindará una rebaja del ${oferta.porcentaje_descuento}% en tu próxima compra.
                </p>
                <p style="color: #2e2d2d; font-size: 1.2em; text-align: start">
                    Este código tiene validez hasta ${oferta._fecha_fin_oferta}.
                </p>
            </div>
        </div>
      ${htmlFooter}
      `,
    };

    return await sendEmail(mail_options);
  }

  return {
    //GET
    sendNotificationCodigoDescuento,
    recuperarPass,
    viewNotificationCotizacionActualizacion,
    //POST
    sendNotification,
    sendNotificationCliente,
  };
}
