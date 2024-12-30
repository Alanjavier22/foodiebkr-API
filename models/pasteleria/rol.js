import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class rol extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id_rol: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    rol: {
      type: DataTypes.STRING(15),
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
    tableName: 'rol',
    schema: 'pasteleria',
    timestamps: false,
    indexes: [
      {
        name: "rol_pk",
        unique: true,
        fields: [
          { name: "id_rol" },
        ]
      },
    ]
  });
  }
}
