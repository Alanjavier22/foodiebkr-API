import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class venta extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id_venta: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    id_cliente: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'cliente',
        key: 'id_cliente'
      }
    },
    json_venta: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    descripcion_compra: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    valor: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    estado_venta: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    realizado_por: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    ip_ingreso: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    usuario_ingreso: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'venta',
    schema: 'pasteleria',
    timestamps: false,
    indexes: [
      {
        name: "venta_pk",
        unique: true,
        fields: [
          { name: "id_venta" },
        ]
      },
    ]
  });
  }
}
