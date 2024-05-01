export default {
  success: function (req, res, datos, status, message = "") {
    let statusCode = status || 200;
    let statusMessage = datos || "";

    res.status(status).send({
      error: false,
      codigo: statusCode,
      datos: statusMessage,
      mensaje: message,
    });
  },

  error: function (req, res, datos, status, message = "") {
    let statusCode = status || 500;
    let statusMessage = datos || "Internal server error";

    res.status(statusCode).send({
      error: true,
      codigo: statusCode,
      datos: null,
      mensaje: statusMessage,
    });
  },
};