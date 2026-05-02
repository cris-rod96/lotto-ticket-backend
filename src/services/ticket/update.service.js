import { Cajas, Movimientos, Sorteos, sq, Tickets } from '../../lib/db.lib.js'

const restarDiasHabiles = (fecha, dias) => {
  let fechaResult = new Date(fecha)
  let count = 0
  while (count < dias) {
    fechaResult.setDate(fechaResult.getDate() - 1)
    const day = fechaResult.getDay()
    if (day !== 0 && day !== 6) {
      // 0 = Domingo, 6 = Sábado
      count++
    }
  }
  return fechaResult
}

const expirarTicketsPorVencimiento = async () => {
  const t = await sq.transaction()
  try {
    // Calculamos la fecha que representa 4 días hábiles atrás
    const hoy = new Date()
    const fechaLimite = restarDiasHabiles(hoy, 4)

    // 1. Buscar tickets ganadores pendientes con fecha de sorteo menor a la límite
    const ticketsVencidos = await Tickets.findAll({
      where: {
        estado: 'Pendiente',
        resultado: 'Ganador',
      },
      include: [
        {
          model: Sorteos,
          where: {
            fechaSorteo: { [Op.lt]: fechaLimite },
          },
        },
      ],
      transaction: t,
    })

    if (ticketsVencidos.length === 0) {
      await t.rollback()
      return { count: 0 }
    }

    for (const ticket of ticketsVencidos) {
      const premio = parseFloat(ticket.montoTotalPremio || 0)

      // 2. Revertir la deuda del sorteo
      await ticket.Sorteo.update(
        {
          montoPorPagar: parseFloat(ticket.Sorteo.montoPorPagar) - premio,
        },
        { transaction: t }
      )

      // 3. Marcar como Expirado (Estado del ENUM)
      await ticket.update({ estado: 'Expirado' }, { transaction: t })
    }

    await t.commit()
    return { count: ticketsVencidos.length }
  } catch (error) {
    if (t) await t.rollback()
    throw error
  }
}

const pagarTicket = async (ticketId, usuarioId, cajaId) => {
  const t = await sq.transaction()

  try {
    // 1. Buscar el ticket con su sorteo (Ya no necesitamos DetallesTicket por el nuevo campo)
    const ticket = await Tickets.findByPk(ticketId, {
      include: [{ model: Sorteos }],
      transaction: t,
    })

    if (!ticket) {
      await t.rollback()
      return { code: 404, message: 'Ticket no encontrado.' }
    }

    // 2. Validaciones de estado (Usando tus ENUMS)
    if (ticket.resultado !== 'Ganador') {
      await t.rollback()
      return { code: 400, message: 'Este ticket no está marcado como Ganador.' }
    }
    if (ticket.estado === 'Pagado') {
      await t.rollback()
      return { code: 400, message: 'Este ticket ya fue pagado anteriormente.' }
    }
    if (ticket.estado === 'Anulado' || ticket.estado === 'Expirado') {
      await t.rollback()
      return { code: 400, message: `No se puede pagar un ticket en estado: ${ticket.estado}.` }
    }

    // 3. OBTENCIÓN DEL MONTO (Directo del nuevo campo de cabecera)
    const totalAPagar = parseFloat(ticket.montoTotalPremio || 0)

    if (totalAPagar <= 0) {
      await t.rollback()
      return { code: 400, message: 'El ticket no tiene un monto de premio válido para pagar.' }
    }

    // 4. Validar Caja y Saldo Actual
    const caja = await Cajas.findByPk(cajaId, { transaction: t })
    if (!caja || caja.estado !== 'Abierta') {
      await t.rollback()
      return { code: 400, message: 'La caja seleccionada no existe o no está abierta.' }
    }

    if (parseFloat(caja.saldoActual) < totalAPagar) {
      await t.rollback()
      return {
        code: 400,
        message: `Saldo insuficiente en caja. Saldo: $${caja.saldoActual}, Premio: $${totalAPagar.toFixed(2)}`,
      }
    }

    // 5. Registrar Movimiento de Egreso
    await Movimientos.create(
      {
        tipo: 'Egreso',
        categoria: 'Pago Premio',
        monto: totalAPagar,
        descripcion: `Pago de premio - Ticket: ${ticket.codigo}`,
        CajaId: caja.id,
        PuntoVentaId: ticket.PuntoVentaId,
        UsuarioId: usuarioId,
      },
      { transaction: t }
    )

    // 6. Actualizar Saldo de la Caja
    await caja.update(
      {
        saldoActual: parseFloat(caja.saldoActual) - totalAPagar,
        totalEgresos: parseFloat(caja.totalEgresos || 0) + totalAPagar,
      },
      { transaction: t }
    )

    // 7. Actualizar los contadores del Sorteo
    await ticket.Sorteo.update(
      {
        montoPorPagar: parseFloat(ticket.Sorteo.montoPorPagar || 0) - totalAPagar,
        montoPagado: parseFloat(ticket.Sorteo.montoPagado || 0) + totalAPagar,
      },
      { transaction: t }
    )

    // 8. Finalizar cambiando el estado del Ticket
    await ticket.update({ estado: 'Pagado' }, { transaction: t })

    await t.commit()

    return {
      code: 200,
      message: `¡Éxito! Se pagaron $${totalAPagar.toFixed(2)} correctamente.`,
    }
  } catch (error) {
    if (t) await t.rollback()
    return {
      code: 500,
      message: 'Error crítico en el proceso de pago: ' + error.message,
    }
  }
}

export { expirarTicketsPorVencimiento, pagarTicket }
