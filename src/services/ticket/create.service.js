import { nanoidHelper } from '../../helpers/index.helpers.js'
import {
  Cajas,
  Catalogos,
  Cifras,
  Clientes, // <-- Asegúrate de que esté importado aquí
  DetallesTicket,
  Movimientos,
  PuntosVenta,
  SaldosCupo,
  Sorteos,
  sq,
  Tickets,
  Usuarios,
} from '../../lib/db.lib.js'

const venderTicket = async (data) => {
  const t = await sq.transaction()

  try {
    const {
      SorteoId,
      PuntoVentaId,
      UsuarioId,
      CajaId,
      detalles, // [{ numeroJugado, montoApostado }]
      metodoPago = 'Efectivo', // Por defecto Efectivo
      referenciaPago = null, // Número de comprobante si es transferencia

      // Nuevos campos opcionales del cliente desde el frontend
      clienteNombres,
      clienteCedula,
      clienteWhatsapp,
    } = data

    // 1. Validar estado del Sorteo
    const sorteo = await Sorteos.findByPk(SorteoId, { include: [Cifras], transaction: t })
    if (!sorteo || sorteo.estado !== 'Abierto') {
      throw new Error('El sorteo no existe o está cerrado.')
    }

    // 2. Validar Caja
    const caja = await Cajas.findByPk(CajaId, { transaction: t })
    if (!caja || caja.estado !== 'Abierta') {
      throw new Error('La caja no está abierta.')
    }

    // --- NUEVO: GESTIÓN INTEGRAL DEL CLIENTE (FIND OR CREATE) ---
    let finalClienteId = null

    // Si el vendedor ingresó al menos la cédula, gestionamos el cliente
    if (clienteCedula && clienteCedula.trim() !== '') {
      const cedulaLimpia = clienteCedula.trim()

      // Intentamos buscar al cliente por su cédula única
      let cliente = await Clientes.findOne({
        where: { cedula: cedulaLimpia },
        transaction: t
      })

      if (!cliente) {
        // Si no existe, lo creamos dinámicamente usando los datos provistos
        cliente = await Clientes.create(
          {
            cedula: cedulaLimpia,
            nombres: clienteNombres ? clienteNombres.trim().toUpperCase() : 'CLIENTE CASUAL',
            whatsapp: clienteWhatsapp ? clienteWhatsapp.trim() : null,
          },
          { transaction: t }
        )
      } else {
        // OPCIONAL: Si el cliente ya existe pero no tenía whatsapp registrado, se lo actualizamos
        if (clienteWhatsapp && !cliente.whatsapp) {
          await cliente.update({ whatsapp: clienteWhatsapp.trim() }, { transaction: t })
        }
      }

      finalClienteId = cliente.id
    }

    // --- VALIDACIÓN DE TRANSFERENCIA ---
    if (metodoPago === 'Transferencia') {
      if (!referenciaPago) {
        throw new Error('La referencia de transferencia es obligatoria.')
      }

      // Verificar que la referencia no haya sido usada antes
      const referenciaExiste = await Movimientos.findOne({
        where: { referencia: referenciaPago },
        transaction: t,
      })

      if (referenciaExiste) {
        throw new Error(`La referencia ${referenciaPago} ya fue registrada anteriormente.`)
      }
    }

    let totalTicket = 0
    const detallesParaCrear = []

    // 3. Procesar Cupos con Bloqueo
    for (const item of detalles) {
      const monto = parseFloat(item.montoApostado)
      totalTicket += monto

      let saldo = await SaldosCupo.findOne({
        where: { SorteoId, numeroJugado: item.numeroJugado },
        transaction: t,
        lock: t.LOCK.UPDATE,
      })

      if (!saldo) {
        const cupoMax = parseFloat(sorteo.Cifra.cupoMaximoPorNumero)
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
      )

      detallesParaCrear.push({
        numeroJugado: item.numeroJugado,
        montoApostado: monto,
        montoPremio: 0,
      })
    }

    const codigo = nanoidHelper.generarCodigo()

    // 4. Crear Ticket asociando el ClienteId obtenido dinámicamente
    const nuevoTicket = await Tickets.create(
      {
        codigo,
        SorteoId,
        PuntoVentaId,
        UsuarioId,
        ClienteId: finalClienteId, // <--- Aquí se inyecta de forma segura (UUID o null)
      },
      { transaction: t }
    )

    await DetallesTicket.bulkCreate(
      detallesParaCrear.map((d) => ({ ...d, TicketId: nuevoTicket.id })),
      { transaction: t }
    )

    // 5. Crear Movimiento Contable
    await Movimientos.create(
      {
        tipo: 'Ingreso',
        categoria: 'Venta Ticket',
        monto: totalTicket,
        metodoPago, // 'Efectivo' o 'Transferencia'
        referencia: referenciaPago, // Guardamos la referencia única
        descripcion: `Venta Ticket: ${nuevoTicket.codigo} (${metodoPago})`,
        CajaId,
        PuntoVentaId,
        UsuarioId,
      },
      { transaction: t }
    )

    // 6. Actualizar Caja (Solo afecta saldoActual si es EFECTIVO)
    const updateCajaData = {
      totalIngresos: parseFloat(caja.totalIngresos) + totalTicket,
    }

    if (metodoPago === 'Efectivo') {
      updateCajaData.saldoActual = parseFloat(caja.saldoActual) + totalTicket
    }

    await caja.update(updateCajaData, { transaction: t })

    // 7. Actualizar Sorteo (Siempre suma a lo recaudado)
    await sorteo.update(
      { montoRecaudado: parseFloat(sorteo.montoRecaudado) + totalTicket },
      { transaction: t }
    )

    // 8. EAGER LOADING DEL TICKET CREADO (Incluimos el modelo Clientes para la respuesta e impresión)
    const ticketCompleto = await Tickets.findByPk(nuevoTicket.id, {
      include: [
        {
          model: Sorteos,
          include: [Catalogos, Cifras],
        },
        { model: PuntosVenta, attributes: ['nombre'] },
        { model: Usuarios, attributes: ['nombresCompletos'] },
        { model: DetallesTicket },
        { model: Clientes }, // <--- Incluido para que retorne los datos estructurados al frontend
      ],
      transaction: t,
    })

    await t.commit()

    // Retornamos el objeto completo estructurado
    return {
      code: 201,
      message: 'Ticket vendido con éxito',
      data: { ticket: ticketCompleto },
    }
  } catch (error) {
    if (t) await t.rollback()
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

    let disponible = saldoExistente
      ? parseFloat(saldoExistente.montoDisponible)
      : parseFloat(cupoMaximo)

    if (parseFloat(monto) > disponible) {
      return {
        code: 400,
        message: `CUPO EXCEDIDO. DISPONIBLE: ${disponible}`,
        disponible,
      }
    }

    return { code: 200, disponible, message: 'Cupo verificado' }
  } catch (error) {
    return { code: 500, message: 'Error interno al verificar el cupo' }
  }
}

export { venderTicket, verificarCupo }
