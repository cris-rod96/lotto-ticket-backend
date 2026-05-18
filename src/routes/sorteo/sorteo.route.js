import { Router } from 'express'
import { sorteoControllers } from '../../controllers/index.controllers.js'

const sorteoRouter = Router()

sorteoRouter.get('/listar/todos', sorteoControllers.listarTodos)
sorteoRouter.get('/listar/abiertos', sorteoControllers.listarAbiertos)
sorteoRouter.get('/listar/cerrados', sorteoControllers.listarCerrados)

sorteoRouter.post('/crear', sorteoControllers.crearSorteo)
sorteoRouter.patch('/actualizar-sorteo', sorteoControllers.actualizarSorteo)

export default sorteoRouter
