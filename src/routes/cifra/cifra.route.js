import { Router } from 'express'
import { cifraControllers } from '../../controllers/index.controllers.js'

const cifraRouter = Router()

cifraRouter.get('/listar/todas', cifraControllers.listarTodas)
cifraRouter.get('/listar/activas', cifraControllers.listarActivas)

cifraRouter.post('/agregar', cifraControllers.agregarCifra)
cifraRouter.patch(
  '/actualizar/cupo-maximo/:id',
  cifraControllers.actualizarCupoMaximo,
)
cifraRouter.delete('/eliminar/:id', cifraControllers.eliminarCifra)
cifraRouter.patch('/recuperar/:id', cifraControllers.recuperarCifra)

export default cifraRouter
