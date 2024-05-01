////@ts-check
import sequelizeMulti from "./Sequelize.js";
import dotenv from "dotenv";
// import error from "../utils/error.js";
dotenv.config();

export default function store(name) {
  const dbname = name ?? process.env.db;
  const sequelize = sequelizeMulti(dbname);

  async function getSchema(schema) {
    const module = `./models/${schema}/init-models.js`;
    const importedSchema = await import(module);
    return await importedSchema.default(sequelize);
  }

  async function insert(schema, model, datos, transaction = {}) {
    const Models = await getSchema(schema);
    return await Models[model].create(datos, transaction);
  }

  async function update(schema, model, datos, filtros, transaction = {}) {
    const Models = await getSchema(schema);
    return await Models[model].update(datos, {
      where: filtros,
      ...transaction,
    });
  }

  async function rawQuery(query, params = {}) {
    return await sequelize.query(query, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT,
    });
  }

  async function select(
    schema,
    model,
    select = [],
    filtros = {},
    order = [],
  ) {
    const Models = await getSchema(schema);
    let config = {};
    config["order"] = order;
    if (select.length > 0) config["attributes"] = select;
    if (filtros) config["where"] = filtros;
    config["raw"] = true;
    return await Models[model].findAll(config);
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
    const Models = await getSchema(schema);
    let config = {};
    let tablesIncludes = [];
    if (select) config["attributes"] = select;
    if (where) config["where"] = where;
    config["raw"] = raw;
    config["order"] = order;
    config["group"] = group;
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
        if (table.include != undefined) {
          properties.include = [];
          tree(table.include, properties.include);
        }
        tablesIncludes.push(properties);
      });
      return tablesIncludes;
    }
    tablesIncludes = tree(joinTables, tablesIncludes);
    config["include"] = tablesIncludes;
    return await Models[model].findAll(config);
  }

  return {
    insert,
    update,
    select,
    selectJoin,
    rawQuery,
  };
}
