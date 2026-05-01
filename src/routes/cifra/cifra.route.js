import { Router } from 'express'
import { cifraControllers } from '../../controllers/index.controllers.js'

const cifraRouter = Router()

cifraRouter.get('/listar/todas', cifraControllers.listarTodas)
cifraRouter.post('/agregar', cifraControllers.agregarCifra)
cifraRouter.patch('/actualizar/cupo-maximo/:id', cifraControllers.actualizarCupoMaximo)
cifraRouter.delete('/eliminar/:id', cifraControllers.eliminarCifra)

export default cifraRouter
