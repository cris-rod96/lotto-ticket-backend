import { Op } from 'sequelize'
import { Cajas, Movimientos, PuntosVenta, Tickets, Usuarios } from '../../lib/db.lib.js'

const obtenerCajasAbiertas = async () => {
  const cajas = await Cajas.findAll({
    where: {
      estado: 'Abierta',
    },
    order: [['createdAt', 'DESC']],
  })

  return { code: 200, cajas }
}

const obtenerCajaAbierta = async (PuntoVentaId) => {
  const puntoVenta = await PuntosVenta.findByPk(PuntoVentaId)
  if (!puntoVenta) return { code: 400, message: 'No se encontró el punto de venta indicado' }
  const caja = await Cajas.findOne({
    where: {
      PuntoVentaId,
      estado: 'Abierta',
    },
    include: [
      {
        model: Usuarios,
        attributes: ['id', 'nombresCompletos', 'PuntoVentaId'],
      },
      {
        model: Movimientos,
        include: [
          {
            model: Usuarios,
            attributes: ['id', 'nombresCompletos'],
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  })

  return { code: 200, caja }
}

const listarTodas = async () => {
  const cajas = await Cajas.findAll({
    include: [
      {
        model: Movimientos,
        include: [Usuarios],
      },
      {
        model: Usuarios,
      },
      {
        model: PuntosVenta,
      },
    ],
    order: [['createdAt', 'DESC']],
  })

  return { code: 200, cajas }
}

// const listarPorPuntoDeVenta = async (queryParams = {}) => {
//   try {
//     const { PuntoVentaId, page, limit, fechaInicio, fechaFin } = queryParams

//     // Configuración de paginación
//     const currentPage = parseInt(page, 10) || 1
//     const itemsPerPage = parseInt(limit, 10) || 8
//     const offset = (currentPage - 1) * itemsPerPage

//     const whereCaja = { PuntoVentaId }

//     // Filtros de fecha (estilo Tickets)
//     if (fechaInicio && fechaFin) {
//       whereCaja.createdAt = {
//         [Op.between]: [new Date(`${fechaInicio}T00:00:00`), new Date(`${fechaFin}T23:59:59`)],
//       }
//     } else if (fechaInicio) {
//       whereCaja.createdAt = { [Op.gte]: new Date(`${fechaInicio}T00:00:00`) }
//     } else if (fechaFin) {
//       whereCaja.createdAt = { [Op.lte]: new Date(`${fechaFin}T23:59:59`) }
//     }

//     // Consulta con paginación
//     const { count, rows } = await Cajas.findAndCountAll({
//       where: whereCaja,
//       include: [
//         {
//           model: Movimientos,
//           include: [{ model: Usuarios, attributes: ['id', 'nombresCompletos'] }],
//         },
//         { model: Usuarios, attributes: ['id', 'nombresCompletos'] },
//         { model: PuntosVenta },
//       ],
//       order: [
//         ['createdAt', 'DESC'],
//         [Movimientos, 'createdAt', 'DESC'],
//       ],
//       limit: itemsPerPage,
//       offset: offset,
//       distinct: true,
//     })

//     return {
//       code: 200,
//       data: {
//         cajas: rows,
//         totalItems: count,
//         totalPages: Math.ceil(count / itemsPerPage),
//         currentPage: currentPage,
//       },
//     }
//   } catch (error) {
//     console.error('[BACKEND ERROR - listarPorPuntoDeVenta]:', error)
//     return { code: 500, message: error.message }
//   }
// }

// const listarPorPuntoDeVenta = async (id) => {
//   try {
//     const cajas = await Cajas.findAll({
//       where: {
//         PuntoVentaId: id,
//       },
//       include: [
//         { model: Movimientos, include: [Usuarios] },
//         {
//           model: Tickets,
//           include: [DetallesTicket],
//         },
//       ],
//     })

//     console.log(cajas)

//     return { code: 200, cajas }
//   } catch (error) {
//     console.log(error)
//     return { code: 500, message: error.message }
//   }
// }

const listarPorPuntoDeVenta = async (id, options = {}) => {
  try {
    const { fechaInicio, fechaFin, page = 1, limit = 10 } = options
    const offset = (page - 1) * parseInt(limit)

    const fechaFiltro = {}
    if (fechaInicio && fechaFin) {
      fechaFiltro.fechaApertura = { [Op.between]: [new Date(fechaInicio), new Date(fechaFin)] }
    } else if (fechaInicio) {
      fechaFiltro.fechaApertura = { [Op.gte]: new Date(fechaInicio) }
    }

    // A. Contar cajas SIN el include (así cuenta solo las cajas, no los movimientos)
    const totalCajas = await Cajas.count({
      where: { PuntoVentaId: id, ...fechaFiltro },
    })

    // B. Traer las cajas con los movimientos (solo las de la página actual)
    const cajas = await Cajas.findAll({
      where: { PuntoVentaId: id, ...fechaFiltro },
      include: [{ model: Movimientos }],
      order: [['fechaApertura', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    })

    // C. Calcular totales globales (sumando solo lo que pertenece a este punto)
    // Buscamos todas las cajas del punto para sacar los IDs
    const todasLasCajas = await Cajas.findAll({
      where: { PuntoVentaId: id },
      attributes: ['id'],
    })
    const cajaIds = todasLasCajas.map((c) => c.id)

    const totalVentasGeneral =
      (await Movimientos.sum('monto', {
        where: { CajaId: { [Op.in]: cajaIds }, categoria: 'Venta Ticket' },
      })) || 0

    const totalPagadoGeneral =
      (await Movimientos.sum('monto', {
        where: { CajaId: { [Op.in]: cajaIds }, categoria: 'Pago Premio' },
      })) || 0

    const totalDeudaGeneral =
      (await Tickets.sum('montoTotalPremio', {
        where: { PuntoVentaId: id, estado: 'Pendiente', resultado: 'Ganador' },
      })) || 0

    // Procesar cajas
    const cajasProcesadas = cajas.map((caja) => {
      const c = caja.toJSON()
      const v = c.Movimientos.filter((m) => m.categoria === 'Venta Ticket').reduce(
        (s, m) => s + parseFloat(m.monto),
        0
      )
      const p = c.Movimientos.filter((m) => m.categoria === 'Pago Premio').reduce(
        (s, m) => s + parseFloat(m.monto),
        0
      )
      return { ...c, stats: { totalVentas: v, totalPagado: p, balanceNeto: v - p } }
    })

    return {
      code: 200,
      cajas: cajasProcesadas,
      pagination: {
        totalItems: totalCajas, // Ahora sí será 4
        totalPages: Math.ceil(totalCajas / limit),
        currentPage: parseInt(page),
      },
      resumenGlobal: {
        totalVentasGeneral,
        totalPagadoGeneral,
        totalDeudaGeneral,
        balanceGlobal: totalVentasGeneral - totalPagadoGeneral,
      },
    }
  } catch (error) {
    return { code: 500, message: error.message }
  }
}
export { listarPorPuntoDeVenta, listarTodas, obtenerCajaAbierta, obtenerCajasAbiertas }
