import * as crear from './create.controller.js'
import * as eliminar from './delete.controller.js'
import * as listar from './list.controller.js'
import * as actualizar from './update.controller.js'
export default {
  ...listar,
  ...crear,
  ...actualizar,
  ...eliminar,
}
