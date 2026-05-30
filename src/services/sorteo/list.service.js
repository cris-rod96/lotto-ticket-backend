import { Catalogos, Cifras, Sorteos, Tickets } from '../../lib/db.lib.js'

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

export { listarAbiertos, listarCerrados, listarTodos }
