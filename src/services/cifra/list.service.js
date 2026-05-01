import { Cifras } from '../../lib/db.lib.js'

const listarTodas = async () => {
  const cifras = await Cifras.findAll()
  return { code: 200, cifras }
}

export { listarTodas }
