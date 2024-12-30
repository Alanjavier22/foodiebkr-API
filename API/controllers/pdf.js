//Dependencias
import PdfPrinter from "pdfmake";
import { Base64Encode } from "base64-stream";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

//Modulos
import fonts from "./assets/fonts.js";
import styles from "./assets/styles.js";

import { reporte } from "./assets/template/reporte.js";

// Constantes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function (sentences) {
  const makePDF = (docDefinition) => {
    let aPromise = new Promise((resolve, reject) => {
      //console.time("creatingPDF"); //INFO: Se comenta, ya que no tiene uso
      const printer = new PdfPrinter(fonts);


        let ruta = path.join(__dirname + `/assets/prueba.pdf`);
        let pdfDoc = printer.createPdfKitDocument(docDefinition, {});
        pdfDoc.pipe(fs.createWriteStream(ruta));
        pdfDoc.end();
      

      //Proceso para retorno como base64
      let pdf = printer.createPdfKitDocument(docDefinition);
      let stream = pdf.pipe(new Base64Encode());
      pdf.end();

      //base64 encoded
      let finalString = "";
      stream.on("data", function (chunk) {
        finalString += chunk;
      });

      stream.on("end", () => {
        resolve(finalString);
      });
    });

    return aPromise;
  };

  async function generatePdf(data) {
    let { datos = {}, opc } = data;


    datos.rutaImagen = __dirname + "/assets/images";

    let pdfContents;
    let style;

    switch (opc) {
      case "reporte_ventas":
        pdfContents = reporte(datos);
        style = styles.report;
        break;

      default:
        throw error("Seccion no valida");
    }

    let docDefinition = {
      ...pdfContents,
      styles: style,
      filename: opc,
    };

    const base64 = await makePDF(docDefinition);
    return base64;
  }

  return { generatePdf };
}
