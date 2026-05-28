import { Router } from 'express'
import { backupControllers } from '../../controllers/index.controllers.js'

const backupRouter = Router()

backupRouter.get('/listar-respaldos', backupControllers.listarRespaldos)

export default backupRouter
