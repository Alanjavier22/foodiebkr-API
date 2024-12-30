// Función para crear datos del gráfico
const createChartData = (labels, dataValues, label) => ({
  labels: labels,
  datasets: [
    {
      label: label.toUpperCase(),
      data: dataValues,
      // backgroundColor: "rgba(75,192,192,0.4)",
      // borderColor: "rgba(75,192,192,1)",
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(255, 159, 64, 0.2)",
        "rgba(255, 205, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(54, 162, 235, 0.2)",
      ],
      borderColor: [
        "rgb(255, 99, 132)",
        "rgb(255, 159, 64)",
        "rgb(255, 205, 86)",
        "rgb(75, 192, 192)",
        "rgb(54, 162, 235)",
      ],
      borderWidth: 1,
    },
  ],
});

export default function (sentences) {
  // Función para ejecutar la consulta y transformar los datos
  const fetchDataAndTransform = async (
    query,
    labelMapper,
    valueMapper,
    chartLabel
  ) => {
    const data = await sentences.rawQuery(query);
    const labels = data.map(labelMapper);
    const dataValues = data.map(valueMapper);

    return createChartData(labels, dataValues, chartLabel);
  };

  async function mayorCompra() {
    const query = `
      SELECT
        c.id_cliente as id,
        c.id_cliente,
        CONCAT(c.nombre, ' ', c.apellido) AS nombre_completo,
        c.telefono,
        c.email,
        SUM(v.valor) AS valor
      FROM
        pasteleria.cliente c
      JOIN
        pasteleria.venta v ON c.id_cliente = v.id_cliente
      GROUP BY
        c.id_cliente, nombre_completo, c.telefono, c.email
      ORDER BY valor DESC
      LIMIT 5;
    `;

    const response = fetchDataAndTransform(
      query,
      (cliente) => cliente.nombre_completo,
      (cliente) => cliente.valor,
      "Clientes con mayor venta"
    );

    return response;
  }

  async function clienteMayorCotizacion() {
    const query = `
      SELECT 
        v.id_cliente, sum(v.valor) as valor, 
        CONCAT(cl.nombre, ' ', cl.apellido) AS nombre_completo
      FROM pasteleria.venta v
      inner join pasteleria.cliente cl
        on cl.id_cliente = v.id_cliente
      where v.realizado_por = 'Cotizacion'
      group by v.id_cliente, nombre_completo
      limit 5;
    `;

    const response = fetchDataAndTransform(
      query,
      (cliente) => cliente.nombre_completo,
      (cliente) => cliente.valor,
      "Clientes con mayor cotización"
    );

    return response;
  }

  async function masCotizado() {
    const cotizaciones = await sentences.rawQuery(`
      SELECT json_cotizacion
      FROM pasteleria.cotizacion;
    `);

    const contarProductosCotizados = (cotizaciones) => {
      const productos = {};

      cotizaciones.forEach((cotizacion) => {
        const jsonCotizacion = JSON.parse(cotizacion.json_cotizacion);
        const nombreProducto = jsonCotizacion.producto;

        if (productos[nombreProducto]) {
          productos[nombreProducto] += 1;
        } else {
          productos[nombreProducto] = 1;
        }
      });

      return productos;
    };

    const productosContados = contarProductosCotizados(cotizaciones);

    const obtenerTopProductos = (productos, topN) => {
      const productosArray = Object.entries(productos).map(
        ([nombre, cantidad]) => ({ nombre, cantidad })
      );
      productosArray.sort((a, b) => b.cantidad - a.cantidad);
      return productosArray.slice(0, topN);
    };

    const topProductos = obtenerTopProductos(productosContados, 5);

    const labels = topProductos.map((producto) => producto.nombre);
    const dataValues = topProductos.map((producto) => producto.cantidad);

    return createChartData(labels, dataValues, "Productos más cotizados");
  }

  async function fechaMasCotizacionesPorMes() {
    const query = `
      SELECT 
        TO_CHAR(fecha, 'Month YYYY') AS mes,
        COUNT(*) AS total_cotizaciones
      FROM pasteleria.cotizacion
      GROUP BY TO_CHAR(fecha, 'Month YYYY')
      ORDER BY MIN(fecha) DESC;
    `;
  
    const response = await fetchDataAndTransform(
      query,
      (cotizacion) => {
        // Simplemente devolver el nombre del mes y año
        return cotizacion.mes.trim(); // Trim para quitar espacios extra
      },
      (cotizacion) => cotizacion.total_cotizaciones,
      "Cotizaciones por mes"
    );
  
    return response;
  }
  

  async function fechaMasCotizacionesPorSemana() {
    const query = `
      SELECT 
        TO_CHAR(DATE_TRUNC('week', fecha), 'YYYY-MM-DD') AS semana,
        COUNT(*) AS total_cotizaciones
      FROM pasteleria.cotizacion
      GROUP BY semana
      ORDER BY semana DESC;
    `;

    const response = await fetchDataAndTransform(
      query,
      (cotizacion) => {
        // Convertir 'YYYY-MM-DD' a un objeto Date
        const date = new Date(cotizacion.semana);
        // Formatear la fecha para obtener el nombre del día y la fecha
        const options = { weekday: "long", day: "numeric", month: "long" };
        return `Semana del ${date.toLocaleDateString("es-ES", options)}`;
      },
      (cotizacion) => cotizacion.total_cotizaciones,
      "Cotizaciones por semana"
    );

    return response;
  }

  async function productosMasVendido() {
    const ventas = await sentences.rawQuery(`
      SELECT json_venta, valor
      FROM pasteleria.venta
      WHERE realizado_por = 'Tienda'
    `);

    const contarValores = (ventas) => {
      const productos = {};

      ventas.forEach((venta) => {
        const jsonVenta = JSON.parse(venta.json_venta);
        const items = jsonVenta.orderData.purchase_units[0].items;

        items.forEach((item) => {
          const nombreProducto = item.name;

          if (productos[nombreProducto]) {
            productos[nombreProducto] += parseFloat(venta.valor);
          } else {
            productos[nombreProducto] = parseFloat(venta.valor);
          }
        });
      });

      return productos;
    };

    const productosContados = contarValores(ventas);

    const obtenerTopProductos = (productos, topN) => {
      const productosArray = Object.entries(productos).map(
        ([nombre, valor]) => ({ nombre, valor })
      );
      productosArray.sort((a, b) => b.valor - a.valor);
      return productosArray.slice(0, topN);
    };

    const topProductos = obtenerTopProductos(productosContados, 5);

    const labels = topProductos.map((producto) =>
      producto.nombre.toUpperCase()
    );
    const dataValues = topProductos.map((producto) =>
      producto.valor.toFixed(2)
    );

    return createChartData(labels, dataValues, "Productos más vendidos");
  }

  async function fechaMasVentasPorMes() {
    const query = `
      SELECT 
        TO_CHAR(fecha, 'YYYY-MM') AS mes,
        SUM(valor) AS total_ventas
      FROM pasteleria.venta
      GROUP BY TO_CHAR(fecha, 'YYYY-MM')
      ORDER BY TO_DATE(TO_CHAR(fecha, 'YYYY-MM'), 'YYYY-MM') DESC;
    `;

    const response = await fetchDataAndTransform(
      query,
      (venta) => {
        // Convertir 'YYYY-MM' a 'YYYY-MM-01' para poder usar Date.parse correctamente
        const [year, month] = venta.mes.split("-");

        const formattedMonth = month.padStart(2, "0"); // Asegura que el mes tenga dos dígitos
        const date = new Date(`${year}-${formattedMonth}-31`);

        // Formatear la fecha para obtener el nombre completo del mes
        const options = { year: "numeric", month: "long" };
        return `Mes: ${date.toLocaleDateString("es-ES", options)}`;
      },
      (venta) => venta.total_ventas,
      "Ventas por mes"
    );

    return response;
  }

  async function fechaMasVentasPorSemana() {
    const query = `
      SELECT 
        TO_CHAR(DATE_TRUNC('week', fecha), 'YYYY-MM-DD') AS semana,
        SUM(valor) AS total_ventas
      FROM pasteleria.venta
      GROUP BY semana
      ORDER BY semana DESC;
    `;

    const response = await fetchDataAndTransform(
      query,
      (venta) => {
        // Convertir 'YYYY-MM-DD' a un objeto Date
        const date = new Date(venta.semana);
        // Formatear la fecha para obtener el nombre del día y la fecha
        const options = { weekday: "long", day: "numeric", month: "long" };
        return `Semana del ${date.toLocaleDateString("es-ES", options)}`;
      },
      (venta) => venta.total_ventas,
      "Ventas por semana"
    );

    return response;
  }

  async function fechaMasVentasPorDia() {
    const query = `
      SELECT 
        TO_CHAR(fecha, 'YYYY-MM-DD') AS dia,
        SUM(valor) AS total_ventas
      FROM pasteleria.venta
      GROUP BY dia
      ORDER BY dia DESC;
    `;

    const response = await fetchDataAndTransform(
      query,
      (venta) => venta.dia,
      (venta) => venta.total_ventas,
      "Ventas por día"
    );

    return response;
  }

  async function ventasTotales() {
    const query = await sentences.rawQuery(`
      SELECT 
        SUM(valor) as total_ventas
      FROM pasteleria.venta
    `);

    return query[0];
  }

  async function ventasTotalesDia() {
    const query = await sentences.rawQuery(`
      SELECT 
        SUM(valor) as total_ventas
      FROM pasteleria.venta
      WHERE DATE(fecha) = CURRENT_DATE
    `);

    return query[0];
  }

  return {
    mayorCompra,
    productosMasVendido,
    clienteMayorCotizacion,
    masCotizado,
    fechaMasVentasPorMes,
    fechaMasVentasPorSemana,
    fechaMasVentasPorDia,
    fechaMasCotizacionesPorMes,
    fechaMasCotizacionesPorSemana,
    ventasTotales,
    ventasTotalesDia,
  };
}
