import * as crear from './create.controller.js'
import * as listar from './list.controller.js'

export default {
  ...listar,
  ...crear,
}
