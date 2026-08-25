import { Op } from 'sequelize'
import {
  Catalogos,
  Cifras,
  DetallesResultado,
  DetallesSuerte,
  DetallesTicket,
  Ganadores,
  Resultados,
  Sorteos,
  sq,
  Suertes,
  Tickets,
} from '../../lib/db.lib.js'

const calcularFechaExpiracion = (fechaInicio) => {
  let diasContados = 0
  let fechaFinal = new Date(fechaInicio)
  while (diasContados < 4) {
    fechaFinal.setDate(fechaFinal.getDate() + 1)
    if (fechaFinal.getDay() !== 0) diasContados++
  }
  fechaFinal.setHours(23, 59, 59, 999)
  return fechaFinal
}

const registrarResultados = async (data) => {
  const t = await sq.transaction()

  try {
    const { SorteoId, resultadosArr } = data

    const sorteo = await Sorteos.findByPk(SorteoId)
    if (!sorteo || sorteo.estado !== 'Cerrado') {
      await t.rollback()
      return { code: 400, message: 'Sorteo no encontrado o no está cerrado.' }
    }

    const fechaDeCaducidad = calcularFechaExpiracion(sorteo.fechaSorteo)
    const nuevoResultado = await Resultados.create(
      { SorteoId },
      { transaction: t },
    )
    let totalPremiosSorteo = 0

    // Bucle independiente por cada suerte enviada
    for (const res of resultadosArr) {
      // 1. Buscamos tickets cuyo número jugado coincida con el número premiado de ESTA suerte
      const detallesGanadores = await DetallesTicket.findAll({
        include: [
          {
            model: Tickets,
            where: { SorteoId, estado: 'Pendiente' },
            attributes: ['id', 'PuntoVentaId'],
          },
        ],
        where: { numeroJugado: res.numeroSorteado },
        transaction: t,
      })

      // 2. Registramos el detalle del resultado oficial para esta suerte específica
      // (Aquí se crea el registro en DetallesResultado que mencionaste)
      const detalleRes = await DetallesResultado.create(
        {
          ResultadoId: nuevoResultado.id,
          SuerteId: res.SuerteId,
          numeroGanador: res.numeroSorteado,
        },
        { transaction: t },
      )

      // 3. Procesamos los ganadores de ESTA suerte
      for (const detalle of detallesGanadores) {
        const configuracionPremio = await DetallesSuerte.findOne({
          where: {
            SuerteId: res.SuerteId,
            PuntoVentaId: detalle.Ticket.PuntoVentaId,
          },
          transaction: t,
        })

        const multiplicadorPremio = configuracionPremio
          ? parseFloat(configuracionPremio.premio)
          : 0
        const valorPremio =
          parseFloat(detalle.montoApostado) * multiplicadorPremio

        await detalle.update({ montoPremio: valorPremio }, { transaction: t })

        await Tickets.update(
          {
            resultado: 'Ganador',
            montoTotalPremio: sq.literal(`"montoTotalPremio" + ${valorPremio}`),
          },
          { where: { id: detalle.TicketId }, transaction: t },
        )

        await Ganadores.create(
          {
            TicketId: detalle.TicketId,
            DetalleResultadoId: detalleRes.id,
            montoPremio: valorPremio,
            fechaCaducidad: fechaDeCaducidad,
            estadoPago: 'Pendiente',
          },
          { transaction: t },
        )

        totalPremiosSorteo += valorPremio
      }
    }

    // 4. Finalizamos los tickets que no ganaron
    await Tickets.update(
      { resultado: 'No Ganador', estado: 'Expirado' },
      {
        where: {
          SorteoId,
          resultado: 'Pendiente',
          estado: { [Op.in]: ['Pendiente'] },
        },
        transaction: t,
      },
    )

    // 5. Cierre financiero del sorteo
    await sorteo.update(
      {
        estado: 'Finalizado',
        montoPorPagar: totalPremiosSorteo,
        utilidadNeta:
          parseFloat(sorteo.montoRecaudado || 0) - totalPremiosSorteo,
      },
      { transaction: t },
    )

    await t.commit()

    // 6. Retorno del objeto completo (usando include para traer todo el árbol)
    const resultadoFinal = await Resultados.findByPk(nuevoResultado.id, {
      include: [
        {
          model: Sorteos,
          include: [Catalogos, Cifras], // Asegúrate que sean Catalogos (en plural) si así lo tienes en tu listar
        },
        {
          model: DetallesResultado,
          // Si necesitas cargar las suertes dentro de los detalles para que el flyer
          // pueda acceder a la descripción de la suerte (ej: "1ra Suerte"), inclúyelas:
          include: [{ model: Suertes }],
        },
      ],
    })

    return {
      code: 201,
      message: 'Resultados procesados con éxito.',
      resultado: resultadoFinal,
    }
  } catch (error) {
    if (t && !t.finished) {
      await t.rollback()
    }
    console.error('Error en escrutinio:', error)
    return { code: 500, message: 'Error: ' + error.message }
  }
}
export { registrarResultados }
