import { Catalogos, Cifras, Sorteos, Tickets } from '../../lib/db.lib.js'

const listarTodos = async () => {
  const sorteos = await Sorteos.findAll({
    include: [Catalogos, Cifras, Tickets],
    order: [['createdAt', 'DESC']],
  })

  return { code: 200, sorteos }
}

const listarAbiertos = async () => {
  const sorteos = await Sorteos.findAll({
    where: {
      estado: 'Abierto',
    },
    include: [Catalogos, Cifras],
    order: [['createdAt', 'DESC']],
  })

  return { code: 200, sorteos }
}

export { listarAbiertos, listarTodos }
