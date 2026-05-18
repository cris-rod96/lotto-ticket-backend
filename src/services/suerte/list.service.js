import { Cifras, DetallesSuerte, Suertes } from '../../lib/db.lib.js'

const listarSuertes = async () => {
  const suertes = await Suertes.findAll({
    include: [
      {
        model: Cifras,
      },
      {
        model: DetallesSuerte,
      },
    ],
    order: [['createdAt', 'ASC']],
  })

  return { code: 200, suertes }
}

export { listarSuertes }
