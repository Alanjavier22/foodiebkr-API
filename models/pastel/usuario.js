import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class usuario extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id_usuario: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    id_rol: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'rol',
        key: 'id_rol'
      }
    },
    cedula: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    apellido: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codigo_empleado: {
      type: DataTypes.STRING(20),
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
    tableName: 'usuario',
    schema: 'pastel',
    timestamps: false,
    indexes: [
      {
        name: "usuario_pk",
        unique: true,
        fields: [
          { name: "id_usuario" },
        ]
      },
    ]
  });
  }
}
