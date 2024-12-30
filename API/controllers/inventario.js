//Dependencias
import decodeToken from "../../utils/decodeToken.js";
import formatDate from "../../utils/formateDate.js";
import { uploadImg } from "./FileController.js";
import auditoria from "./auditoria.js";

export default function (sentences) {
  async function upsert(data, token) {
    const { ip_ingreso, usuario_ingreso } = decodeToken(token);

    const proceso = data.id_inventario ? "Actualización" : "Ingreso";

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

    if (data.id_inventario) {
      const id_inventario = data.id_inventario;
      delete data.id_producto;

      //UPDATE
      await sentences.update(pasteleria, "inventario", _data, {
        id_inventario,
      });
    } else {
      //INSERT
      await sentences.insert(pasteleria, "inventario", _data);
    }

    return await auditoria(sentences).insert(
      {
        seccion: "Inventario",
        proceso,
        descripcion: `${proceso} de inventario ${_data.nombre || ""}`,
        detalles: JSON.stringify(_data),
      },
      token
    );
  }

  async function consultar({ estado }) {
    let query = estado === "all" ? `1=1` : `estado_producto = ${estado}`;

    return await sentences.rawQuery(
      `Select id_producto, nombre, foto as imagen, blob_name, estado_producto  
          from pastel.producto 
          where ${query} and es_inventario = true
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

  async function consultarInventario({
    id_producto,
    id_subproducto,
    id_inventario = "-",
    estado = "all",
  }) {
    let filtro = { id_producto };

    if (id_subproducto !== "-") filtro.id_subproducto = id_subproducto;
    if (id_inventario !== "-") filtro.id_inventario = id_inventario;
    if (estado !== "all") filtro.estado_inventario = estado;

    const _inventario = await sentences.selectJoin(
      pasteleria,
      "inventario",
      ["*"],
      filtro,
      [
        {
          name: "subproducto",
          as: "id_inventario_subproducto",
          required: true,
          select: ["nombre"],
          // where: {},
        },
        {
          name: "producto",
          as: "id_inventario_producto",
          required: true,
          select: ["nombre"],
          // where: {},
        },
      ],
      true,
      [["id_inventario", "asc"]]
      // [["foto", "asc"]] //Cambio para que se ordenen por valores null primero
    );

    const inventario = _inventario.map((item) => {
      return {
        id_inventario: item.id_inventario,
        id_producto: item.id_producto,
        id_subproducto: item.id_subproducto,
        blob_name: item.blob_name,
        nombre_subproducto: item["id_inventario_subproducto.nombre"],
        nombre_producto: item["id_inventario_producto.nombre"],
        nombre: item.nombre,
        stock: item.stock,
        valor: item.valor,
        valorStr: "$" + item.valor,
        imagen: item.foto,
        descripcion: item.descripcion,
        estado_inventario: item.estado_inventario,
      };
    });

    return inventario;
  }

  async function consultarDetalles({ id_inventario }) {
    const _inventario = await sentences.selectJoin(
      pasteleria,
      "inventario",
      ["*"],
      { id_inventario },
      [
        {
          name: "subproducto",
          as: "id_inventario_subproducto",
          required: true,
          select: ["nombre"],
          // where: {},
        },
        {
          name: "producto",
          as: "id_inventario_producto",
          required: true,
          select: ["nombre"],
          // where: {},
        },
      ],
      true
    );

    const inventario = _inventario.map((item) => {
      return {
        id_inventario: item.id_inventario,
        id_producto: item.id_producto,
        nombre_producto: item["id_inventario_producto.nombre"],
        id_subproducto: item.id_subproducto,
        nombre_subproducto: item["id_inventario_subproducto.nombre"],
        nombre: item.nombre,
        stock: item.stock,
        valor: item.valor,
        valorStr: "$" + item.valor,
        imagen: item.foto,
        descripcion: item.descripcion,
        estado_inventario: item.estado_inventario,
      };
    });

    return inventario;
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

  async function actualizarStocks(items, token) {
    for (let item of items) {
      const [{ id_inventario = null, stock = 0 } = {}] = await sentences.select(
        pasteleria,
        "inventario",
        ["id_inventario", "stock"],
        {
          nombre: item.name,
        }
      );

      if (id_inventario) {
        const newStock = stock - item.quantity;

        await sentences.update(
          pasteleria,
          "inventario",
          { stock: newStock, estado_inventario: newStock !== 0 },
          { id_inventario }
        );

        await auditoria(sentences).insert(
          {
            seccion: "Inventario",
            proceso: "Actualización",
            descripcion: `Actualización de stock para ${item.name || ""}`,
            detalles: JSON.stringify({
              stock_anterior: stock,
              cantidad_disminuida: item.quantity,
              nuevo_stock: newStock,
            }),
          },
          token
        );
      }
    }

    return [1];
  }

  return {
    //GET
    consultar,
    consultarSubproductos,
    consultarInventario,
    consultarDetalles,
    consultarOpciones,
    //POST
    upsert,
    actualizarStocks,
  };
}
