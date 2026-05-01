import { Router } from 'express'
import { suerteControllers } from '../../controllers/index.controllers.js'

const suerteRouter = Router()

suerteRouter.post('/agregar', suerteControllers.crearSuerte)
suerteRouter.get('/listar/todas', suerteControllers.listarSuertes)
suerteRouter.patch('/actualizar/premio/:id', suerteControllers.actualizarPremio)
suerteRouter.delete('/eliminar/:id', suerteControllers.eliminarSuerte)

export default suerteRouter
