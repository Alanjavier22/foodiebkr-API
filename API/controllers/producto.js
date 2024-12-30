//Dependencias
import decodeToken from "../../utils/decodeToken.js";
import _fieldRequired from "../data/_fieldRequired.js";

import { uploadImg } from "./FileController.js";
import auditoria from "./auditoria.js";

export default function (sentences) {
  async function consultarProductos(reqImg) {
    let query = "fecha";
    if (reqImg) query = "foto";

    return await sentences.rawQuery(
      `Select id_producto, nombre, ${query}, estado_producto 
        from pastel.producto order by id_producto asc`
    );
  }

  async function consultar({ estado }) {
    let query = estado === "all" ? `1=1` : `estado_producto = ${estado}`;

    return await sentences.rawQuery(
      `Select id_producto, nombre, foto as imagen, blob_name, estado_producto  
          from pastel.producto 
          where ${query} and es_inventario = false
        order by id_producto asc`
    );
  }

  async function consultarSubproductos({ id_producto, estado }) {
    let query = estado === "all" ? `1=1` : `estado_subproducto = ${estado}`;

    return await sentences.rawQuery(
      `Select id_subproducto, id_producto, nombre, foto as imagen, blob_name, estado_subproducto  
          from pastel.subproducto 
          where id_producto = ${Number(id_producto)} and ${query}
          order by id_subproducto asc`
    );
  }

  async function consultarCategoria({
    id_producto,
    id_subproducto,
    id_categoria = "-",
    estado = "all",
  }) {
    let filtro = { id_producto };

    if (id_subproducto !== "-") filtro.id_subproducto = id_subproducto;
    if (id_categoria !== "-") filtro.id_categoria = id_categoria;
    if (estado !== "all") filtro.estado_categoria = estado;

    const _categoria = await sentences.selectJoin(
      pasteleria,
      "categoria",
      ["*"],
      filtro,
      [
        {
          name: "subproducto",
          as: "id_subproducto_subproducto",
          required: true,
          select: ["nombre"],
          // where: {},
        },
        {
          name: "producto",
          as: "id_producto_producto",
          required: true,
          select: ["nombre"],
          // where: {},
        },
      ],
      true,
      [["id_categoria", "asc"]]
      // [["foto", "asc"]] //Cambio para que se ordenen por valores null primero
    );

    const categoria = _categoria.map((item) => {
      return {
        id_categoria: item.id_categoria,
        id_producto: item.id_producto,
        id_subproducto: item.id_subproducto,
        blob_name: item.blob_name,
        nombre_subproducto: item["id_subproducto_subproducto.nombre"],
        nombre_producto: item["id_producto_producto.nombre"],
        nombre: item.nombre,
        valor: item.valor,
        valorStr: "$" + item.valor,
        imagen: item.foto,
        descripcion: item.descripcion,
        estado_categoria: item.estado_categoria,
      };
    });

    return categoria;
  }

  async function consultarDetallesCategoria({ id_categoria }) {
    const _categoria = await sentences.selectJoin(
      pasteleria,
      "categoria",
      ["*"],
      { id_categoria },
      [
        {
          name: "subproducto",
          as: "id_subproducto_subproducto",
          required: true,
          select: ["nombre"],
          // where: {},
        },
        {
          name: "producto",
          as: "id_producto_producto",
          required: true,
          select: ["nombre"],
          // where: {},
        },
      ],
      true
    );

    const categoria = _categoria.map((item) => {
      return {
        id_categoria: item.id_categoria,
        id_producto: item.id_producto,
        nombre_producto: item["id_producto_producto.nombre"],
        id_subproducto: item.id_subproducto,
        nombre_subproducto: item["id_subproducto_subproducto.nombre"],
        nombre: item.nombre,
        valor: item.valor,
        valorStr: "$" + item.valor,
        imagen: item.foto,
        descripcion: item.descripcion,
        estado_categoria: item.estado_categoria,
      };
    });

    return categoria;
  }

  async function consultarNombreCategoria({ nombre, id_producto }) {
    const result = [];

    let query = "1=1";

    if (id_producto !== "-") query = ` id_producto = ${id_producto}`;

    const categorias = await sentences.rawQuery(
      `Select id_categoria, id_producto, id_subproducto, nombre 
        from pastel.categoria where nombre ilike '%${nombre}%' and ${query}`
    );

    for (let item of categorias) {
      const data = await consultarCategoria(item);
      result.push(data[0]);
    }

    return result;
  }

  async function consultarOpciones() {
    let respuesta = [];
    const productos = await consultar({ estado: true });

    for (let producto of productos) {
      const subproductos = await consultarSubproductos({
        ...producto,
        estado: true,
      });

      const subproducto = subproductos.map((item) => {
        return {
          id_producto: item.id_producto,
          id_subproducto: item.id_subproducto,
          nombre: item.nombre,
        };
      });

      respuesta.push({
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        subproducto,
      });
    }

    return respuesta;
  }

  async function upsert(data, token) {
    const { ip_ingreso, usuario_ingreso } = decodeToken(token);

    const proceso = data.id_producto ? "Actualización" : "Ingreso";

    const { url, blob_name } = await uploadImg({
      imagen: data.imagen,
      blob_name: data.blob_name,
    });

    delete data.imagen;

    let _data = {
      ...data,
      foto: url,
      blob_name,
      ip_ingreso,
      usuario_ingreso,
    };

    if (data.id_producto) {
      const id_producto = data.id_producto;
      delete data.id_producto;

      //UPDATE
      await sentences.update(pasteleria, "producto", _data, {
        id_producto,
      });
    } else {
      //INSERT
      await sentences.insert(pasteleria, "producto", _data);
    }

    return await auditoria(sentences).insert(
      {
        seccion: "Producto",
        proceso,
        descripcion: `${proceso} de producto ${_data?.nombre || ""}`,
        detalles: JSON.stringify(_data),
      },
      token
    );
  }

  async function upsertSubproducto(data, token) {
    const { ip_ingreso, usuario_ingreso } = decodeToken(token);

    const { url, blob_name } = await uploadImg({
      imagen: data.imagen,
      blob_name: data.blob_name,
    });

    delete data.imagen;

    let _data = {
      ...data,
      foto: url,
      blob_name,
      ip_ingreso,
      usuario_ingreso,
    };

    const proceso = data.id_subproducto ? "Actualización" : "Ingreso";

    if (data.id_subproducto) {
      const id_subproducto = data.id_subproducto;
      const id_producto = data.id_producto;

      delete data.id_subproducto;
      delete data.id_producto;

      await sentences.update(pasteleria, "subproducto", _data, {
        id_subproducto,
        id_producto,
      });
    } else {
      //INSERT
      await sentences.insert(pasteleria, "subproducto", _data);
    }

    return await auditoria(sentences).insert(
      {
        seccion: "Subproducto",
        proceso,
        descripcion: `${proceso} de subproducto ${_data?.nombre || ""}`,
        detalles: JSON.stringify(_data),
      },
      token
    );
  }

  async function upsertCategoria(data, token) {
    const { ip_ingreso, usuario_ingreso } = decodeToken(token);

    const { url, blob_name } = await uploadImg({
      imagen: data.imagen,
      blob_name: data.blob_name,
    });

    delete data.imagen;

    let _data = {
      ...data,
      foto: url,
      blob_name,
      ip_ingreso,
      usuario_ingreso,
    };

    const proceso = data.id_categoria ? "Actualización" : "Ingreso";

    if (data.id_categoria) {
      const id_categoria = data.id_categoria;
      const id_subproducto = data.id_subproducto;
      const id_producto = data.id_producto;

      delete data.id_categoria;
      delete data.id_subproducto;
      delete data.id_producto;

      await sentences.update(pasteleria, "categoria", _data, {
        id_categoria,
        id_subproducto,
        id_producto,
      });
    } else {
      //INSERT
      await sentences.insert(pasteleria, "categoria", _data);
    }

    return await auditoria(sentences).insert(
      {
        seccion: "Categoria",
        proceso,
        descripcion: `${proceso} de categoria ${_data?.nombre || ""}`,
        detalles: JSON.stringify(_data),
      },
      token
    );
  }

  async function consultarPisosPorciones({ nombre }) {
    const datos = await sentences.select(
      pasteleria,
      "torta",
      ["id_torta", "pisos", "porciones", "valor"],
      { descripcion: nombre }
    );

    // Paso 1: Agrupar por pisos
    const agrupadoPorPisos = datos.reduce((acc, torta) => {
      const { pisos, porciones, valor } = torta;
      if (!acc[pisos]) {
        acc[pisos] = [];
      }
      acc[pisos].push({ nombre: `${porciones} Porciones`, valor });
      return acc;
    }, {});

    // Paso 2: Convertir el objeto agrupado en un array de objetos
    const resultadoFinal = Object.keys(agrupadoPorPisos).map((pisos) => ({
      pisos: Number(pisos),
      porciones: agrupadoPorPisos[pisos],
    }));

    return resultadoFinal;
  }

  return {
    //GET
    consultar,
    consultarProductos,
    consultarSubproductos,
    consultarCategoria,
    consultarDetallesCategoria,
    consultarNombreCategoria,
    consultarOpciones,
    consultarPisosPorciones,
    //POST
    upsert,
    upsertSubproducto,
    upsertCategoria,
  };
}
