import { col, fn, literal, Op } from 'sequelize'
import {
  Cajas,
  Catalogos,
  DetallesTicket,
  Movimientos,
  PuntosVenta,
  Sorteos,
  Tickets,
  Usuarios,
} from '../../lib/db.lib.js'

const getGlobalStats = async () => {
  try {
    const hoy = new Date().toISOString().split('T')[0]

    // 1. Ventas Netas (Sumando detalles de tickets no anulados creados hoy)
    // Agregamos attributes: [] para que Postgres no intente agrupar por columnas de Ticket
    const ventasHoy =
      (await DetallesTicket.sum('montoApostado', {
        include: [
          {
            model: Tickets,
            as: 'Ticket',
            attributes: [], // <--- ESTO ES VITAL PARA EL ERROR DE POSTGRES
            where: {
              estado: { [Op.ne]: 'Anulado' },
              createdAt: { [Op.gte]: `${hoy} 00:00:00` },
            },
          },
        ],
      })) || 0

    // 2. Riesgo Financiero (Tickets ganadores que aún no se pagan)
    const deudaPremios =
      (await Tickets.sum('montoTotalPremio', {
        where: {
          resultado: 'Ganador',
          estado: 'Pendiente',
        },
      })) || 0

    // 3. Cajas que están operando actualmente
    const cajasAbiertas = await Cajas.count({
      where: { estado: 'Abierta' },
    })

    // 4. Otros conteos rápidos con Promise.all para velocidad
    const [
      totalTicketsHoy,
      totalGanadores,
      totalPuntos,
      totalUsuarios,
      totalSorteosActivos,
      totalCatalogos,
    ] = await Promise.all([
      Tickets.count({
        where: {
          createdAt: { [Op.gte]: `${hoy} 00:00:00` },
          estado: { [Op.ne]: 'Anulado' },
        },
      }),
      Tickets.count({ where: { resultado: 'Ganador' } }),
      PuntosVenta.count(),
      Usuarios.count(),
      Sorteos.count({ where: { estado: 'Abierto' } }),
      Catalogos ? Catalogos.count() : Promise.resolve(0), // Por si acaso no está importado
    ])

    return {
      code: 200,
      stats: {
        ventasHoy: Number(ventasHoy),
        totalTicketsHoy,
        deudaPremios: Number(deudaPremios),
        cajasAbiertas,
        totalGanadores,
        totalPuntos,
        totalUsuarios,
        totalSorteosActivos,
        totalCatalogos: totalCatalogos || 0,
      },
    }
  } catch (error) {
    console.error('Error en getGlobalStats Service:', error)
    throw error // Para que el controller capture el error 500
  }
}

const getVendedorStats = async (puntoVentaId) => {
  const hoy = new Date().toISOString().split('T')[0]

  try {
    // 1. Ventas de hoy: Sumando los montos apostados de los detalles
    // que pertenecen a tickets NO ANULADOS del vendedor.
    const ventasHoy =
      (await DetallesTicket.sum('montoApostado', {
        include: [
          {
            model: Tickets,
            as: 'Ticket', // Verifica que esta sea el alias en tus asociaciones
            attributes: [],
            where: {
              PuntoVentaId: puntoVentaId,
              estado: { [Op.ne]: 'Anulado' },
              createdAt: { [Op.gte]: `${hoy} 00:00:00` },
            },
          },
        ],
      })) || 0

    // 2. Premios pendientes: Sumando el montoTotalPremio directo del modelo Tickets
    const premiosPendientes =
      (await Tickets.sum('montoTotalPremio', {
        where: {
          PuntoVentaId: puntoVentaId,
          resultado: 'Ganador',
          estado: 'Pendiente', // Ajusta si el estado se llama igual en tu enum
        },
      })) || 0

    // 3. Cantidad de tickets de hoy
    const ticketsHoy = await Tickets.count({
      where: {
        PuntoVentaId: puntoVentaId,
        createdAt: { [Op.gte]: `${hoy} 00:00:00` },
      },
    })

    return {
      stats: {
        ventasHoy: Number(ventasHoy),
        premiosPendientes: Number(premiosPendientes),
        ticketsHoy: ticketsHoy,
      },
    }
  } catch (error) {
    console.error('Error en getVendedorStats:', error)
    throw error
  }
}

const parseNum = (val) => Number(val) || 0

const getReporteFinanciero = async (filtros) => {
  try {
    const { fechaInicio, fechaFin, puntoVentaId } = filtros

    // Condiciones base de filtrado por punto de venta
    const pvFiltroTicket =
      puntoVentaId && puntoVentaId !== 'Todos' ? { PuntoVentaId: puntoVentaId } : {}
    const pvFiltroMov =
      puntoVentaId && puntoVentaId !== 'Todos' ? { PuntoVentaId: puntoVentaId } : {}

    // 1. OBTENER VENTAS REALES AGRUPADAS POR SUCURSAL (CON SUBCONSULTA PARA EVITAR DUPLICADOS)
    const ventasQuery = await Tickets.findAll({
      attributes: [
        'PuntoVentaId',
        // Cuenta los boletos físicos reales de forma exacta
        [fn('COUNT', col('id')), 'cantidadTickets'],
        // Subconsulta pura para sumar los detalles de cada ticket sin romper el conteo
        [
          literal(`COALESCE(SUM((
            SELECT SUM("montoApostado") 
            FROM "DetallesTicket" 
            WHERE "DetallesTicket"."TicketId" = "Tickets"."id"
          )), 0)`),
          'totalVendido',
        ],
      ],
      where: {
        estado: { [Op.ne]: 'Anulado' },
        createdAt: {
          [Op.gte]: `${fechaInicio} 00:00:00`,
          [Op.lte]: `${fechaFin} 23:59:59`,
        },
        ...pvFiltroTicket,
      },
      group: ['PuntoVentaId'],
      raw: true,
    })

    // 2. OBTENER PREMIOS GANADORES AGRUPADOS POR SUCURSAL
    const premiosQuery = await Tickets.findAll({
      attributes: [
        'PuntoVentaId',
        [fn('SUM', col('montoTotalPremio')), 'totalPremios'],
        [fn('COUNT', col('Tickets.id')), 'ticketsGanadores'],
      ],
      where: {
        resultado: 'Ganador',
        estado: { [Op.ne]: 'Anulado' },
        ...pvFiltroTicket,
      },
      include: [
        {
          model: Sorteos,
          attributes: [],
          where: {
            fechaSorteo: {
              [Op.gte]: fechaInicio,
              [Op.lte]: fechaFin,
            },
          },
        },
      ],
      group: ['PuntoVentaId'],
      raw: true,
    })

    // 3. OBTENER OTROS MOVIMIENTOS DE CAJA AGRUPADOS (Gastos, Ajustes, etc.)
    const movimientosQuery = await Movimientos.findAll({
      attributes: ['PuntoVentaId', 'tipo', [fn('SUM', col('monto')), 'totalMonto']],
      where: {
        createdAt: {
          [Op.gte]: `${fechaInicio} 00:00:00`,
          [Op.lte]: `${fechaFin} 23:59:59`,
        },
        categoria: {
          [Op.notIn]: ['Venta Ticket', 'Pago Premio', 'Anulacion'],
        },
        ...pvFiltroMov,
      },
      group: ['PuntoVentaId', 'tipo'],
      raw: true,
    })

    // 4. ESTRUCTURAR MAPAS DE DATOS PARA PROCESAMIENTO RÁPIDO O(1)
    const ventasMap = {}
    ventasQuery.forEach((v) => {
      const pvId = v.PuntoVentaId
      if (pvId) {
        ventasMap[pvId] = {
          totalVendido: parseNum(v.totalVendido),
          cantidadTickets: parseInt(v.cantidadTickets) || 0,
        }
      }
    })

    const premiosMap = {}
    premiosQuery.forEach((p) => {
      premiosMap[p.PuntoVentaId] = {
        totalPremios: parseNum(p.totalPremios),
        ticketsGanadores: parseInt(p.ticketsGanadores) || 0,
      }
    })

    const cajaMap = {}
    movimientosQuery.forEach((m) => {
      if (!cajaMap[m.PuntoVentaId]) {
        cajaMap[m.PuntoVentaId] = { ingresosCaja: 0, egresosCaja: 0 }
      }
      if (m.tipo === 'Ingreso') {
        cajaMap[m.PuntoVentaId].ingresosCaja += parseNum(m.totalMonto)
      } else if (m.tipo === 'Egreso') {
        cajaMap[m.PuntoVentaId].egresosCaja += parseNum(m.totalMonto)
      }
    })

    // 5. CONSOLIDAR LISTADO DE SUCURSALES DINÁMICAMENTE
    const sucursalesIds = new Set([
      ...Object.keys(ventasMap),
      ...Object.keys(premiosMap),
      ...Object.keys(cajaMap),
    ])

    let detalleSucursales = []
    let kpisGlobales = {
      ventasTotales: 0,
      premiosPorPagar: 0,
      otrosIngresos: 0,
      otrosEgresos: 0,
      utilidadNeta: 0,
    }

    sucursalesIds.forEach((id) => {
      const v = ventasMap[id] || { totalVendido: 0, cantidadTickets: 0 }
      const p = premiosMap[id] || { totalPremios: 0, ticketsGanadores: 0 }
      const c = cajaMap[id] || { ingresosCaja: 0, egresosCaja: 0 }

      const utilidad = v.totalVendido - p.totalPremios + (c.ingresosCaja - c.egresosCaja)

      // Acumuladores globales para las tarjetas del dashboard
      kpisGlobales.ventasTotales += v.totalVendido
      kpisGlobales.premiosPorPagar += p.totalPremios
      kpisGlobales.otrosIngresos += c.ingresosCaja
      kpisGlobales.otrosEgresos += c.egresosCaja
      kpisGlobales.utilidadNeta += utilidad

      detalleSucursales.push({
        sucursalId: id,
        ticketsVendidos: v.cantidadTickets,
        montoVendido: v.totalVendido,
        ticketsGanadores: p.ticketsGanadores,
        montoPremios: p.totalPremios,
        otrosIngresos: c.ingresosCaja,
        otrosEgresos: c.egresosCaja,
        utilidadNeta: utilidad,
      })
    })

    return {
      code: 200,
      stats: kpisGlobales,
      sucursales: detalleSucursales,
    }
  } catch (error) {
    console.error('Error en getReporteFinanciero Service:', error)
    throw error
  }
}

export { getGlobalStats, getReporteFinanciero, getVendedorStats }
