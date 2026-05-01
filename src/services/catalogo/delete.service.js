import { Catalogos } from '../../lib/db.lib.js'

const eliminarRegistro = async (id) => {
  const catalogo = await Catalogos.findByPk(id)

  if (!catalogo) return { code: 400, message: 'No se encontró el registro a aliminar' }

  await catalogo.update({ activo: false })
  return { code: 200, message: 'Registro eliminado con éxito' }
}

export { eliminarRegistro }
