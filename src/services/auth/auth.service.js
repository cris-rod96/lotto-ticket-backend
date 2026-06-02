import { Roles, Usuarios } from '../../lib/db.lib.js'
import { bcrypUtils, jwtUtils } from '../../utils/index.utils.js'

const iniciarSesion = async (data) => {
  const { alias, clave } = data

  // 1. Buscar usuario e incluir su Rol
  const usuario = await Usuarios.findOne({
    where: {
      alias,
    },
    include: [Roles],
  })

  // 2. Validaciones de seguridad (Alias)
  if (!usuario) return { code: 401, message: 'Alias y/o clave incorrectas' }

  // 3. Validar Clave encriptada
  const claveCorrecta = await bcrypUtils.compararClave(clave, usuario.clave)
  if (!claveCorrecta) return { code: 401, message: 'Alias y/o clave incorrectas' }

  if (!usuario.activo)
    return { code: 401, message: 'La cuenta de este usuario se encuentra inhabilitada.' }

  // 4. Generar JWT (Token de acceso)
  const token = jwtUtils.generarToken(usuario)

  // 5. Limpiar datos sensibles antes de enviar al cliente
  // Usamos el operador spread para separar la clave del resto de los datos
  const { clave: claveUsuario, ...dataUsuario } = usuario.get({ plain: true })

  // 6. Retornar éxito con el token y la info del usuario
  return {
    code: 200,
    message: 'Sesión iniciada con éxito',
    info: {
      token,
      usuario: dataUsuario,
    },
  }
}

export default { iniciarSesion }
