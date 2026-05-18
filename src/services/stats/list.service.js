import { Op } from 'sequelize'
import {
  Cajas,
  Catalogos,
  DetallesTicket,
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

export { getGlobalStats }
