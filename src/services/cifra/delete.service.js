import { Cifras } from '../../lib/db.lib.js'

const eliminarCifra = async (id) => {
  const cifra = await Cifras.findByPk(id)

  if (!cifra) return { code: 400, message: 'No se encontró la cifra a eliminar' }

  await cifra.update({
    activo: false,
  })

  return { code: 200, message: 'Cifra eliminada con éxito' }
}

export { eliminarCifra }
