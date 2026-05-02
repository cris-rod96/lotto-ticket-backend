import { Sorteos } from '../../lib/db.lib.js'

const crearSorteo = async (data) => {
  const {
    numero,
    jornada,
    fechaSorteo,
    horaSorteo,
    CatalogoId, // Representa el País/Lotería (Ecuador o Argentina)
    CifraId, // Representa el tipo (2 cifras o 3 cifras)
    fechaCierre,
    horaCierre,
  } = data

  // 1. Validación de campos obligatorios
  if (!numero || !jornada || !fechaSorteo || !horaSorteo || !CatalogoId || !CifraId) {
    return { code: 400, message: 'Faltan campos obligatorios para crear el sorteo.' }
  }

  // 2. VALIDACIÓN DE DUPLICADOS
  // Verificamos si ya existe un sorteo para el mismo día, jornada, país y tipo de cifra
  const sorteoExistente = await Sorteos.findOne({
    where: {
      fechaSorteo,
      jornada,
      CatalogoId,
      CifraId,
    },
  })

  if (sorteoExistente) {
    return {
      code: 400,
      message: `Ya existe un sorteo de ${jornada} para esta lotería y tipo de cifra en la fecha seleccionada.`,
    }
  }

  // 3. Lógica de cálculo de hora de cierre automática
  let fCierre = fechaCierre
  let hCierre = horaCierre

  if (!hCierre) {
    const [horas, minutos] = horaSorteo.split(':')
    const fechaAux = new Date()
    fechaAux.setHours(parseInt(horas), parseInt(minutos) - 5, 0)

    hCierre = `${fechaAux.getHours().toString().padStart(2, '0')}:${fechaAux.getMinutes().toString().padStart(2, '0')}:00`
    fCierre = fCierre || fechaSorteo
  }

  // 4. Creación del registro
  const nuevoSorteo = await Sorteos.create({
    numero,
    jornada,
    fechaSorteo,
    horaSorteo,
    fechaCierre: fCierre,
    horaCierre: hCierre,
    CatalogoId,
    CifraId,
    estado: 'Abierto',
    montoRecaudado: 0,
    montoPorPagar: 0,
    montoPagado: 0,
    utilidadNeta: 0,
  })

  return {
    code: 201,
    message: 'Sorteo creado exitosamente',
    data: nuevoSorteo,
  }
}

export { crearSorteo }
