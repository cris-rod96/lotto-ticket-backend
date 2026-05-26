import { Router } from 'express'
import { sorteoControllers } from '../../controllers/index.controllers.js'

const sorteoRouter = Router()

sorteoRouter.get('/listar/todos', sorteoControllers.listarTodos)
sorteoRouter.get('/listar/abiertos', sorteoControllers.listarAbiertos)
sorteoRouter.get('/listar/cerrados', sorteoControllers.listarCerrados)

sorteoRouter.post('/crear', sorteoControllers.crearSorteo)
sorteoRouter.patch('/actualizar-sorteo/:id', sorteoControllers.actualizarSorteo)

sorteoRouter.delete('/eliminar/:id', sorteoControllers.eliminarSorteo)


export default sorteoRouter
