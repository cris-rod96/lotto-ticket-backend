import * as crear from './create.controller.js'
import * as eliminar from './delete.controller.js'
import * as listar from './list.controller.js'

export default {
  ...crear,
  ...eliminar,
  ...listar,
}
