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

  // Actualizamos el usuario
  await usuario.update(data)

  // 1. Convertimos a objeto plano de JS
  const usuarioSinClave = usuario.toJSON()

  // 2. Eliminamos la contraseña (asegúrate de usar el nombre exacto de la columna, ej: 'password' o 'clave')
  delete usuarioSinClave.clave // Por si acaso usas este nombre

  return {
    code: 200,
    message: 'Usuario actualizado con éxito',
    data: usuarioSinClave,
  }
}
const actualizarClave = async (id, claveActual, nuevaClave) => {
  const usuario = await Usuarios.findByPk(id)

  if (!usuario) {
    return { code: 404, message: 'Usuario no encontrado' }
  }

  const esCorrecta = await bcrypUtils.compararClave(claveActual, usuario.clave)

  if (!esCorrecta) {
    return {
      code: 401, // Unauthorized
      message: 'La clave actual es incorrecta',
    }
  }

  // 3. Si la clave es correcta, hasheamos la nueva
  const claveCifrada = await bcrypUtils.hashearClave(nuevaClave)

  // 4. Actualizamos
  await usuario.update({
    clave: claveCifrada,
  })

  return { code: 200, message: 'Tu contraseña ha sido actualizada con éxito' }
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
