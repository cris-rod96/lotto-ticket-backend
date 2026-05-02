import { PuntosVenta, Roles, Usuarios } from '../../lib/db.lib.js'
import { bcrypUtils } from '../../utils/index.utils.js'

const registrarUsuario = async (data) => {
  const { alias, clave, RolId, PuntoVentaId } = data

  const rolExiste = await Roles.findByPk(RolId)
  if (!rolExiste) return { code: 400, message: 'El rol seleccionado no existe' }

  if (PuntoVentaId) {
    const puntoVenta = await PuntosVenta.findByPk(PuntoVentaId)
    if (!puntoVenta) return { code: 400, message: 'No se encontró el punto de venta seleccionado' }
  }

  const user = await Usuarios.findOne({
    where: {
      alias,
    },
  })

  if (user) return { code: 400, message: 'Ya existe un usuario con este alias' }

  const claveCifrada = await bcrypUtils.hashearClave(clave)

  await Usuarios.create({
    ...data,
    clave: claveCifrada,
  })

  return { code: 201, message: 'Usuario registrado con éxito.' }
}

export { registrarUsuario }
