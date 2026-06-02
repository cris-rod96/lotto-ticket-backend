import { Roles, Usuarios } from '../../lib/db.lib.js'
import { bcrypUtils } from '../../utils/index.utils.js'

const actualizarUsuario = async (id, data, user) => {
  // Extraemos 'clave' de los datos para procesarla aparte
  const { RolId, clave, ...datosParaActualizar } = data

  const usuario = await Usuarios.findByPk(id)
  if (!usuario) return { code: 404, message: 'Usuario no encontrado.' }

  // 1. Lógica de actualización de contraseña
  if (clave) {
    // Comparamos la nueva clave con la actual en la BD
    const esLaMisma = await bcrypUtils.compararClave(clave, usuario.clave)

    if (esLaMisma) {
      return { code: 400, message: 'La nueva contraseña no puede ser igual a la anterior.' }
    }

    // Si es distinta, la hasheamos usando tu utilidad
    datosParaActualizar.clave = await bcrypUtils.hashearClave(clave)
  }

  // 2. Lógica de validación de roles
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
    datosParaActualizar.RolId = RolId
  }

  // 3. Actualizamos solo los campos permitidos (incluye la nueva clave si se cambió)
  await usuario.update(datosParaActualizar)

  // 4. Formateamos respuesta (eliminamos clave por seguridad antes de responder)
  const usuarioSinClave = usuario.toJSON()
  delete usuarioSinClave.clave

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
