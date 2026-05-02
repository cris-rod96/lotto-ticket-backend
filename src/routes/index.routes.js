import { Router } from 'express'
import catalogoRouter from './catalogo/catalogo.route.js'
import cifraRouter from './cifra/cifra.route.js'
import movimientoRouter from './movimiento/movimiento.route.js'
import puntoVentaRouter from './punto-venta/puntoVenta.route.js'
import rolRouter from './rol/rol.route.js'
import suerteRouter from './suerte/suerte.route.js'
import usuarioRouter from './usuario/usuario.route.js'

const rootRouter = Router()

rootRouter.use('/catalogos', catalogoRouter)
rootRouter.use('/cifras', cifraRouter)
rootRouter.use('/roles', rolRouter)
rootRouter.use('/suertes', suerteRouter)
rootRouter.use('/puntos-ventas', puntoVentaRouter)
rootRouter.use('/movimientos', movimientoRouter)
rootRouter.use('/usuarios', usuarioRouter)
export default rootRouter
