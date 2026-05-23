import {
  Cajas,
  Catalogos,
  Cifras,
  Clientes,
  DetallesTicket,
  Movimientos,
  PuntosVenta,
  Sorteos,
  sq,
  Tickets,
  Usuarios,
} from '../../lib/db.lib.js'

// const restarDiasHabiles = (fecha, dias) => {
//   let fechaResult = new Date(fecha)
//   let count = 0
//   while (count < dias) {
//     fechaResult.setDate(fechaResult.getDate() - 1)
//     const day = fechaResult.getDay()
//     if (day !== 0 && day !== 6) {
//       // 0 = Domingo, 6 = Sábado
//       count++
//     }
//   }
//   return fechaResult
// }

const expirarTicketsPorVencimiento = async () => {
  const t = await sq.transaction()
  try {
    const hoy = new Date()

    // 1. Buscamos directamente en la tabla Ganadores los que ya pasaron su fecha
    const premiosVencidos = await Ganadores.findAll({
      where: {
        estadoPago: 'Pendiente',
        fechaCaducidad: { [Op.lt]: hoy }, // Más simple: ¿Caducó ya?
      },
      include: [
        {
          model: Tickets,
          include: [{ model: Sorteos }], // Para poder restar la deuda del sorteo
        },
      ],
      transaction: t,
    })

    if (premiosVencidos.length === 0) {
      await t.rollback()
      return { count: 0 }
    }

    for (const ganador of premiosVencidos) {
      const premio = parseFloat(ganador.montoPremio || 0)
      const ticket = ganador.Ticket
      const sorteo = ticket.Sorteo

      // 2. Revertir la deuda del sorteo (Auditoría)
      await sorteo.update(
        {
          montoPorPagar: parseFloat(sorteo.montoPorPagar) - premio,
        },
        { transaction: t }
      )

      // 3. Marcar el premio como Expirado
      await ganador.update({ estadoPago: 'Expirado' }, { transaction: t })

      // 4. (Opcional) También marcar el ticket original como Expirado
      await ticket.update({ estado: 'Expirado' }, { transaction: t })
    }

    await t.commit()
    return { count: premiosVencidos.length }
  } catch (error) {
    if (t) await t.rollback()
    throw error
  }
}

const pagarTicket = async (ticketId, usuarioId, cajaId) => {
  // Iniciamos la transacción para asegurar la integridad de los datos
  const t = await sq.transaction()

  try {
    // 1. Buscar el ticket con LOCK e INNER JOIN forzado
    // Esto soluciona el error: "FOR UPDATE cannot be applied to the nullable side of an outer join"
    const ticket = await Tickets.findByPk(ticketId, {
      include: [
        {
          model: Sorteos,
          required: true, // Forzamos INNER JOIN para que el LOCK funcione en Postgres
        },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    })

    if (!ticket) {
      await t.rollback()
      return { code: 404, message: 'Ticket no encontrado.' }
    }

    // 2. Validaciones de Negocio
    if (ticket.resultado !== 'Ganador') {
      await t.rollback()
      return { code: 400, message: 'Este ticket no está marcado como Ganador.' }
    }

    if (ticket.estado === 'Pagado') {
      await t.rollback()
      return { code: 400, message: 'Este ticket ya fue pagado anteriormente.' }
    }

    if (['Anulado', 'Expirado'].includes(ticket.estado)) {
      await t.rollback()
      return { code: 400, message: `No se puede pagar un ticket en estado: ${ticket.estado}.` }
    }

    const totalAPagar = parseFloat(ticket.montoTotalPremio || 0)

    if (totalAPagar <= 0) {
      await t.rollback()
      return { code: 400, message: 'El ticket no tiene un monto de premio válido.' }
    }

    // 3. Validar Caja y Saldo con LOCK
    const caja = await Cajas.findByPk(cajaId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    })

    if (!caja || caja.estado !== 'Abierta') {
      await t.rollback()
      return { code: 400, message: 'La caja no existe o no se encuentra abierta.' }
    }

    if (parseFloat(caja.saldoActual) < totalAPagar) {
      await t.rollback()
      return {
        code: 400,
        message: `Saldo insuficiente en caja. Disponible: $${parseFloat(caja.saldoActual).toFixed(2)}`,
      }
    }

    // 4. Registrar Movimiento de Egreso
    const movimiento = await Movimientos.create(
      {
        tipo: 'Egreso',
        categoria: 'Pago Premio',
        monto: totalAPagar,
        descripcion: `PAGO PREMIO - TICKET: ${ticket.codigo}`,
        CajaId: caja.id,
        PuntoVentaId: ticket.PuntoVentaId,
        UsuarioId: usuarioId,
      },
      { transaction: t }
    )

    // 5. Actualizar Saldo de la Caja
    await caja.update(
      {
        saldoActual: parseFloat(caja.saldoActual) - totalAPagar,
        totalEgresos: parseFloat(caja.totalEgresos || 0) + totalAPagar,
      },
      { transaction: t }
    )

    // 6. Actualizar Contadores del Sorteo (montoPorPagar y montoPagado)
    await ticket.Sorteo.decrement('montoPorPagar', { by: totalAPagar, transaction: t })
    await ticket.Sorteo.increment('montoPagado', { by: totalAPagar, transaction: t })

    // 7. Finalizar cambiando el estado del Ticket y vinculando el movimiento
    await ticket.update(
      {
        estado: 'Pagado',
        MovimientoId: movimiento.id,
        fechaPago: new Date(),
      },
      { transaction: t }
    )

    // Confirmamos todos los cambios en la base de datos
    await t.commit()

    // 8. Recuperar la caja final para devolver el saldo actualizado al frontend
    const cajaFinal = await Cajas.findByPk(cajaId)

    // 9. Recuperar el ticket completo con la estructura exacta de tu log
    const ticketPagadoCompleto = await Tickets.findByPk(ticketId, {
      include: [
        { model: DetallesTicket },
        { model: PuntosVenta },
        { model: Usuarios },
        { model: Clientes },
        {
          model: Sorteos,
          include: [{ model: Catalogos }, { model: Cifras }],
        },
      ],
    })

    return {
      code: 200,
      message: `¡Éxito! Se pagaron $${totalAPagar.toFixed(2)} correctamente.`,
      caja: cajaFinal,
      ticket: ticketPagadoCompleto,
    }
  } catch (error) {
    if (t) await t.rollback()
    console.error('Error en pagarTicket:', error.message)
    return {
      code: 500,
      message: 'Error crítico en el servidor: ' + error.message,
    }
  }
}
export { expirarTicketsPorVencimiento, pagarTicket }
