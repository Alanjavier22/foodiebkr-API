import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class categoria extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id_categoria: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    id_subproducto: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'subproducto',
        key: 'id_subproducto'
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
    tableName: 'categoria',
    schema: 'pastel',
    timestamps: false,
    indexes: [
      {
        name: "categoria_pk",
        unique: true,
        fields: [
          { name: "id_categoria" },
        ]
      },
    ]
  });
  }
}
