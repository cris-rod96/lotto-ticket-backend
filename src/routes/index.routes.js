import { Router } from 'express'
import catalogoRouter from './catalogo/catalogo.route.js'
import cifraRouter from './cifra/cifra.route.js'

const rootRouter = Router()

rootRouter.use('/catalogos', catalogoRouter)
rootRouter.use('/cifras', cifraRouter)
export default rootRouter
