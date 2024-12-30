import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class auditoria extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id_auditoria: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    log: {
      type: DataTypes.TEXT,
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
    tableName: 'auditoria',
    schema: 'pastel',
    timestamps: false,
    indexes: [
      {
        name: "auditoria_pk",
        unique: true,
        fields: [
          { name: "id_auditoria" },
        ]
      },
    ]
  });
  }
}
