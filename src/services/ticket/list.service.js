import { Catalogos, Cifras, PuntosVenta, Sorteos, Tickets, Usuarios } from '../../lib/db.lib.js'

const listarTickets = async (filtros = {}) => {
  try {
    const { SorteoId, PuntoVentaId, estado } = filtros

    // Construimos el objeto de búsqueda dinámicamente
    const where = {}
    if (SorteoId) where.SorteoId = SorteoId
    if (PuntoVentaId) where.PuntoVentaId = PuntoVentaId
    if (estado) where.estado = estado

    const tickets = await Tickets.findAll({
      where,
      include: [
        {
          model: Sorteos,
          include: [Catalogos, Cifras],
        },
        { model: PuntosVenta, attributes: ['nombre'] },
        { model: Usuarios, attributes: ['nombresCompletos'] },
      ],
      order: [['createdAt', 'DESC']], // Los más recientes primero
    })

    return { code: 200, data: tickets }
  } catch (error) {
    console.log(error.message)
    return { code: 500, message: error.message }
  }
}

export { listarTickets }
