import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class cotizacion extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id_cotizacion: {
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
    foto: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    blob_name: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    json_cotizacion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado_cotizacion: {
      type: DataTypes.TEXT,
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
    tableName: 'cotizacion',
    schema: 'pasteleria',
    timestamps: false,
    indexes: [
      {
        name: "cotizacion_pk",
        unique: true,
        fields: [
          { name: "id_cotizacion" },
        ]
      },
    ]
  });
  }
}
