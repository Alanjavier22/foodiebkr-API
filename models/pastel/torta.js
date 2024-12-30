import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class torta extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id_torta: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    id_producto: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'producto',
        key: 'id_producto'
      }
    },
    descripcion: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    porciones: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    pisos: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    valor: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
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
    tableName: 'torta',
    schema: 'pastel',
    timestamps: false,
    indexes: [
      {
        name: "torta_pk",
        unique: true,
        fields: [
          { name: "id_torta" },
        ]
      },
    ]
  });
  }
}
