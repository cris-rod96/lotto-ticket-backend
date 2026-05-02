import { Catalogos, Cifras, Sorteos } from '../../lib/db.lib.js'

const listarTodos = async () => {
  const sorteos = await Sorteos.findAll({
    include: [Catalogos, Cifras],
  })

  return { code: 200, sorteos }
}

export { listarTodos }
