import { Cifras } from '../../lib/db.lib.js'

const listarTodas = async () => {
  const cifras = await Cifras.findAll({
    order: [['cantidad', 'ASC']],
  })
  return { code: 200, cifras }
}

const listarActivas = async () => {
  const cifras = await Cifras.findAll({
    where: {
      activo: true,
    },
    order: [['cantidad', 'ASC']],
  })
  return { code: 200, cifras }
}

export { listarTodas, listarActivas }
