import { Roles, Usuarios } from '../../lib/db.lib.js'

const listarRoles = async () => {
  const roles = await Roles.findAll({
    include: [Usuarios],
  })
  return { code: 200, roles }
}

export { listarRoles }
