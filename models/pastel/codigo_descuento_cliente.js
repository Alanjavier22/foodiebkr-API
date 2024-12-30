import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class codigo_descuento_cliente extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id_codigo_descuento_cliente: {
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
    codigo_descuento: {
      type: DataTypes.STRING(13),
      allowNull: false
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'codigo_descuento_cliente',
    schema: 'pastel',
    timestamps: false,
    indexes: [
      {
        name: "codigo_descuento_cliente_pk",
        unique: true,
        fields: [
          { name: "id_codigo_descuento_cliente" },
        ]
      },
    ]
  });
  }
}
