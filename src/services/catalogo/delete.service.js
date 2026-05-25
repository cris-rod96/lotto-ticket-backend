import { Catalogos, Sorteos } from '../../lib/db.lib.js'

const eliminarRegistro = async (id) => {
  // 1. Buscar el catálogo
  const catalogo = await Catalogos.findByPk(id)

  if (!catalogo) {
    return { code: 400, message: 'No se encontró el registro a eliminar' }
  }

  // 2. Verificar si tiene sorteos relacionados
  const cantidadSorteos = await Sorteos.count({
    where: { CatalogoId: id }
  })

  // 3. Lógica condicional: Eliminar si no hay sorteos, desactivar si sí existen
  if (cantidadSorteos === 0) {
    await catalogo.destroy()
    return { code: 200, message: 'Registro eliminado permanentemente con éxito' }
  } else {
    await catalogo.update({ activo: false })
    return { code: 200, message: 'Registro desactivado con éxito (tiene sorteos relacionados)' }
  }
}

export { eliminarRegistro }