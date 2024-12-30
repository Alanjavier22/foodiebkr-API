import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class cliente extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id_cliente: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    cedula: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: "cliente_cedula_key"
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    apellido: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    telefono: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    direccion: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    estado_cliente: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    tableName: 'cliente',
    schema: 'pasteleria',
    timestamps: false,
    indexes: [
      {
        name: "cliente_cedula_key",
        unique: true,
        fields: [
          { name: "cedula" },
        ]
      },
      {
        name: "cliente_pk",
        unique: true,
        fields: [
          { name: "id_cliente" },
        ]
      },
    ]
  });
  }
}
