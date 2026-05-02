import {
  DetallesResultado,
  DetallesTicket,
  Resultados,
  Sorteos,
  sq,
  Suertes,
  Tickets,
} from '../../lib/db.lib.js'

const registrarResultados = async (data) => {
  const t = await sq.transaction()

  try {
    const { SorteoId, resultadosArr } = data // [{ SuerteId, numeroSorteado }]

    // 1. Validaciones de estado del Sorteo
    const sorteo = await Sorteos.findByPk(SorteoId)
    if (!sorteo) {
      await t.rollback()
      return { code: 404, message: 'Sorteo no encontrado.' }
    }
    if (sorteo.estado !== 'Cerrado') {
      await t.rollback()
      return { code: 400, message: 'El sorteo debe estar Cerrado para ingresar resultados.' }
    }

    // 2. Crear cabecera del resultado
    const nuevoResultado = await Resultados.create({ SorteoId }, { transaction: t })

    let totalPremiosSorteo = 0

    // 3. Procesar cada Suerte premiada
    for (const res of resultadosArr) {
      // Obtenemos la configuración de la suerte (aquí está el multiplicador en 'premio')
      const suerteInfo = await Suertes.findByPk(res.SuerteId)
      if (!suerteInfo) continue

      // Buscar aciertos: Tickets pendientes de este sorteo con el número ganador
      const detallesGanadores = await DetallesTicket.findAll({
        include: [
          {
            model: Tickets,
            where: { SorteoId, estado: 'Pendiente' },
          },
        ],
        where: { numeroJugado: res.numeroSorteado },
        transaction: t,
      })

      for (const detalle of detallesGanadores) {
        // 1. CÁLCULO: Apostado * Multiplicador de la Suerte
        const valorPremio = parseFloat(detalle.montoApostado) * parseFloat(suerteInfo.premio)

        // 2. Actualizar el detalle con su premio específico
        await detalle.update({ montoPremio: valorPremio }, { transaction: t })

        // 3. ACTUALIZACIÓN CRÍTICA:
        // Buscamos el ticket para sumarle el premio al montoTotalPremio de la cabecera
        const ticketACoordinar = await Tickets.findByPk(detalle.TicketId, { transaction: t })

        await ticketACoordinar.update(
          {
            resultado: 'Ganador',
            // Sumamos el valor anterior + el nuevo premio (por si el ticket ganó en varias suertes)
            montoTotalPremio: parseFloat(ticketACoordinar.montoTotalPremio || 0) + valorPremio,
          },
          { transaction: t }
        )

        // 4. Acumular para el balance final del sorteo
        totalPremiosSorteo += valorPremio
      }

      // 4. Guardar en DetallesResultado para el acta del sorteo
      await DetallesResultado.create(
        {
          SuerteId: res.SuerteId,
          numeroSorteado: res.numeroSorteado, // El número que salió en la tómbola
          numeroGanador: res.numeroSorteado,
          cantidadGanadores: detallesGanadores.length,
          ResultadoId: nuevoResultado.id,
        },
        { transaction: t }
      )
    }

    // 5. Los que no aparecieron en ninguna suerte pasan a 'No Ganador'
    await Tickets.update(
      { resultado: 'No Ganador' },
      {
        where: {
          SorteoId,
          resultado: 'Pendiente',
          estado: 'Pendiente',
        },
        transaction: t,
      }
    )

    // 6. Cierre financiero del Sorteo
    await sorteo.update(
      {
        estado: 'Finalizado',
        montoPorPagar: totalPremiosSorteo,
        utilidadNeta: parseFloat(sorteo.montoRecaudado || 0) - totalPremiosSorteo,
      },
      { transaction: t }
    )

    await t.commit()
    return {
      code: 201,
      message: 'Resultados procesados. Sorteo finalizado y premios calculados.',
    }
  } catch (error) {
    if (t) await t.rollback()
    return { code: 500, message: 'Error en el proceso de resultados: ' + error.message }
  }
}

export { registrarResultados }
