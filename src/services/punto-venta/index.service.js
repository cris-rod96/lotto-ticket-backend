import * as crear from './create.service.js'
import * as eliminar from './delete.service.js'
import * as listar from './list.service.js'
import * as actualizar from './update.service.js'

export default {
  ...crear,
  ...eliminar,
  ...listar,
  ...actualizar,
}
