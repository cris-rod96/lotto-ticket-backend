import { Router } from 'express'
import { puntoVentaControllers } from '../../controllers/index.controllers.js'

const puntoVentaRouter = Router()

puntoVentaRouter.get('/listar/todos', puntoVentaControllers.listarPuntosVentas)
puntoVentaRouter.post('/agregar', puntoVentaControllers.registrarPuntoVenta)
puntoVentaRouter.patch('/actualizar-informacion/:id', puntoVentaControllers.actualizarPuntoVenta)
puntoVentaRouter.delete('/eliminar/:id', puntoVentaControllers.eliminarPuntoVenta)
puntoVentaRouter.patch('/restaurar/:id', puntoVentaControllers.restaurarPuntoVenta)
puntoVentaRouter.get('/obtener-detalle/punto-venta/:id', puntoVentaControllers.obtenerDetallesPunto)
puntoVentaRouter.get(
  '/puntos-ventas/:id/tickets',
  puntoVentaControllers.listarTicketsPuntoPaginados
)
export default puntoVentaRouter
