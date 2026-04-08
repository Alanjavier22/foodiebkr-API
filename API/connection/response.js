export default {
  success: function (req, res, datos, status, message = "") {
    let statusCode = status || 200;
    // Forzar [] si datos es null o undefined, de acuerdo a la Fase 2
    let statusMessage = (datos === null || datos === undefined) ? [] : datos;

    res.status(statusCode).send({
      datos: statusMessage,
      error: false,
      mensaje: message,
    });
  },

  error: function (req, res, datos, status, message = "") {
    let statusCode = status || 500;
    let fallbackMessage = datos || "Error interno";
    let finalMessage = message ? message : (typeof fallbackMessage === 'string' ? fallbackMessage : "Error en el servidor");

    res.status(statusCode).send({
      datos: [],
      error: true,
      mensaje: finalMessage,
    });
  },
};