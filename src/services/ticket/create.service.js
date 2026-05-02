import { nanoidHelper } from '../../helpers/index.helpers.js'
import {
  Cajas,
  Cifras,
  DetallesTicket,
  Movimientos,
  SaldosCupo,
  Sorteos,
  sq,
  Tickets,
} from '../../lib/db.lib.js'

const venderTicket = async (data) => {
  const t = await sq.transaction() // Iniciamos la transacción

  try {
    const {
      SorteoId,
      PuntoVentaId,
      UsuarioId,
      ClienteId,
      CajaId,
      detalles, // Array de objetos: [{ numeroJugado, montoApostado }]
    } = data

    // 1. Validar estado del Sorteo (Debe estar 'Abierto')
    const sorteo = await Sorteos.findByPk(SorteoId, { include: [Cifras] })
    if (!sorteo || sorteo.estado !== 'Abierto') {
      return { code: 400, message: 'El sorteo no existe o ya se encuentra cerrado para ventas.' }
    }

    // 2. Validar Caja (Debe estar abierta)
    const caja = await Cajas.findByPk(CajaId)
    if (!caja || caja.estado !== 'Abierta') {
      return { code: 400, message: 'La caja del punto de venta no está abierta.' }
    }

    let totalTicket = 0
    const detallesParaCrear = []

    // 3. Procesar cada número jugado y validar CUPOS
    for (const item of detalles) {
      const monto = parseFloat(item.montoApostado)
      totalTicket += monto

      // Buscar si ya existe un registro de saldo para este número en este sorteo
      let saldo = await SaldosCupo.findOne({
        where: { SorteoId, numeroJugado: item.numeroJugado },
        transaction: t,
      })

      // Si no existe, lo creamos basándonos en el cupo máximo de la Cifra (2 o 3 cifras)
      if (!saldo) {
        const cupoMax = sorteo.Cifra.cupoMaximo // Asumiendo que Cifras tiene cupoMaximo
        saldo = await SaldosCupo.create(
          {
            numeroJugado: item.numeroJugado,
            cupoMaximo: cupoMax,
            montoAcumulado: 0,
            montoDisponible: cupoMax,
            SorteoId,
          },
          { transaction: t }
        )
      }

      // Validar si hay cupo disponible
      if (monto > parseFloat(saldo.montoDisponible)) {
        return {
          code: 400,
          message: `Cupo insuficiente para el número ${item.numeroJugado}. Disponible: $${saldo.montoDisponible}`,
        }
      }

      // Actualizar SaldosCupo
      await saldo.update(
        {
          montoAcumulado: parseFloat(saldo.montoAcumulado) + monto,
          montoDisponible: parseFloat(saldo.montoDisponible) - monto,
        },
        { transaction: t }
      )

      detallesParaCrear.push({
        numeroJugado: item.numeroJugado,
        montoApostado: monto,
        montoPremio: 0, // Se calcula al finalizar el sorteo
      })
    }

    const codigo = nanoidHelper.generarCodigo()

    // 4. Crear el Ticket
    const nuevoTicket = await Tickets.create(
      {
        codigo: codigo,
        SorteoId,
        PuntoVentaId,
        UsuarioId,
        ClienteId,
        fechaCaducidad: sorteo.fechaSorteo, // O la lógica de 4 días que mencionaste
        referencia: totalTicket,
      },
      { transaction: t }
    )

    // 5. Crear los Detalles del Ticket
    await DetallesTicket.bulkCreate(
      detallesParaCrear.map((d) => ({ ...d, TicketId: nuevoTicket.id })),
      { transaction: t }
    )

    // 6. Registrar Movimiento de Caja
    await Movimientos.create(
      {
        tipo: 'Ingreso',
        categoria: 'Venta Ticket',
        monto: totalTicket,
        descripcion: `Venta Ticket Código: ${nuevoTicket.codigo}`,
        CajaId,
        PuntoVentaId,
        UsuarioId,
      },
      { transaction: t }
    )

    // 7. Actualizar Saldo de la Caja
    await caja.update(
      {
        saldoActual: parseFloat(caja.saldoActual) + totalTicket,
        totalIngresos: parseFloat(caja.totalIngresos) + totalTicket,
      },
      { transaction: t }
    )

    // 8. Actualizar Monto Recaudado del Sorteo
    await sorteo.update(
      {
        montoRecaudado: parseFloat(sorteo.montoRecaudado) + totalTicket,
      },
      { transaction: t }
    )

    // Si todo salió bien, confirmamos los cambios
    await t.commit()

    return {
      code: 201,
      message: 'Ticket vendido con éxito',
      data: nuevoTicket,
    }
  } catch (error) {
    // Si algo falló, deshacemos todo
    await t.rollback()
    return { code: 400, message: error.message }
  }
}

export { venderTicket }
