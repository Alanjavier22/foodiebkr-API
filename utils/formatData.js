const formatData = (cotizacion) => {
  const nuevaCotizacion = {};
  const noConsiderar = ["toppings"];

  for (const key in cotizacion) {
    if (noConsiderar.some((item) => item === key)) continue;

    if (typeof cotizacion[key] === "string") {
      try {
        const parsedValue = JSON.parse(cotizacion[key]);
        if (parsedValue.nombre && parsedValue.valor) {
          nuevaCotizacion[
            key
          ] = `${parsedValue.nombre} - $${parsedValue.valor}`;
        } else {
          nuevaCotizacion[key] = cotizacion[key];
        }
      } catch (e) {
        // Si no es un JSON válido, dejar el valor original
        if (
          cotizacion[key] !== "-" &&
          cotizacion[key] !== " " &&
          cotizacion[key] !== "especificar"
        ) {
          if (key.substr(-1) === "_") {
            nuevaCotizacion[key.substr(0, key.length - 2)] = cotizacion[key];
          } else nuevaCotizacion[key] = cotizacion[key];
        }
      }
    } else {
      nuevaCotizacion[key] = cotizacion[key];
    }
  }

  return nuevaCotizacion;
};

const formatOptions = (opciones) => {
  const opcionesTransformadas = [];

  for (const key in opciones) {
    opcionesTransformadas.push({
      nombre: key,
      id_producto: opciones[key].id_producto,
      datos: formatData(opciones[key]),
    });
  }

  return opcionesTransformadas;
};

const totalEstimatedPrice = (opciones) => {
  let total = 0;

  for (const key in opciones) {
    const precio = parseFloat(opciones[key].precio_estimado);
    if (!isNaN(precio)) {
      total += precio;
    }
  }

  return total;
};

export { formatData, formatOptions, totalEstimatedPrice };
