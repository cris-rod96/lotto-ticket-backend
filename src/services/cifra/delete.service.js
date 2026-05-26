import { Op } from 'sequelize'
import { Cifras, Sorteos } from '../../lib/db.lib.js'

const eliminarCifra = async (id) => {
  const cifra = await Cifras.findByPk(id)

  if (!cifra) return { code: 400, message: 'No se encontró la cifra a eliminar' }

  const sorteos = await Sorteos.findAll({
    where: {
      CifraId: id,
      estado: {

        [Op.ne]: "Finalizado"
      }
    }
  })

  if (sorteos.length > 0) {
    return {
      code: 400,
      message: "No se puede desactivar la cifra hasta que todos los sorteos relacionados esten finalizados"
    }
  }

  await cifra.update({
    activo: false,
  })

  return { code: 200, message: 'Cifra eliminada con éxito' }
}

export { eliminarCifra }
