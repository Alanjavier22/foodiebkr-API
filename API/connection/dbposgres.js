////@ts-check
import sequelizeMulti from "./Sequelize.js";
import dotenv from "dotenv";
// import error from "../utils/error.js";
dotenv.config();

export default function store(name) {
  const dbname = name ?? process.env.db;
  const sequelize = sequelizeMulti(dbname);

  const defaultSchema = "pasteleria"; // Establece el esquema predeterminado

  /**
   * Carga el esquema especificado y devuelve los modelos asociados.
   * @param {string} [schema=defaultSchema] - Nombre del esquema de la base de datos.
   * @returns {Promise<Object>} Modelos del esquema.
   */
  async function getSchema(schema = defaultSchema) {
    try {
      console.log(`Cargando esquema: ${schema}`);
      const module = `../../models/${schema}/init-models.js`;
      const importedSchema = await import(module);
      return await importedSchema.default(sequelize);
    } catch (err) {
      throw new Error(`Error al cargar el esquema "${schema}": ${err.message}`);
    }
  }

  async function insert(schema, model, datos, transaction = {}) {
    try {
      const Models = await getSchema(schema);
      return await Models[model].create(datos, transaction);
    } catch (err) {
      throw new Error(`Error al insertar en ${model} del esquema ${schema}: ${err.message}`);
    }
  }

  async function update(schema, model, datos, filtros, transaction = {}) {
    try {
      const Models = await getSchema(schema);
      return await Models[model].update(datos, {
        where: filtros,
        ...transaction,
      });
    } catch (err) {
      throw new Error(`Error al actualizar en ${model} del esquema ${schema}: ${err.message}`);
    }
  }

  async function rawQuery(query, params = {}) {
    try {
      return await sequelize.query(query, {
        replacements: params,
        type: sequelize.QueryTypes.SELECT,
      });
    } catch (err) {
      throw new Error(`Error al ejecutar la consulta: ${err.message}`);
    }
  }

  async function select(schema, model, select = [], filtros = {}, order = []) {
    try {
      const Models = await getSchema(schema);
      const config = {
        attributes: select.length > 0 ? select : undefined,
        where: Object.keys(filtros).length > 0 ? filtros : undefined,
        order,
        raw: true,
      };
      return await Models[model].findAll(config);
    } catch (err) {
      throw new Error(`Error al seleccionar datos de ${model} del esquema ${schema}: ${err.message}`);
    }
  }

  async function selectJoin(
    schema,
    model,
    select = [],
    where = {},
    joinTables = [],
    raw = false,
    order = [],
    group = []
  ) {
    try {
      const Models = await getSchema(schema);
      let tablesIncludes = [];

      function tree(tables, tablesIncludes) {
        tables.forEach((table) => {
          let properties = {
            model: Models[table.name],
            as: table.as,
            required: table.required,
            attributes: table.select,
            where: table.where ?? {},
            order: table.order ?? [],
            group: table.group ?? [],
          };
          if (table.include) {
            properties.include = [];
            tree(table.include, properties.include);
          }
          tablesIncludes.push(properties);
        });
        return tablesIncludes;
      }

      tablesIncludes = tree(joinTables, tablesIncludes);

      const config = {
        attributes: select.length > 0 ? select : undefined,
        where: Object.keys(where).length > 0 ? where : undefined,
        include: tablesIncludes,
        raw,
        order,
        group,
      };

      return await Models[model].findAll(config);
    } catch (err) {
      throw new Error(`Error en selectJoin para ${model} del esquema ${schema}: ${err.message}`);
    }
  }

  return {
    insert,
    update,
    select,
    selectJoin,
    rawQuery,
  };
}
