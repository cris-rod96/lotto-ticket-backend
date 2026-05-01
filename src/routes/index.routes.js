import { Router } from 'express'
import catalogoRouter from './catalogo/catalogo.route.js'

const rootRouter = Router()

rootRouter.use('/catalogos', catalogoRouter)

export default rootRouter
