import { Op } from 'sequelize'
import { Sorteos, Tickets } from '../../lib/db.lib.js'

const verificarCierreSorteos = async () => {
  // 1. Obtenemos la fecha y hora actual forzando la zona horaria de Ecuador
  const ahora = new Date()

  // 'en-CA' nos da el formato YYYY-MM-DD que requiere tu base de datos
  const fechaActual = ahora.toLocaleDateString('en-CA', {
    timeZone: 'America/Guayaquil',
  })

  // 'es-EC' con hour12: false nos da el formato 24h HH:mm:ss
  const horaActual = ahora.toLocaleTimeString('es-EC', {
    timeZone: 'America/Guayaquil',
    hour12: false,
  })

  console.log(`[Sistema] Verificando: Hoy es ${fechaActual} y son las ${horaActual}`)

  // 2. Ejecutamos la actualización normal con los datos locales correctos
  const [afectados] = await Sorteos.update(
    { estado: 'Cerrado' },
    {
      where: {
        estado: 'Abierto',
        [Op.or]: [
          { fechaCierre: { [Op.lt]: fechaActual } }, // Si la fecha ya es menor a hoy
          {
            [Op.and]: [
              { fechaCierre: fechaActual },
              { horaCierre: { [Op.lte]: horaActual } }, // Si es hoy pero la hora ya pasó
            ],
          },
        ],
      },
    }
  )

  if (afectados > 0) {
    console.log(`[Sistema] Se han cerrado ${afectados} sorteos automáticamente.`)
  }

  // =========================================================================
  // LOGICA FAIL-SAFE (AUTOREPARACIÓN PARA RENDER/DESFASES DE RELOJ)
  // =========================================================================
  // Buscamos si se cerró erróneamente algún sorteo cuyo tiempo real de cierre NO ha vencido.
  // Es decir: Que su fecha sea mayor a hoy, o que sea hoy pero su hora de cierre sea estrictamente mayor a la actual.
  const [reabiertos] = await Sorteos.update(
    { estado: 'Abierto' },
    {
      where: {
        estado: 'Cerrado', // Revisamos los que están cerrados
        [Op.or]: [
          { fechaCierre: { [Op.gt]: fechaActual } }, // Caso A: La fecha de cierre es en el futuro
          {
            [Op.and]: [
              { fechaCierre: fechaActual },
              { horaCierre: { [Op.gt]: horaActual } }, // Caso B: Es hoy, pero la hora de cierre aún no llega
            ],
          },
        ],
      },
    }
  )

  if (reabiertos > 0) {
    console.warn(
      `[ALERTA SISTEMA]: Se detectaron ${reabiertos} sorteos cerrados antes de tiempo por desfase de reloj. ¡Han sido reabiertos automáticamente!`
    )
  }
  // =========================================================================
}

const actualizarSorteo = async (id, data) => {
  try {
    const { CatalogoId, CifraId, horaSorteo, fechaSorteo } = data

    // 1. Verificar si el sorteo existe
    const sorteo = await Sorteos.findByPk(id)
    if (!sorteo) {
      return { code: 404, message: 'Sorteo no encontrado.' }
    }

    // 2. Bloqueo de seguridad inteligente
    const cambiaCatalogo = CatalogoId && CatalogoId !== sorteo.CatalogoId
    const cambiaCifra = CifraId && CifraId !== sorteo.CifraId

    if (cambiaCatalogo || cambiaCifra) {
      const tieneVentas = await Tickets.count({ where: { SorteoId: id } })

      if (tieneVentas > 0) {
        return {
          code: 400,
          message:
            'No se puede cambiar la lotería o el tipo de cifra porque ya existen tickets vendidos para este sorteo.',
        }
      }
    }

    // 3. Recalcular hora de cierre si se cambia la hora del sorteo
    if (horaSorteo && !data.horaCierre) {
      const [horas, minutos] = horaSorteo.split(':')
      const fechaAux = new Date()
      fechaAux.setHours(parseInt(horas), parseInt(minutos) - 5, 0)

      data.horaCierre = `${fechaAux.getHours().toString().padStart(2, '0')}:${fechaAux.getMinutes().toString().padStart(2, '0')}:00`
      data.fechaCierre = data.fechaCierre || fechaSorteo || sorteo.fechaSorteo
    } else if (fechaSorteo && !data.fechaCierre) {
      data.fechaCierre = fechaSorteo
    }

    // 4. Actualizar el registro
    await sorteo.update(data)

    return {
      code: 200,
      message: 'Sorteo actualizado correctamente',
      data: sorteo,
    }
  } catch (error) {
    console.error('Error al actualizar sorteo:', error.message)
    return {
      code: 500,
      message: 'Error interno del servidor al intentar actualizar el sorteo: ' + error.message,
    }
  }
}

export { actualizarSorteo, verificarCierreSorteos }
