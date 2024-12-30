import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class categoria_adicional extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id_categoria_adicional: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    id_adicional: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'adicional',
        key: 'id_adicional'
      }
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
    valor: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    estado_categoria: {
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
    tableName: 'categoria_adicional',
    schema: 'pastel',
    timestamps: false,
    indexes: [
      {
        name: "categoria_adicional_pk",
        unique: true,
        fields: [
          { name: "id_categoria_adicional" },
        ]
      },
    ]
  });
  }
}
