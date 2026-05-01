import { Suertes } from '../../lib/db.lib.js'

const actualizarPremio = async (id, premio) => {
  const suerte = await Suertes.findByPk(id)
  if (!suerte)
    return { code: 400, message: 'No se encontró la suerte. Verifique e intente de nuevo' }

  if (parseFloat(premio) <= 0.0)
    return { code: 400, message: 'El valor del premio debe ser mayor a 0' }

  await suerte.update({ premio })
  return { code: 200, message: 'Premio actualizado con éxito' }
}

export { actualizarPremio }
