/**
 *
 * @param {string} message
 * @param {number} code
 * @returns
 */
function error(message, code = 500) {
  let e = new Error(message);

  if (code) {
    e.statusCode = code;
  }

  return e;
}

import response from "./response.js";

async function errors(err, req, res, next) {
  const message = err.message || "Error interno";
  const status = err.statusCode || 500;

  response.error(req, res, message, status);
}

export { error, errors };
