import { Cifras } from "../../lib/db.lib.js";

const agregarCifra = async (data) => {
  const { cantidad } = data;
  const cifra = await Cifras.findOne({
    where: {
      cantidad,
    },
  });

  if (cifra) return { code: 400, message: "Ya existe esta cifra" };

  await Cifras.create(data);
  return { code: 201, message: "Cifra agregada con éxito" };
};

export { agregarCifra };
