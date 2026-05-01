import { Catalogos } from '../../lib/db.lib.js'

const listarTodos = async () => {
  const catalogos = await Catalogos.findAll({
    where: {
      activo: true,
    },
  })
  return { code: 200, catalogos }
}

export { listarTodos }
