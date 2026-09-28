import { CupoJornadas, Catalogos, Cifras } from "../../lib/db.lib.js";

export const registrarCupoJornada = async (data) => {
  console.log(data);
  const { CatalogoId, CifraId, jornada, cupoMaximo } = data;

  const jornadasPermitidas = ["Mañanera", "Matutina", "Vespertina", "Nocturna"];

  if (!jornadasPermitidas.includes(jornada)) {
    return {
      code: 400,
      message: `Jornada inválida. Las permitidas son ${jornadasPermitidas.join(", ")}.`,
    };
  }

  const cupoNum = Number(cupoMaximo);
  if (isNaN(cupoNum) || cupoNum < 0) {
    return {
      code: 400,
      message: "El cupo debe ser un valor válido mayor a 0.00",
    };
  }

  const catalogoExiste = await Catalogos.findByPk(CatalogoId);

  if (!catalogoExiste) {
    return {
      code: 400,
      message: "El catálogo de lotería especificado no existe.",
    };
  }

  const cifraExiste = await Cifras.findByPk(CifraId);

  if (!cifraExiste) {
    return {
      code: 400,
      message: "El tipo de cifra especificado no existe.",
    };
  }

  const cupoJornada = await CupoJornadas.findOne({
    where: {
      CatalogoId,
      CifraId,
      jornada,
    },
  });

  if (cupoJornada) {
    return {
      code: 400,
      message: `Ya existe una configuración de cupo para la lotería, tipo de cifra y la jornada [${jornada}] seleccionados.`,
    };
  }

  await CupoJornadas.create({
    CatalogoId,
    CifraId,
    jornada,
    cupoMaximo: cupoNum,
  });

  return {
    code: 201,
    message: "Configuación de cupo registrada con éxito.",
  };
};
