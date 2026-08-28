import { Op } from 'sequelize'
import { Sorteos, Cifras } from '../../lib/db.lib.js' // Asegúrate de importar el modelo Cifras

const crearSorteo = async (data) => {
  const {
    numero,
    jornada,
    fechaSorteo,
    horaSorteo,
    CatalogoId,
    CifraId,
    fechaCierre,
    horaCierre,
    ambasCifras,
  } = data

  // 1. Validación inicial
  if (
    !numero ||
    !jornada ||
    !fechaSorteo ||
    !horaSorteo ||
    !CatalogoId ||
    (!CifraId && !ambasCifras)
  ) {
    return { code: 400, message: 'Faltan campos obligatorios.' }
  }

  // 2. Definir qué IDs de cifra vamos a procesar
  let listaCifras = []
  if (ambasCifras) {
    // Obtenemos todos los registros de Cifras
    const todasLasCifras = await Cifras.findAll({
      where: {
        activo: true,
      },
    })
    listaCifras = todasLasCifras.map((c) => c.id)
  } else {
    listaCifras = [CifraId]
  }

  // 3. Validación de sorteo activo para cada cifra
  for (const id of listaCifras) {
    const sorteoActivo = await Sorteos.findOne({
      where: { CatalogoId, CifraId: id, estado: { [Op.ne]: 'Finalizado' } },
    })
    if (sorteoActivo) {
      return {
        code: 400,
        message: `Ya existe un sorteo activo para la cifra con ID: ${id}`,
      }
    }
  }

  // 4. Lógica de cálculo de hora de cierre (se mantiene igual)
  let fCierre = fechaCierre
  let hCierre = horaCierre
  if (!hCierre) {
    const [horas, minutos] = horaSorteo.split(':')
    const fechaAux = new Date()
    fechaAux.setHours(parseInt(horas), parseInt(minutos) - 5, 0)
    hCierre = `${fechaAux.getHours().toString().padStart(2, '0')}:${fechaAux.getMinutes().toString().padStart(2, '0')}:00`
    fCierre = fCierre || fechaSorteo
  }

  // 5. Creación de los sorteos (en bucle si son varias cifras)
  const sorteosCreados = []
  for (const id of listaCifras) {
    const nuevoSorteo = await Sorteos.create({
      numero,
      jornada,
      fechaSorteo,
      horaSorteo,
      fechaCierre: fCierre,
      horaCierre: hCierre,
      CatalogoId,
      CifraId: id,
      estado: 'Abierto',
      montoRecaudado: 0,
      montoPorPagar: 0,
      montoPagado: 0,
      utilidadNeta: 0,
    })
    sorteosCreados.push(nuevoSorteo)
  }

  return {
    code: 201,
    message: ambasCifras
      ? 'Sorteos creados exitosamente para todas las cifras'
      : 'Sorteo creado exitosamente',
    data: sorteosCreados,
  }
}

export { crearSorteo }
