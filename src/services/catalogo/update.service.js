import { Op } from 'sequelize'
import { Catalogos } from '../../lib/db.lib.js'

const actualizarInformacion = async (id, data) => {
  try {
    const catalogo = await Catalogos.findByPk(id)

    if (!catalogo) {
      return {
        code: 404,
        message: 'No se encontró el registro en el catálogo',
      }
    }

    if (data.nombre && data.pais) {
      const existeDuplicado = await Catalogos.findOne({
        where: {
          nombre: { [Op.iLike]: `%${data.nombre}%` },
          pais: data.pais,
          id: { [Op.ne]: id },
        },
      })

      if (existeDuplicado) {
        return {
          code: 400,
          message: 'Ya existe un catálogo con un nombre similar en este país',
        }
      }
    }

    await catalogo.update(data)

    return {
      code: 200,
      message: 'Información del catálogo actualizada correctamente',
      data: catalogo,
    }
  } catch (error) {
    return {
      code: 500,
      message: 'Error interno del servidor',
    }
  }
}

export { actualizarInformacion }
