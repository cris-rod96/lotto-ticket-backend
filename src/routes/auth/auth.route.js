import { Router } from 'express'
import { authControllers } from '../../controllers/index.controllers.js'

const authRouter = Router()

authRouter.post('/iniciar-sesion', authControllers.iniciarSesion)

export default authRouter
