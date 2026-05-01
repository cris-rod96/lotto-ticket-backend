import { Roles } from '../../lib/db.lib.js'

const listarRoles = async () => {
  const roles = await Roles.findAll()
  return { code: 200, roles }
}

export { listarRoles }
