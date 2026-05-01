import { Router } from 'express'
import { catalogoControllers } from '../../controllers/index.controllers.js'

const catalogoRouter = Router()

catalogoRouter.get('/listar/todos', catalogoControllers.listarTodos)
catalogoRouter.post('/agregar', catalogoControllers.agregarACatalogo)
catalogoRouter.patch('/actualizar/:id', catalogoControllers.actualizarInformacion)
catalogoRouter.delete('/eliminar/:id', catalogoControllers.eliminarRegistro)

export default catalogoRouter
