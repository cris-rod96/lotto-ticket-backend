import { Usuarios } from '../../lib/db.lib.js'

const listarUsuarios = async () => {
  const usuarios = await Usuarios.findAll()
  return { code: 200, usuarios }
}

export { listarUsuarios }
