import {
  DetallesResultado,
  DetallesSuerte,
  DetallesTicket,
  Ganadores,
  Resultados,
  Sorteos,
  sq,
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
    const nuevoResultado = await Resultados.create({ SorteoId }, { transaction: t })
    let totalPremiosSorteo = 0

    for (const res of resultadosArr) {
      // 1. Buscamos los tickets que jugaron el número ganador
      const detallesGanadores = await DetallesTicket.findAll({
        include: [
          {
            model: Tickets,
            where: { SorteoId, estado: 'Pendiente' },
            attributes: ['id', 'PuntoVentaId', 'montoTotalPremio'], // Traemos el PuntoVentaId
          },
        ],
        where: { numeroJugado: res.numeroSorteado },
        transaction: t,
      })

      // 2. Registramos el detalle del resultado oficial
      const detalleRes = await DetallesResultado.create(
        {
          SuerteId: res.SuerteId,
          numeroGanador: res.numeroSorteado,
          cantidadGanadores: detallesGanadores.length,
          ResultadoId: nuevoResultado.id,
        },
        { transaction: t }
      )

      for (const detalle of detallesGanadores) {
        // --- LO DELICIOSO: BUSCAR EL PREMIO SEGÚN EL LOCAL DEL TICKET ---
        const configuracionPremio = await DetallesSuerte.findOne({
          where: {
            SuerteId: res.SuerteId,
            PuntoVentaId: detalle.Ticket.PuntoVentaId,
          },
          transaction: t,
        })

        // Si por algún error no hay premio configurado, usamos 0 para no romper el proceso
        const multiplicadorPremio = configuracionPremio ? parseFloat(configuracionPremio.premio) : 0
        const valorPremio = parseFloat(detalle.montoApostado) * multiplicadorPremio

        // 3. Actualizar detalle del ticket (monto ganado en esta suerte)
        await detalle.update({ montoPremio: valorPremio }, { transaction: t })

        // 4. Actualizar cabecera del ticket (Acumulamos si ganó en varias suertes)
        const ticketId = detalle.TicketId
        await Tickets.update(
          {
            resultado: 'Ganador',
            montoTotalPremio: sq.literal(`"montoTotalPremio" + ${valorPremio}`),
          },
          { where: { id: ticketId }, transaction: t }
        )

        // 5. Crear el registro oficial de Ganador para cobro
        await Ganadores.create(
          {
            TicketId: ticketId,
            DetalleResultadoId: detalleRes.id,
            montoPremio: valorPremio,
            fechaCaducidad: fechaDeCaducidad,
            estadoPago: 'Pendiente',
          },
          { transaction: t }
        )

        totalPremiosSorteo += valorPremio
      }
    }

    // 6. Marcar tickets perdedores
    await Tickets.update(
      { resultado: 'No Ganador', estado: 'Expirado' },
      { where: { SorteoId, resultado: 'Pendiente', estado: 'Pendiente' }, transaction: t }
    )

    // 7. Cierre financiero del Sorteo
    await sorteo.update(
      {
        estado: 'Finalizado',
        montoPorPagar: totalPremiosSorteo,
        utilidadNeta: parseFloat(sorteo.montoRecaudado || 0) - totalPremiosSorteo,
      },
      { transaction: t }
    )

    await t.commit()
    return { code: 201, message: 'Resultados procesados y ganadores generados con éxito.' }
  } catch (error) {
    if (t) await t.rollback()
    console.error('Error en escrutinio:', error)
    return { code: 500, message: 'Error: ' + error.message }
  }
}

export { registrarResultados }
