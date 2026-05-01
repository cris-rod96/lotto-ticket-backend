import * as crear from './create.service.js'
import * as listar from './list.service.js'

export default {
  ...listar,
  ...crear,
}
