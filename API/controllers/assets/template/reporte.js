import path from "path";

export function reporte(data) {
  let { datos, titulo, estado, fechas, rutaImagen } = data;

  let valores = [
    [
      {
        text: "NÚMERO",
        style: "tableHeader",
      },
      {
        text: "DESCRIPCIÓN",
        style: "tableHeader",
      },
      {
        text: "VALOR",
        style: "tableHeader",
      },
      {
        text: "ESTADO",
        style: "tableHeader",
      },
      {
        text: "FECHA",
        style: "tableHeader",
      },
    ],
  ];

  datos.map((item, index) => {
    valores.push([
      { text: index + 1, style: "text" },
      { text: item.descripcion, style: "text" },
      { text: item.valor, style: "text" },
      { text: item.estado, style: "text" },
      { text: item.fecha, style: "text" },
    ]);
  });

  return {
    pageOrientation: "landscape",
    pageMargins: [20, 70, 15, 30],
    header: (currentPage, pageCount) => {
      return [
        {
          margin: [50, 30, 40, 20],
          columns: [
            {
              width: 1550,
              alignment: "left",
              stack: [
                [
                  {
                    width: 800,
                    text: "",
                    style: "subHeader",
                    alignment: "left",
                  },
                  {
                    width: 500,
                    text: "Fecha y hora: " + new Date().toLocaleString(),
                    style: "subHeader",
                    alignment: "left",
                  },
                ],
              ],
            },
          ],
        },
      ];
    },
    content: [
      {
        width: 300,
        height: 100,
        image: path.join(rutaImagen + "/logo.png"),
        style: "imagen",
        alignment: "center",
      },
      {
        alignment: "center",
        width: "*",
        text: titulo,
        style: "header",
      },
      {
        columns: [
          {
            alignment: "center",
            width: "*",
            text: `ESTADO: ${estado}`,
            style: "subHeader",
          },
          {
            width: "*",
            text: `DESDE: ${fechas?.inicio}               HASTA: ${fechas?.fin}`,
            style: "subHeader",
            alignment: "center",
          },
        ],
      },
      {
        style: "tableExample",
        table: {
          headerRows: 1,
          widths: [70, 250, 100, 170, 150],
          body: valores,
        },
        layout: "headerLineOnly",
      },
    ],
  };
}
