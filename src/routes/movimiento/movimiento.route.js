import { Router } from 'express'
import { movimientoControllers } from '../../controllers/index.controllers.js'

const movimientoRouter = Router()

movimientoRouter.get('/listar/todas', movimientoControllers.listarMovimientos)
movimientoRouter.get('/listar/caja/:id', movimientoControllers.listarMovimientosPorCaja)
movimientoRouter.get('/listar/usuario/:id', movimientoControllers.listarMovimientosPorUsuario)
movimientoRouter.get(
  '/listar/punto-venta/:id',
  movimientoControllers.listarMovimientosPorPuntoVenta
)

export default movimientoRouter
