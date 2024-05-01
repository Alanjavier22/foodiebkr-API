//Dependencias
import bcryptjs from "bcrypt";
import jwt from "jsonwebtoken";
import { error } from "../connection/error.js";
//Constantes

export default function (sentences) {
  async function clientes() {
    return await sentences.rawQuery(`select * from public.registro_cliente`);
  }

  async function insertClientes(data) {
    //return data;
    // console.log(data)
    return await sentences.rawQuery(`INSERT INTO public.registro_cliente(
        nombre,  correo, cedula, apellido, numero_celular)
       VALUES ('${data.nombre}', '${data.correo}', '${data.cedula}', '${data.apellido}', '${data.numero_celular}');`);
  }

  async function cotizaciones() {
    return await sentences.rawQuery(`select * from public.cotizacion`);
  }

  async function insertCotizaciones(data) {
    console.log(data);
    return await sentences.rawQuery(`INSERT INTO public.cotizacion(
      porciones, sabores, tematica, tipo_de_producto, nombre, celular, correo, mensaje, decoracion, cantidad, apellido, pisos)
      VALUES ('${data.porciones}', '${data.sabores}','${data.tematica}', '${data.tipo_de_producto}', '${data.nombre}', '${data.celular}', '${data.correo}', '${data.mensaje}', '${data.decoracion}', '${data.cantidad}','${data.apellido}', '${data.pisos}');`);
  }

  async function inventarioData() {
    //BOCADITOS DULCE 50
    let bocaditosdulce50 = await sentences.rawQuery(
      `SELECT *, bocaditos as nombre FROM public.bocaditos_de_dulce_por_50`
    );

    bocaditosdulce50 = bocaditosdulce50.map((item) => {
      console.log(item)
      return {
        ...item,
        CategoriaLink: JSON.parse(item.categorialink),
      };
    });

    //BOCADITOS SAL 50
    let bocaditossal50 = await sentences.rawQuery(
      `SELECT *, bocaditos as nombre FROM public.bocaditos_de_sal_por_50`
    );

    bocaditossal50 = bocaditossal50.map((item) => {
      return {
        ...item,
        CategoriaLink: JSON.parse(item.categorialink),
      };
    });

    //BOCADITOS DULCE 100
    let bocaditosdulce100 = await sentences.rawQuery(
      `SELECT *, bocaditos as nombre FROM public.bocaditos_de_dulce_por_100`
    );

    bocaditosdulce100 = bocaditosdulce100.map((item) => {
      return {
        ...item,
        CategoriaLink: JSON.parse(item.categorialink),
      };
    });

    //BOCADITOS SAL 100
    let bocaditossal00 = await sentences.rawQuery(
      `SELECT *, bocaditos as nombre FROM public.bocaditos_de_sal_por_100`
    );

    bocaditossal00 = bocaditossal00.map((item) => {
      return {
        ...item,
        CategoriaLink: JSON.parse(item.categorialink),
      };
    });

    //CATALOGO NAVIDAD 1
    let catalogonavidad1 = await sentences.rawQuery(
      `SELECT * FROM public.catalogonavidad1`
    );

    catalogonavidad1 = catalogonavidad1.map((item) => {
      return {
        ...item,
        sabores: JSON.parse(item.sabores),
        varios_precios: JSON.parse(item.varios_precios),
        CategoriaLink: JSON.parse(item.categorialink),
      };
    });

    //PAQUETE DE BOCADITOS
    let paquetebocaditos = await sentences.rawQuery(
      `SELECT *, paquete as nombre FROM public.paquetes_de_bocaditos`
    );

    paquetebocaditos = paquetebocaditos.map((item) => {
      return {
        ...item,
        CategoriaLink: JSON.parse(item.categorialink),
      };
    });

    //CATALOGO NAVIDAD 2
    let catalogonavidad2 = await sentences.rawQuery(
      `SELECT * FROM public.catalogonavidad2`
    );

    catalogonavidad2 = catalogonavidad2.map((item) => {
      return {
        ...item,
        precio: item.precios,
        sabores: JSON.parse(item.sabores),
        varios_precios: JSON.parse(item.varios_precios),
        CategoriaLink: JSON.parse(item.categorialink),
      };
    });

    //PAQUETES DE TORTAS Y DULCES
    let paquetetortasydulces = await sentences.rawQuery(
      `SELECT *, paquete as nombre FROM public.paquetes_de_tortas_y_dulces`
    );

    paquetetortasydulces = paquetetortasydulces.map((item) => {
      return {
        ...item,
        DescripcionLista: JSON.parse(item.descripcionlista),
        CategoriaLink: JSON.parse(item.categorialink),
      };
    });

    //TORATAS ALTAS
    let opciones = await sentences.rawQuery(
      `SELECT pisos, personas, precio FROM public.tortas_altas`
    );

    let extras = await sentences.rawQuery(
      `SELECT * FROM public."Extras" where tipoextra = 1`
    );

    const TortasAltas = [
      {
        nombre: "Tortas Altas",
        imagen: "Tortas Altas.jpg",
        opcionesPorc: opciones,
        extras: extras,
        CategoriaLink: ["Tortas Altas", "Tortas Altas", "Tortas Altas"],
      },
    ];

    //CATALOGO SAN VALENTINE
    let catalogoSanValentine = await sentences.rawQuery(
      `SELECT * FROM public."catalogoSanValentine"`
    );

    catalogoSanValentine = catalogoSanValentine.map((item) => {
      return {
        ...item,
        CategoriaLink: JSON.parse(item.categorialink),
      };
    });

    return [
      // ...catalogo_navidad_1,
      //...catalogo_navidad_2,
      //...paquete_tortas_dulces,
      //...SanValentine,
      ...bocaditosdulce50,
      ...bocaditossal50,
      ...bocaditosdulce100,
      ...bocaditossal00,
      ...catalogonavidad1,
      ...paquetebocaditos,
      ...catalogonavidad2,
      ...paquetetortasydulces,
      ...TortasAltas,
      ...catalogoSanValentine,
    ];
  }

  async function categoriaProducto(data) {
    let { categoria } = data;

    let datosFiltrados = [];

    const productos = await inventarioData();

    if (categoria) {
      datosFiltrados = productos.filter((item) =>
        item?.CategoriaLink?.includes(categoria)
      );

      datosFiltrados = datosFiltrados.map((item) => item.CategoriaLink[1]);
    } else {
      datosFiltrados = productos.map((item) => item?.CategoriaLink[0]);
    }

    const categoriasUnicas = [...new Set(datosFiltrados)];

    const categorias = categoriasUnicas.map((item, index) => {
      return {
        id: index + 1,
        nombre: item,
        imagen: item + ".jpg",
      };
    });

    return categorias;
  }

  async function subCategoriaProducto(data) {
    const { subCategoria } = data;

    const productos = await inventarioData();

    return productos.filter((item) =>
      item?.CategoriaLink?.includes(subCategoria)
    );
  }

  async function detallesProducto(data) {
    const { producto } = data;

    const productos = await inventarioData();

    return productos.filter((item) => item.nombre === producto)[0];
  }

  async function menuProducto() {
    let categoryMain = await categoriaProducto({ categoria: null });

    for (let item of categoryMain) {
      let subCategoria = await categoriaProducto({ categoria: item.nombre });
      item.subcategorias = subCategoria;
    }

    categoryMain.unshift({
      id: 0,
      nombre: "Todos",
      subcategorias: [],
    });

    return categoryMain;
  }

  async function login(data) {
    let { username, pass } = data;

    let datosConsultados = [
      {
        id: 1,
        username: "Admin",
        password:
          "$2a$12$kJo4MazVWWbDf3tesppJM.DTJAxdv.MUT7QvqLyd43t1ULQDyHF/W",
        rol: "Administrador",
      },
    ];

    if (datosConsultados.length !== 0) {
      const { id, username, password, rol } = datosConsultados[0];
      let isValid = await bcryptjs.compare(pass, password);

      if (!isValid) throw error("Contraseña incorrecta");

      const token = await jwt.sign(
        {
          id,
          nombre: username,
          // cedula,
          // correo,
          rol,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: 2,
        }
      );

      return token;
    }
    throw error("Usuario no registrado", 400);
  }

  return {
    login,
    //GET
    cotizaciones,
    inventarioData,
    categoriaProducto,
    subCategoriaProducto,
    detallesProducto,
    menuProducto,
    clientes,
    //POST
    insertCotizaciones,
    insertClientes,
  };
}
