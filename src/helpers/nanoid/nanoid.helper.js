import { customAlphabet } from 'nanoid'

const alphabet = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
const generarCodigo = customAlphabet(alphabet, 8)

export default {
  generarCodigo,
}
