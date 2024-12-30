import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _adicional from  "./adicional.js";
import _auditoria from  "./auditoria.js";
import _categoria from  "./categoria.js";
import _categoria_adicional from  "./categoria_adicional.js";
import _cliente from  "./cliente.js";
import _cotizacion from  "./cotizacion.js";
import _oferta from  "./oferta.js";
import _producto from  "./producto.js";
import _rol from  "./rol.js";
import _subproducto from  "./subproducto.js";
import _usuario from  "./usuario.js";
import _torta from  "./torta.js";
import _venta from  "./venta.js";
import _inventario from "./inventario.js";
import _codigo_descuento_cliente from  "./codigo_descuento_cliente.js";
import _cursos from  "./cursos.js";

export default function initModels(sequelize) {
  const adicional = _adicional.init(sequelize, DataTypes);
  const auditoria = _auditoria.init(sequelize, DataTypes);
  const categoria = _categoria.init(sequelize, DataTypes);
  const categoria_adicional = _categoria_adicional.init(sequelize, DataTypes);
  const cliente = _cliente.init(sequelize, DataTypes);
  const cotizacion = _cotizacion.init(sequelize, DataTypes);
  const oferta = _oferta.init(sequelize, DataTypes);
  const producto = _producto.init(sequelize, DataTypes);
  const rol = _rol.init(sequelize, DataTypes);
  const subproducto = _subproducto.init(sequelize, DataTypes);
  const torta = _torta.init(sequelize, DataTypes);
  const usuario = _usuario.init(sequelize, DataTypes);
  const venta = _venta.init(sequelize, DataTypes);
  const inventario = _inventario.init(sequelize, DataTypes);
  const codigo_descuento_cliente = _codigo_descuento_cliente.init(sequelize, DataTypes);
  const cursos = _cursos.init(sequelize, DataTypes);

  categoria_adicional.belongsTo(adicional, { as: "id_adicional_adicional", foreignKey: "id_adicional"});
  adicional.hasMany(categoria_adicional, { as: "categoria_adicionals", foreignKey: "id_adicional"});
  codigo_descuento_cliente.belongsTo(cliente, { as: "id_cliente_cliente", foreignKey: "id_cliente"});
  cliente.hasMany(codigo_descuento_cliente, { as: "codigo_descuento_clientes", foreignKey: "id_cliente"});
  cotizacion.belongsTo(cliente, { as: "id_cliente_cliente", foreignKey: "id_cliente"});
  cliente.hasMany(cotizacion, { as: "cotizacions", foreignKey: "id_cliente"});
  venta.belongsTo(cliente, { as: "id_cliente_cliente", foreignKey: "id_cliente"});
  cliente.hasMany(venta, { as: "venta", foreignKey: "id_cliente"});
  adicional.belongsTo(producto, { as: "id_producto_producto", foreignKey: "id_producto"});
  producto.hasMany(adicional, { as: "adicionals", foreignKey: "id_producto"});
  categoria.belongsTo(producto, { as: "id_producto_producto", foreignKey: "id_producto"});
  producto.hasMany(categoria, { as: "categoria", foreignKey: "id_producto"});
  categoria_adicional.belongsTo(producto, { as: "id_producto_producto", foreignKey: "id_producto"});
  producto.hasMany(categoria_adicional, { as: "categoria_adicionals", foreignKey: "id_producto"});
  subproducto.belongsTo(producto, { as: "id_producto_producto", foreignKey: "id_producto"});
  producto.hasMany(subproducto, { as: "subproductos", foreignKey: "id_producto"});
  usuario.belongsTo(rol, { as: "id_rol_rol", foreignKey: "id_rol"});
  rol.hasMany(usuario, { as: "usuarios", foreignKey: "id_rol"});
  categoria.belongsTo(subproducto, { as: "id_subproducto_subproducto", foreignKey: "id_subproducto"});
  subproducto.hasMany(categoria, { as: "categoria", foreignKey: "id_subproducto"});
  inventario.belongsTo(producto, { as: "id_inventario_producto", foreignKey: "id_producto"});
  producto.hasMany(inventario, { as: "inventario", foreignKey: "id_producto"});
  inventario.belongsTo(subproducto, { as: "id_inventario_subproducto", foreignKey: "id_subproducto"});
  subproducto.hasMany(inventario, { as: "inventario", foreignKey: "id_subproducto"});

  return {
    adicional,
    auditoria,
    categoria,
    categoria_adicional,
    cliente,
    codigo_descuento_cliente,
    cotizacion,
    oferta,
    producto,
    rol,
    subproducto,
    inventario,
    usuario,
    torta,
    venta,
    cursos,
  };
}
