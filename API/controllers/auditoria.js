//Dependencias
import { Op } from "sequelize";
import formatDatev3 from "../../utils/formatDatev3.js";
import decodeToken from "../../utils/decodeToken.js";

//Constantes

export default function (sentences) {
  async function insert(data, token) {
    const { ip_ingreso, usuario_ingreso, id_rol } = decodeToken(token);

    const _data = {
      log: JSON.stringify(data),
      ip_ingreso,
      usuario_ingreso: Number(id_rol) === 4 ? "Admin" : usuario_ingreso,
    };

    return await sentences.insert("pastel", "auditoria", _data);
  }

  async function consultar() {
    const auditoria = await sentences.select("pastel", "auditoria", ["*"], {}, [
      ["id_auditoria", "desc"],
    ]);

    return auditoria.map((item) => {
      const log = JSON.parse(item.log);

      return {
        id_auditoria: item.id_auditoria,
        usuario_ingreso: item.usuario_ingreso,
        ...log,
        _fecha: formatDatev3(item.fecha),
      };
    });
  }

  return {
    //GET
    consultar,
    //POST
    insert,
  };
}
