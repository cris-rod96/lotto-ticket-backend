import { Suertes } from '../../lib/db.lib.js'

const eliminarSuerte = async (id) => {
  const suerte = await Suertes.findByPk(id)
  if (!suerte)
    return { code: 400, message: 'No se encontró la suerte. Verifique e intente de nuevo' }

  await suerte.update({
    activo: false,
  })

  return { code: 200, message: 'Suerte eliminada con éxito' }
}

export { eliminarSuerte }
