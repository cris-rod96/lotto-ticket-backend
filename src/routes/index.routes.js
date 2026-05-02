import { Router } from 'express'
import cajaRouter from './caja/caja.route.js'
import catalogoRouter from './catalogo/catalogo.route.js'
import cifraRouter from './cifra/cifra.route.js'
import movimientoRouter from './movimiento/movimiento.route.js'
import puntoVentaRouter from './punto-venta/puntoVenta.route.js'
import rolRouter from './rol/rol.route.js'
import sorteoRouter from './sorteo/sorteo.route.js'
import suerteRouter from './suerte/suerte.route.js'
import ticketRouter from './ticket/ticket.route.js'
import usuarioRouter from './usuario/usuario.route.js'

const rootRouter = Router()

rootRouter.use('/catalogos', catalogoRouter)
rootRouter.use('/cifras', cifraRouter)
rootRouter.use('/roles', rolRouter)
rootRouter.use('/suertes', suerteRouter)
rootRouter.use('/puntos-ventas', puntoVentaRouter)
rootRouter.use('/movimientos', movimientoRouter)
rootRouter.use('/usuarios', usuarioRouter)
rootRouter.use('/cajas', cajaRouter)
rootRouter.use('/sorteos', sorteoRouter)
rootRouter.use('/tickets', ticketRouter)
export default rootRouter
