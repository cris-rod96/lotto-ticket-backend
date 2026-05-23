import { Op } from 'sequelize' // Importamos los operadores de Sequelize
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

  // 2. NUEVA VALIDACIÓN: Verificar si hay algún sorteo previo que NO esté finalizado
  // Filtramos por la misma Lotería (CatalogoId) y tipo de cifra (CifraId)
  const sorteoActivo = await Sorteos.findOne({
    where: {
      CatalogoId,
      CifraId,
      estado: {
        [Op.ne]: 'Finalizado', // Cualquier estado diferente de 'Finalizado' (ej: 'Abierto', 'Cerrado', 'En Juego')
      },
    },
  })

  if (sorteoActivo) {
    return {
      code: 400,
      message: `No se puede crear el sorteo. Ya existe un sorteo activo (Estado: ${sorteoActivo.estado}) para esta lotería y tipo de cifra que no ha sido finalizado.`,
    }
  }

  // 3. VALIDACIÓN DE DUPLICADOS (Mantiene tu control por si acaso, aunque la validación anterior es más restrictiva)
  const sorteoExistente = await Sorteos.findOne({
    where: {
      fechaSorteo,
      jornada,
      CatalogoId,
      CifraId,
      estado: {
        [Op.ne]: 'Finalizado',
      },
    },
  })

  if (sorteoExistente) {
    return {
      code: 400,
      message: `Ya existe un sorteo de ${jornada} para esta lotería y tipo de cifra en la fecha seleccionada.`,
    }
  }

  // 4. Lógica de cálculo de hora de cierre automática
  let fCierre = fechaCierre
  let hCierre = horaCierre

  if (!hCierre) {
    const [horas, minutos] = horaSorteo.split(':')
    const fechaAux = new Date()
    fechaAux.setHours(parseInt(horas), parseInt(minutos) - 5, 0)

    hCierre = `${fechaAux.getHours().toString().padStart(2, '0')}:${fechaAux.getMinutes().toString().padStart(2, '0')}:00`
    fCierre = fCierre || fechaSorteo
  }

  // 5. Creación del registro
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
