import { Router } from 'express'
import { rolControllers } from '../../controllers/index.controllers.js'

const rolRouter = Router()

rolRouter.get('/listar/todos', rolControllers.listarRoles)
rolRouter.post('/agregar', rolControllers.crearRol)

export default rolRouter
