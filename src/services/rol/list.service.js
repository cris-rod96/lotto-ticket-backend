import { PuntosVenta, Roles, Usuarios } from '../../lib/db.lib.js'

const listarRoles = async () => {
  const roles = await Roles.findAll({
    include: [{
      model: Usuarios,
      include: [PuntosVenta]
    }],
  })
  return { code: 200, roles }
}

export { listarRoles }
