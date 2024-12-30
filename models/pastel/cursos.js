import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class cursos extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id_cursos: {
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
    estado_curso: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    duracion_horas: {
        type: DataTypes.DECIMAL,
        allowNull: true
    },
    modalidad: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha_inicio_curso: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fecha_fin_curso: {
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
    tableName: 'cursos',
    schema: 'pastel',
    timestamps: false,
    indexes: [
      {
        name: "cursos_pk",
        unique: true,
        fields: [
          { name: "id_cursos" },
        ]
      },
    ]
  });
  }
}