// Dependencias
import { Op } from "sequelize";
import formatDate from "../../utils/formateDate.js";
import formatDatev2 from "../../utils/formatDatev2.js";
import decodeToken from "../../utils/decodeToken.js";
import { uploadImg } from "./FileController.js";
import auditoria from "./auditoria.js";

// Constantes

export default function (sentences) {
  async function upsert(data, token) {
    const { ip_ingreso, usuario_ingreso } = decodeToken(token);
    const proceso = data.id_cursos ? "Actualización" : "Ingreso";

    // Cargar imagen
    const { url, blob_name } = await uploadImg({
      imagen: data.imagen,
      blob_name: data.blob_name,
    });

    // Quitar 'imagen' de data
    delete data.imagen;

    let _data = {
      ...data,
      foto: url,
      blob_name,
      ip_ingreso,
      usuario_ingreso,
    };

    if (data.id_cursos) {
      const id_cursos = data.id_cursos;
      delete data.id_cursos;

      // Usar "pasteleria" como string
      await sentences.update("pasteleria", "cursos", _data, { id_cursos });
    } else {
      await sentences.insert("pasteleria", "cursos", _data);
    }

    return await auditoria(sentences).insert(
      {
        seccion: "Cursos",
        proceso,
        descripcion: `${proceso} del curso ${_data.nombre || ""}`,
        detalles: JSON.stringify(_data),
      },
      token
    );
  }

  async function consultar({ estado }, token) {
    const fecha_actual = new Date();
    const filtro = {};
    if (estado !== "all") filtro.estado_curso = estado;

    // Usar "pasteleria" como string
    const cursos = await sentences.select("pasteleria", "cursos", ["*"], {
      fecha_fin_curso: { [Op.gte]: fecha_actual },
      ...filtro,
    });

    return cursos.map((item) => {
      const firstLineEndIndex = item.descripcion.indexOf("\n");
      const primeraLineaDescripcion = item.descripcion.substring(
        0,
        firstLineEndIndex
      );
      return {
        ...item,
        id_cursos: item.id_cursos,
        nombre: item.nombre,
        imagen: item.foto,
        primeraLineaDescripcion,
        fecha_fin_curso: formatDatev2(item.fecha_fin_curso),
        fecha_inicio_curso: formatDatev2(item.fecha_inicio_curso),
        _fecha_inicio_curso: formatDate(item.fecha_inicio_curso),
        _fecha_fin_curso: formatDate(item.fecha_fin_curso),
        _estado: item.estado_curso ? "Activo" : "Inactivo",
        _duracion_horas: item.duracion_horas + "h",
      };
    });
  }

  async function detalles({ id_cursos }) {
    // Usar "pasteleria" como string
    const cursos = await sentences.select("pasteleria", "cursos", ["*"], {
      id_cursos,
    });

    return cursos.map((item) => {
      return {
        ...item,
        imagen: item?.foto,
        cantidad: 1,
        valor: item?.valor,
        subtotal: 0,
        total: 0,
        seccion: "cursos",
        _fecha_inicio_curso: formatDate(item.fecha_inicio_curso),
        _fecha_fin_curso: formatDate(item.fecha_fin_curso),
      };
    });
  }

  return {
    // GET
    consultar,
    detalles,
    // POST
    upsert,
  };
}
