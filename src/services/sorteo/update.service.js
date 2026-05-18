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

  // 2. Ejecutamos la actualización con los datos locales correctos
  const [afectados] = await Sorteos.update(
    { estado: 'Cerrado' },
    {
      where: {
        estado: 'Abierto',
        [Op.or]: [
          { fechaCierre: { [Op.lt]: fechaActual } }, // Si la fecha ya es menor a hoy (13)
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
}

const actualizarSorteo = async (id, data) => {
  const { CatalogoId, CifraId, horaSorteo, fechaSorteo } = data

  // 1. Verificar si el sorteo existe
  const sorteo = await Sorteos.findByPk(id)
  if (!sorteo) return { code: 404, message: 'Sorteo no encontrado.' }

  // 2. Bloqueo de seguridad: Si ya hay tickets vendidos, no permitimos cambiar Lotería o Cifras
  if (CatalogoId || CifraId) {
    const tieneVentas = await Tickets.findOne({ where: { SorteoId: id } })
    if (tieneVentas) {
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
  }

  // 4. Actualizar el registro
  await sorteo.update(data)

  return {
    code: 200,
    message: 'Sorteo actualizado correctamente',
    data: sorteo,
  }
}

export { actualizarSorteo, verificarCierreSorteos }
