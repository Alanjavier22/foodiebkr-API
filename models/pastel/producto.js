import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class producto extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id_producto: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    estado_producto: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    es_inventario: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    foto: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    blob_name: {
      type: DataTypes.STRING(20),
      allowNull: true
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
    tableName: 'producto',
    schema: 'pastel',
    timestamps: false,
    indexes: [
      {
        name: "producto_pk",
        unique: true,
        fields: [
          { name: "id_producto" },
        ]
      },
    ]
  });
  }
}
