import { Catalogos, Cifras, DetallesTicket, Sorteos, Tickets, sq } from '../../lib/db.lib.js'

const listarTodos = async (params = {}) => {
  const page = parseInt(params.page, 10) || 1
  const limit = parseInt(params.limit, 10) || 10
  const offset = (page - 1) * limit

  const { CatalogoId, jornada, CifraId, estado, fechaSorteo } = params

  const whereConditions = {}
  if (CatalogoId && CatalogoId !== 'Todos') whereConditions.CatalogoId = CatalogoId
  if (jornada && jornada !== 'Todos') whereConditions.jornada = jornada
  if (CifraId && CifraId !== 'Todos') whereConditions.CifraId = CifraId
  if (estado && estado !== 'Todos') whereConditions.estado = estado
  if (fechaSorteo) whereConditions.fechaSorteo = fechaSorteo

  const { count, rows: sorteos } = await Sorteos.findAndCountAll({
    where: whereConditions,
    include: [Catalogos, Cifras, Tickets],
    order: [['createdAt', 'DESC']],
    limit: limit,
    offset: offset,
    distinct: true,
  })

  const totalPages = Math.ceil(count / limit)

  return {
    code: 200,
    sorteos,
    totalItems: count,
    totalPages,
    currentPage: page,
  }
}

// const listarPorPunto = async (puntoVentaId, params = {}) => {
//   const page = parseInt(params.page, 10) || 1
//   const limit = parseInt(params.limit, 10) || 10
//   const offset = (page - 1) * limit

//   const whereSorteo = {}
//   if (params.CatalogoId && params.CatalogoId !== 'Todos') whereSorteo.CatalogoId = params.CatalogoId
//   if (params.jornada && params.jornada !== 'Todos') whereSorteo.jornada = params.jornada
//   if (params.fechaSorteo) whereSorteo.fechaSorteo = params.fechaSorteo

//   // 1. Obtener IDs de sorteos que tienen actividad en este punto
//   const sorteosConTickets = await Tickets.findAll({
//     attributes: ['SorteoId'],
//     where: { PuntoVentaId: puntoVentaId },
//     group: ['SorteoId'],
//     raw: true,
//   })

//   const sorteoIds = sorteosConTickets.map((t) => t.SorteoId)

//   if (sorteoIds.length === 0) {
//     return { code: 200, sorteos: [], totalItems: 0, totalPages: 0, currentPage: page }
//   }

//   // 2. Consulta principal de sorteos
//   const { count, rows } = await Sorteos.findAndCountAll({
//     where: { ...whereSorteo, id: sorteoIds },
//     include: [Catalogos, Cifras],
//     distinct: true,
//     limit,
//     offset,
//     order: [['createdAt', 'DESC']],
//   })

//   // 3. Obtener totales por sorteo de forma optimizada
//   const totales = await Tickets.findAll({
//     where: { SorteoId: sorteoIds, PuntoVentaId: puntoVentaId },
//     attributes: [
//       'SorteoId',
//       [sq.fn('SUM', sq.col('DetallesTickets.montoApostado')), 'totalRecaudado'],
//       [sq.fn('SUM', sq.col('montoTotalPremio')), 'totalPremios'],
//       [sq.fn('COUNT', sq.col('Tickets.id')), 'totalTickets'],
//     ],
//     include: [{ model: DetallesTicket, as: 'DetallesTickets', attributes: [] }],
//     group: ['SorteoId'],
//     raw: true,
//   })

//   // 4. Combinar resultados
//   const sorteosData = rows.map((sorteo) => {
//     const t = totales.find((item) => item.SorteoId === sorteo.id) || {}
//     const json = sorteo.get({ plain: true })

//     const recaudado = parseFloat(t.totalRecaudado || 0)
//     const premios = parseFloat(t.totalPremios || 0)

//     return {
//       ...json,
//       totalRecaudado: recaudado.toFixed(2),
//       totalPremios: premios.toFixed(2),
//       utilidadNeta: (recaudado - premios).toFixed(2),
//       totalTickets: parseInt(t.totalTickets || 0),
//     }
//   })

//   return {
//     code: 200,
//     sorteos: sorteosData,
//     totalItems: count,
//     totalPages: Math.ceil(count / limit),
//     currentPage: page,
//   }
// }

// const listarPorPunto = async (puntoVentaId, params = {}) => {
//   const page = parseInt(params.page, 10) || 1
//   const limit = parseInt(params.limit, 10) || 10
//   const offset = (page - 1) * limit

//   // 1. Obtenemos los sorteos únicos (con paginación)
//   // Usamos un subquery para sacar los SorteoId distintos de los tickets del vendedor
//   const { count, rows } = await Sorteos.findAndCountAll({
//     include: [
//       {
//         model: Tickets,
//         where: { PuntoVentaId: puntoVentaId },
//         attributes: [], // No traemos los tickets aquí, solo para filtrar
//       },
//       Catalogos,
//       Cifras,
//     ],
//     distinct: true, // Esto es vital para que count() sea real
//     limit,
//     offset,
//     order: [['createdAt', 'DESC']],
//   })

//   // 2. Por cada sorteo encontrado, sumamos sus montos
//   const sorteosData = await Promise.all(
//     rows.map(async (sorteo) => {
//       const json = sorteo.get({ plain: true })

//       // Consulta rápida para las estadísticas de ESTE sorteo y ESTE punto
//       const stats = await Tickets.findOne({
//         where: { SorteoId: sorteo.id, PuntoVentaId: puntoVentaId },
//         attributes: [
//           [sq.fn('SUM', sq.col('montoTotalPremio')), 'totalPremios'],
//           [sq.fn('COUNT', sq.col('id')), 'totalTickets'],
//         ],
//         raw: true,
//       })

//       return {
//         ...json,
//         totalRecaudado: parseFloat(json.montoRecaudado || 0).toFixed(2), // O el campo que sume tu recaudación
//         totalPremios: parseFloat(stats.totalPremios || 0).toFixed(2),
//         totalTickets: parseInt(stats.totalTickets || 0),
//         utilidadNeta: (
//           parseFloat(json.montoRecaudado || 0) - parseFloat(stats.totalPremios || 0)
//         ).toFixed(2),
//       }
//     })
//   )

//   return {
//     code: 200,
//     sorteos: sorteosData,
//     totalItems: count,
//     totalPages: Math.ceil(count / limit),
//     currentPage: page,
//   }
// }

// const listarPorPunto = async (puntoVentaId, params = {}) => {
//   const page = parseInt(params.page, 10) || 1
//   const limit = parseInt(params.limit, 10) || 5
//   const offset = (page - 1) * limit

//   // 1. Filtros básicos
//   const whereSorteo = {}
//   if (params.CatalogoId && params.CatalogoId !== 'Todos') whereSorteo.CatalogoId = params.CatalogoId
//   // ... resto de filtros

//   // 2. Consulta de sorteos (PAGINACIÓN LIMPIA)
//   const { count, rows } = await Sorteos.findAndCountAll({
//     where: whereSorteo,
//     include: [Catalogos, Cifras],
//     limit,
//     offset,
//     order: [['createdAt', 'DESC']],
//   })

//   // 3. CÁLCULO DE TOTALES AISLADO (Aquí está el secreto para que no falle)
//   const sorteosData = await Promise.all(
//     rows.map(async (sorteo) => {
//       const json = sorteo.get({ plain: true })

//       // Consulta directa a Tickets filtrando por punto de venta
//       // Esto es INMUNE a los JOINs globales de Sorteos
//       const stats = await Tickets.findOne({
//         where: {
//           SorteoId: sorteo.id,
//           PuntoVentaId: puntoVentaId,
//         },
//         attributes: [
//           [sq.fn('COUNT', sq.col('Tickets.id')), 'totalTickets'],
//           [sq.fn('SUM', sq.col('DetallesTickets.montoApostado')), 'totalRecaudado'],
//           [sq.fn('SUM', sq.col('Tickets.montoTotalPremio')), 'totalPremios'],
//         ],
//         include: [
//           {
//             model: DetallesTicket,
//             as: 'DetallesTickets',
//             attributes: [],
//           },
//         ],
//         raw: true,
//         subQuery: false,
//       })

//       return {
//         ...json,
//         totalTickets: parseInt(stats.totalTickets || 0),
//         totalRecaudado: parseFloat(stats.totalRecaudado || 0).toFixed(2),
//         totalPremios: parseFloat(stats.totalPremios || 0).toFixed(2),
//         utilidadNeta: (
//           parseFloat(stats.totalRecaudado || 0) - parseFloat(stats.totalPremios || 0)
//         ).toFixed(2),
//       }
//     })
//   )

//   return {
//     code: 200,
//     sorteos: sorteosData,
//     totalItems: count,
//     totalPages: Math.ceil(count / limit),
//     currentPage: page,
//   }
// }

// const listarPorPunto = async (puntoVentaId, params = {}) => {
//   const page = parseInt(params.page, 10) || 1
//   const limit = parseInt(params.limit, 10) || 10
//   const offset = (page - 1) * limit

//   // 1. FILTRO DE SORTEOS (Paso 1: Identificar qué filas mostrar)
//   const whereSorteo = {}
//   if (params.CatalogoId && params.CatalogoId !== 'Todos') whereSorteo.CatalogoId = params.CatalogoId
//   if (params.jornada && params.jornada !== 'Todos') whereSorteo.jornada = params.jornada
//   if (params.fechaSorteo) whereSorteo.fechaSorteo = params.fechaSorteo

//   const { count, rows } = await Sorteos.findAndCountAll({
//     where: whereSorteo,
//     include: [
//       {
//         model: Tickets,
//         where: { PuntoVentaId: puntoVentaId },
//         attributes: [], // Filtramos pero no traemos la data aquí
//       },
//       Catalogos,
//       Cifras,
//     ],
//     distinct: true,
//     limit,
//     offset,
//     order: [['createdAt', 'DESC']],
//   })

//   // 2. CÁLCULO DE TOTALES (Paso 2: Calcular montos para esos sorteos específicos)
//   const sorteosConTotales = await Promise.all(
//     rows.map(async (sorteo) => {
//       const json = sorteo.get({ plain: true })

//       // Consulta limpia, sin joins complejos, solo los tickets del punto y sorteo actual
//       const stats = await Tickets.findOne({
//         where: {
//           SorteoId: sorteo.id,
//           PuntoVentaId: puntoVentaId,
//         },
//         attributes: [
//           [sq.fn('COUNT', sq.col('Tickets.id')), 'totalTickets'],
//           [sq.fn('SUM', sq.col('DetallesTickets.montoApostado')), 'totalRecaudado'],
//           [sq.fn('SUM', sq.col('Tickets.montoTotalPremio')), 'totalPremios'],
//         ],
//         include: [
//           {
//             model: DetallesTicket,
//             as: 'DetallesTickets',
//             attributes: [],
//           },
//         ],
//         raw: true,
//         subQuery: false,
//       })

//       const recaudado = parseFloat(stats.totalRecaudado || 0)
//       const premios = parseFloat(stats.totalPremios || 0)

//       return {
//         ...json,
//         totalTickets: parseInt(stats.totalTickets || 0),
//         totalRecaudado: recaudado.toFixed(2),
//         totalPremios: premios.toFixed(2),
//         utilidadNeta: (recaudado - premios).toFixed(2),
//       }
//     })
//   )

//   // 3. DEVOLVER EL RESULTADO UNIFICADO
//   return {
//     code: 200,
//     sorteos: sorteosConTotales,
//     totalItems: count,
//     totalPages: Math.ceil(count / limit),
//     currentPage: page,
//   }
// }

// const listarPorPunto = async (puntoVentaId, params = {}) => {
//   const page = parseInt(params.page, 10) || 1
//   const limit = parseInt(params.limit, 10) || 10
//   const offset = (page - 1) * limit

//   // 1. Obtenemos los sorteos paginados que tienen tickets de este vendedor
//   const { count, rows } = await Sorteos.findAndCountAll({
//     include: [
//       {
//         model: Tickets,
//         where: { PuntoVentaId: puntoVentaId },
//         attributes: [],
//       },
//       Catalogos,
//       Cifras,
//     ],
//     distinct: true,
//     limit,
//     offset,
//     order: [['createdAt', 'DESC']],
//   })

//   // 2. Calculamos los totales por sorteo y punto de venta
//   const sorteosData = await Promise.all(
//     rows.map(async (sorteo) => {
//       const json = sorteo.get({ plain: true })

//       const stats = await Tickets.findOne({
//         where: { SorteoId: sorteo.id, PuntoVentaId: puntoVentaId },
//         attributes: [
//           [sq.fn('SUM', sq.col('DetallesTickets.montoApostado')), 'totalRecaudado'],
//           [sq.fn('SUM', sq.col('Tickets.montoTotalPremio')), 'totalPremios'],
//           // Usamos DISTINCT para que no se multiplique el conteo por los detalles
//           [sq.fn('COUNT', sq.fn('DISTINCT', sq.col('Tickets.id'))), 'totalTickets'],
//         ],
//         include: [
//           {
//             model: DetallesTicket,
//             as: 'DetallesTickets',
//             attributes: [],
//           },
//         ],
//         raw: true,
//         subQuery: false,
//       })

//       const recaudado = parseFloat(stats.totalRecaudado || 0)
//       const premios = parseFloat(stats.totalPremios || 0)

//       return {
//         ...json,
//         totalRecaudado: recaudado.toFixed(2),
//         totalPremios: premios.toFixed(2),
//         utilidadNeta: (recaudado - premios).toFixed(2),
//         totalTickets: parseInt(stats.totalTickets || 0),
//       }
//     })
//   )

//   return {
//     code: 200,
//     sorteos: sorteosData,
//     totalItems: count,
//     totalPages: Math.ceil(count / limit),
//     currentPage: page,
//   }
// }

const listarPorPunto = async (puntoVentaId, params = {}) => {
  const page = parseInt(params.page, 10) || 1
  const limit = parseInt(params.limit, 10) || 10
  const offset = (page - 1) * limit

  // 1. Obtenemos los sorteos únicos (paginados)
  const { count, rows } = await Sorteos.findAndCountAll({
    include: [
      {
        model: Tickets,
        where: { PuntoVentaId: puntoVentaId },
        attributes: [],
      },
      Catalogos,
      Cifras,
    ],
    distinct: true,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  })

  // 2. Procesamos cada sorteo con consultas aisladas para evitar errores y duplicados
  const sorteosData = await Promise.all(
    rows.map(async (sorteo) => {
      const json = sorteo.get({ plain: true })

      // A) Consulta para el monto recaudado (Sumamos desde DetallesTickets)
      const statsRecaudado = await DetallesTicket.findOne({
        attributes: [[sq.fn('SUM', sq.col('montoApostado')), 'total']],
        include: [
          {
            model: Tickets,
            attributes: [],
            where: { SorteoId: sorteo.id, PuntoVentaId: puntoVentaId },
          },
        ],
        raw: true,
      })

      // B) Consulta para Premios y Tickets (Directo en la tabla Tickets, sin JOIN)
      const statsTickets = await Tickets.findOne({
        where: { SorteoId: sorteo.id, PuntoVentaId: puntoVentaId },
        attributes: [
          [sq.fn('SUM', sq.col('montoTotalPremio')), 'totalPremios'],
          [sq.fn('COUNT', sq.col('id')), 'totalTickets'],
        ],
        raw: true,
      })

      const recaudado = parseFloat(statsRecaudado?.total || 0)
      const premios = parseFloat(statsTickets?.totalPremios || 0)

      return {
        ...json,
        totalRecaudado: recaudado.toFixed(2),
        totalPremios: premios.toFixed(2),
        utilidadNeta: (recaudado - premios).toFixed(2),
        totalTickets: parseInt(statsTickets?.totalTickets || 0),
      }
    })
  )

  return {
    code: 200,
    sorteos: sorteosData,
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  }
}

const listarAbiertos = async (params = {}) => {
  const p = params || {}
  const page = parseInt(p.page, 10) || 1
  const limit = parseInt(p.limit, 10) || 10
  const offset = (page - 1) * limit

  console.log(params)

  // 1. Definimos los estados válidos según tu modelo
  const estadosValidos = ['Abierto', 'Cerrado', 'Finalizado']

  const whereConditions = {}

  // 2. Solo filtramos por estado si viene uno válido
  // Si p.estado es 'Todos' o cualquier otra cosa que no sea Abierto/Cerrado/Finalizado,
  // simplemente ignoramos el filtro de estado y traerá todos.
  if (p.estado && estadosValidos.includes(p.estado)) {
    whereConditions.estado = p.estado
  }

  // 3. Resto de filtros
  if (p.CatalogoId && p.CatalogoId !== 'Todos') whereConditions.CatalogoId = p.CatalogoId
  if (p.jornada && p.jornada !== 'Todos') whereConditions.jornada = p.jornada
  if (p.CifraId && p.CifraId !== 'Todos') whereConditions.CifraId = p.CifraId
  if (p.fechaSorteo) whereConditions.fechaSorteo = p.fechaSorteo

  console.log("DEBUG FINAL (donde no debe aparecer 'Todos'):", whereConditions)

  const { count, rows: sorteos } = await Sorteos.findAndCountAll({
    where: whereConditions,
    include: [Catalogos, Cifras, Tickets],
    order: [['createdAt', 'DESC']],
    limit: limit,
    offset: offset,
    distinct: true,
  })

  return {
    code: 200,
    sorteos,
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  }
}

const listarCerrados = async (params = {}) => {
  const page = parseInt(params.page, 10) || 1
  const limit = parseInt(params.limit, 10) || 10
  const offset = (page - 1) * limit

  const { CatalogoId, jornada, CifraId, fechaSorteo } = params

  // Forzamos que el estado siempre sea 'Cerrado'
  const whereConditions = { estado: 'Cerrado' }
  if (CatalogoId && CatalogoId !== 'Todos') whereConditions.CatalogoId = CatalogoId
  if (jornada && jornada !== 'Todos') whereConditions.jornada = jornada
  if (CifraId && CifraId !== 'Todos') whereConditions.CifraId = CifraId
  if (fechaSorteo) whereConditions.fechaSorteo = fechaSorteo

  const { count, rows: sorteos } = await Sorteos.findAndCountAll({
    where: whereConditions,
    include: [Catalogos, Cifras, Tickets],
    order: [['createdAt', 'DESC']],
    limit: limit,
    offset: offset,
    distinct: true,
  })

  const totalPages = Math.ceil(count / limit)

  return {
    code: 200,
    sorteos,
    totalItems: count,
    totalPages,
    currentPage: page,
  }
}

export { listarAbiertos, listarCerrados, listarPorPunto, listarTodos }
