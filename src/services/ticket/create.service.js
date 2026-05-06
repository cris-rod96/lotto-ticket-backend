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
  const t = await sq.transaction() //

  try {
    const {
      SorteoId,
      PuntoVentaId,
      UsuarioId,
      ClienteId,
      CajaId,
      detalles, // [{ numeroJugado, montoApostado }]
    } = data

    // 1. Validar estado del Sorteo
    const sorteo = await Sorteos.findByPk(SorteoId, { include: [Cifras] }) //
    if (!sorteo || sorteo.estado !== 'Abierto') {
      return { code: 400, message: 'El sorteo no existe o está cerrado.' } //
    }

    // 2. Validar Caja
    const caja = await Cajas.findByPk(CajaId) //
    if (!caja || caja.estado !== 'Abierta') {
      return { code: 400, message: 'La caja no está abierta.' } //
    }

    let totalTicket = 0
    const detallesParaCrear = []

    // 3. Procesar Cupos con Bloqueo de Transacción
    for (const item of detalles) {
      const monto = parseFloat(item.montoApostado)
      totalTicket += monto

      // Buscamos y bloqueamos el registro para que nadie más lo edite simultáneamente
      let saldo = await SaldosCupo.findOne({
        where: { SorteoId, numeroJugado: item.numeroJugado },
        transaction: t,
        lock: t.LOCK.UPDATE, // Garantiza que el cupo verificado sea el real al 100%
      })

      if (!saldo) {
        const cupoMax = parseFloat(sorteo.Cifra.cupoMaximoPorNumero) //
        saldo = await SaldosCupo.create(
          {
            numeroJugado: item.numeroJugado,
            cupoMaximo: cupoMax,
            montoAcumulado: 0,
            montoDisponible: cupoMax,
            SorteoId,
          },
          { transaction: t }
        ) //
      }

      if (monto > parseFloat(saldo.montoDisponible)) {
        throw new Error(
          `Cupo insuficiente para el número ${item.numeroJugado}. Disponible: $${saldo.montoDisponible}`
        )
      }

      await saldo.update(
        {
          montoAcumulado: parseFloat(saldo.montoAcumulado) + monto,
          montoDisponible: parseFloat(saldo.montoDisponible) - monto,
        },
        { transaction: t }
      ) //

      detallesParaCrear.push({
        numeroJugado: item.numeroJugado,
        montoApostado: monto,
        montoPremio: 0,
      })
    }

    const codigo = nanoidHelper.generarCodigo() //

    const nuevoTicket = await Tickets.create(
      {
        codigo,
        SorteoId,
        PuntoVentaId,
        UsuarioId,
        ClienteId,
        fechaCaducidad: sorteo.fechaSorteo,
        referencia: totalTicket,
      },
      { transaction: t }
    ) //

    await DetallesTicket.bulkCreate(
      detallesParaCrear.map((d) => ({ ...d, TicketId: nuevoTicket.id })),
      { transaction: t }
    ) //

    await Movimientos.create(
      {
        tipo: 'Ingreso',
        categoria: 'Venta Ticket',
        monto: totalTicket,
        descripcion: `Venta Ticket: ${nuevoTicket.codigo}`,
        CajaId,
        PuntoVentaId,
        UsuarioId,
      },
      { transaction: t }
    ) //

    await caja.update(
      {
        saldoActual: parseFloat(caja.saldoActual) + totalTicket,
        totalIngresos: parseFloat(caja.totalIngresos) + totalTicket,
      },
      { transaction: t }
    ) //

    await sorteo.update(
      { montoRecaudado: parseFloat(sorteo.montoRecaudado) + totalTicket },
      { transaction: t }
    ) //

    await t.commit() //
    return { code: 201, message: 'Ticket vendido con éxito', data: nuevoTicket }
  } catch (error) {
    await t.rollback() //
    return { code: 400, message: error.message }
  }
}

const verificarCupo = async (data) => {
  const { SorteoId, numero, monto } = data

  try {
    const sorteo = await Sorteos.findByPk(SorteoId, {
      include: [Cifras],
    })

    if (!sorteo) return { code: 400, message: 'Sorteo no encontrado' }

    const cupoMaximo = parseFloat(sorteo.Cifra.cupoMaximoPorNumero)

    const saldoExistente = await SaldosCupo.findOne({
      where: {
        SorteoId,
        numeroJugado: numero,
      },
    })

    let disponible

    if (saldoExistente) {
      disponible = parseFloat(saldoExistente.montoDisponible)
    } else {
      disponible = parseFloat(cupoMaximo)
    }

    if (parseFloat(monto) > disponible) {
      return {
        code: 400,
        message: `CUPO EXCEDIDO. DISPONIBLE: ${disponible}`,
        disponible: disponible,
      }
    }

    return {
      code: 200,
      disponible,
      message: 'Cupo verificado',
    }
  } catch (error) {
    return { code: 500, message: 'Error interno al verificar el cupo' }
  }
}

export { venderTicket, verificarCupo }
