import * as crear from './create.service.js'
import * as eliminar from './delete.service.js'
import * as listar from './list.service.js'
export default {
  ...crear,
  ...listar,
  ...eliminar,
}
