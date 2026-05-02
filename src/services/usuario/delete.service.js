import { Usuarios } from '../../lib/db.lib.js'

const eliminarUsuario = async (id) => {
  const usuario = await Usuarios.findByPk(id)

  if (!usuario) return { code: 400, message: 'Usuario no encontrado' }

  await usuario.update({
    activo: false,
  })
  return { code: 400, message: 'Usuario eliminado con éxito' }
}

export { eliminarUsuario }
