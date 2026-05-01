import { Router } from 'express'
import { puntoVentaControllers } from '../../controllers/index.controllers.js'

const puntoVentaRouter = Router()

puntoVentaRouter.get('/listar/todos', puntoVentaControllers.listarPuntosVentas)
puntoVentaRouter.post('/agregar', puntoVentaControllers.registrarPuntoVenta)
puntoVentaRouter.patch('/actualizar-informacion/:id', puntoVentaControllers.actualizarPuntoVenta)
puntoVentaRouter.delete('/eliminar/:id', puntoVentaControllers.eliminarPuntoVenta)

export default puntoVentaRouter
