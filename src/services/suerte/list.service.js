import { Cifras, Suertes } from '../../lib/db.lib.js'

const listarSuertes = async () => {
  const suertes = await Suertes.findAll({
    include: [Cifras],
    order: [['createdAt', 'ASC']],
  })

  return { code: 200, suertes }
}

export { listarSuertes }
