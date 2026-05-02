import { Router } from 'express'
import { cajaControllers } from '../../controllers/index.controllers.js'

const cajaRouter = Router()

cajaRouter.get('/listar/todas', cajaControllers.listarTodas)
cajaRouter.get('/listar/punto-de-venta/:id', cajaControllers.listarPorPuntoDeVenta)
cajaRouter.get('/obtener-abierta/punto-venta/:id', cajaControllers.obtenerCajaAbierta)
cajaRouter.get('/obtener-abiertas', cajaControllers.obtenerCajasAbiertas)

cajaRouter.post('/abrir-caja', cajaControllers.abrirCaja)
cajaRouter.patch('/cerrar-caja/:id', cajaControllers.cerrarCaja)
cajaRouter.patch('/registrar-inyeccion', cajaControllers.registrarInyeccion)

export default cajaRouter
