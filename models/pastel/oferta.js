import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class oferta extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id_oferta: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    codigo_descuento: {
      type: DataTypes.STRING(13),
      allowNull: true
    },
    porcentaje_descuento: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    estado_oferta: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    fecha_inicio_oferta: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fecha_fin_oferta: {
      type: DataTypes.DATE,
      allowNull: false
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
    tableName: 'oferta',
    schema: 'pasteleria',
    timestamps: false,
    indexes: [
      {
        name: "oferta_pk",
        unique: true,
        fields: [
          { name: "id_oferta" },
        ]
      },
    ]
  });
  }
}