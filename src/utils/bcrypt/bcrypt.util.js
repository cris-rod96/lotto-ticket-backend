import bcryptjs from 'bcryptjs'
const hashearClave = async (clave) => {
  return await bcryptjs.hash(clave, 13)
}

const compararClave = async (clave, hash) => {
  return await bcryptjs.compare(clave, hash)
}

export { compararClave, hashearClave }
