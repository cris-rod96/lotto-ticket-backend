import { Roles, Usuarios } from '../../lib/db.lib.js'
import { bcrypUtils } from '../../utils/index.utils.js'

const actualizarUsuario = async (id, data, user) => {
  const { RolId } = data

  const usuario = await Usuarios.findByPk(id)
  if (!usuario) return { code: 404, message: 'Usuario no encontrado.' }

  if (RolId) {
    const rolDestino = await Roles.findByPk(RolId)
    if (!rolDestino) return { code: 400, message: 'El rol especificado no existe.' }

    if (rolDestino.nombre === 'ADMINISTRADOR') {
      const rolEjecutor = await Roles.findByPk(user.RolId)
      if (!rolEjecutor || rolEjecutor.nombre !== 'ADMINISTRADOR') {
        return {
          code: 403,
          message: 'Permisos insuficientes para asignar roles de administrador',
        }
      }
    }
  }

  await usuario.update(data)
  return { code: 200, message: 'Usuario actualizado con éxito', data: usuario }
}
const actualizarClave = async (id, nuevaClave) => {
  const usuario = await Usuarios.findByPk(id)
  if (!usuario) return { code: 400, message: 'Usuario no encontrado' }

  const claveCifrada = await bcrypUtils.hashearClave(nuevaClave)

  await usuario.update({
    clave: claveCifrada,
  })

  return { code: 200, message: 'Clave actualizada con éxito' }
}

const restaurarUsuario = async (id) => {
  const usuario = await Usuarios.findByPk(id)
  if (!usuario) return { code: 400, message: 'Usuario no encontrado' }

  if (usuario.activo) return { code: 400, message: 'El usuario ya esta activo' }

  await usuario.update({
    activo: true,
  })

  return { code: 200, message: 'Usuario restaurado con éxito' }
}

export { actualizarClave, actualizarUsuario, restaurarUsuario }
