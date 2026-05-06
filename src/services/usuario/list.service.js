import { PuntosVenta, Roles, Usuarios } from '../../lib/db.lib.js'

const listarUsuarios = async () => {
  const usuarios = await Usuarios.findAll({
    include: [Roles, PuntosVenta],
    order: [['createdAt', 'DESC']],
  })
  return { code: 200, usuarios }
}

export { listarUsuarios }
