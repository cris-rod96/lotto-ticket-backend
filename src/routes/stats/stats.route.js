import { Router } from 'express'
import { statsControllers } from '../../controllers/index.controllers.js'

const statsRouter = Router()

statsRouter.get('/listar/', statsControllers.getDashboardStats)
statsRouter.get('/listar/punto-venta/:id', statsControllers.getVendedorDashboardStats)

statsRouter.get('/reporte-financiero/', statsControllers.getReportStats)

export default statsRouter
