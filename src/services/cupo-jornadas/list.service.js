import { Catalogos, Cifras, CupoJornadas } from "../../lib/db.lib.js";

const listarTodos = async () => {
  const cuposJornadas = await CupoJornadas.findAll({
    include: [
      {
        model: Catalogos,
      },
      {
        model: Cifras,
      },
    ],
  });

  return {
    code: 200,
    cuposJornadas,
  };
};

export { listarTodos };
