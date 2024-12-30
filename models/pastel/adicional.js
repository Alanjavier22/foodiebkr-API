import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class adicional extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id_adicional: {
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
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    estado_adicional: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    requerido: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    descripcion: {
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
    tableName: 'adicional',
    schema: 'pastel',
    timestamps: false,
    indexes: [
      {
        name: "adicional_pk",
        unique: true,
        fields: [
          { name: "id_adicional" },
        ]
      },
    ]
  });
  }
}
