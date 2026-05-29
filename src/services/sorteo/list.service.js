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
  const page = parseInt(params.page, 10) || 1
  const limit = parseInt(params.limit, 10) || 10
  const offset = (page - 1) * limit

  const { CatalogoId, jornada, CifraId, fechaSorteo } = params

  // Forzamos que el estado siempre sea 'Abierto'
  const whereConditions = { estado: 'Abierto' }
  if (CatalogoId && CatalogoId !== 'Todos') whereConditions.CatalogoId = CatalogoId
  if (jornada && jornada !== 'Todos') whereConditions.jornada = jornada
  if (CifraId && CifraId !== 'Todos') whereConditions.CifraId = CifraId
  if (fechaSorteo) whereConditions.fechaSorteo = fechaSorteo

  const { count, rows: sorteos } = await Sorteos.findAndCountAll({
    where: whereConditions,
    include: [Catalogos, Cifras, Tickets], // Agregado Tickets por si necesitas contarlos también aquí
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
