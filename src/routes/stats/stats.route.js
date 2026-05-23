import { Router } from 'express'
import { statsControllers } from '../../controllers/index.controllers.js'

const statsRouter = Router()

statsRouter.get('/listar/', statsControllers.getDashboardStats)

statsRouter.get('/reporte-financiero/', statsControllers.getReportStats)

export default statsRouter
