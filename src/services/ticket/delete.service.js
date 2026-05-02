import {
  Cajas,
  DetallesTicket,
  Movimientos,
  SaldosCupo,
  Sorteos,
  sq,
  Tickets,
} from '../../lib/db.lib.js'

const eliminarTicket = async (ticketId, usuarioId) => {
  const t = await sq.transaction()

  try {
    // 1. Buscar el ticket con sus detalles y sorteo relacionado
    const ticket = await Tickets.findByPk(ticketId, {
      include: [{ model: DetallesTicket }, { model: Sorteos }],
    })

    if (!ticket) {
      await t.rollback()
      return { code: 404, message: 'Ticket no encontrado.' }
    }

    // 2. Bloqueo de seguridad: Estado del sorteo
    if (ticket.Sorteo.estado !== 'Abierto') {
      await t.rollback()
      return {
        code: 400,
        message: 'No se puede anular el ticket porque el sorteo ya está cerrado o finalizado.',
      }
    }

    // 3. Bloqueo de seguridad: Estado del ticket
    if (ticket.estado === 'Anulado') {
      await t.rollback()
      return { code: 400, message: 'Este ticket ya se encuentra anulado.' }
    }
    if (ticket.estado === 'Pagado') {
      await t.rollback()
      return {
        code: 400,
        message: 'No se puede anular un ticket que ya ha sido pagado como premio.',
      }
    }

    const totalTicket = parseFloat(ticket.referencia)

    // 4. Revertir Saldos de Cupo
    for (const detalle of ticket.DetallesTickets) {
      const saldo = await SaldosCupo.findOne({
        where: {
          SorteoId: ticket.SorteoId,
          numeroJugado: detalle.numeroJugado,
        },
        transaction: t,
      })

      if (saldo) {
        await saldo.update(
          {
            montoAcumulado: parseFloat(saldo.montoAcumulado) - parseFloat(detalle.montoApostado),
            montoDisponible: parseFloat(saldo.montoDisponible) + parseFloat(detalle.montoApostado),
          },
          { transaction: t }
        )
      }
    }

    // 5. Validar Caja Abierta para el egreso
    const caja = await Cajas.findOne({
      where: { PuntoVentaId: ticket.PuntoVentaId, estado: 'Abierta' },
      transaction: t,
    })

    if (!caja) {
      await t.rollback()
      return { code: 400, message: 'No se encontró una caja abierta para procesar la anulación.' }
    }

    // 6. Registrar Movimiento de Egreso
    await Movimientos.create(
      {
        tipo: 'Egreso',
        categoria: 'Anulacion',
        monto: totalTicket,
        descripcion: `Anulación de Ticket Código: ${ticket.codigo}`,
        CajaId: caja.id,
        PuntoVentaId: ticket.PuntoVentaId,
        UsuarioId: usuarioId,
      },
      { transaction: t }
    )

    // 7. Actualizar Saldo de la Caja
    await caja.update(
      {
        saldoActual: parseFloat(caja.saldoActual) - totalTicket,
        totalEgresos: parseFloat(caja.totalEgresos || 0) + totalTicket,
      },
      { transaction: t }
    )

    // 8. Actualizar Monto Recaudado del Sorteo
    await ticket.Sorteo.update(
      {
        montoRecaudado: parseFloat(ticket.Sorteo.montoRecaudado) - totalTicket,
      },
      { transaction: t }
    )

    // 9. Marcar como Anulado
    await ticket.update({ estado: 'Anulado' }, { transaction: t })

    await t.commit()

    return {
      code: 200,
      message: 'Ticket anulado correctamente. El cupo y el saldo de caja han sido actualizados.',
    }
  } catch (error) {
    if (t) await t.rollback()
    return { code: 500, message: 'Error interno al anular el ticket: ' + error.message }
  }
}

export { eliminarTicket }
