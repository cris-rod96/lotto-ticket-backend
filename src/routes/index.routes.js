import { Router } from 'express'
import catalogoRouter from './catalogo/catalogo.route.js'
import cifraRouter from './cifra/cifra.route.js'
import rolRouter from './rol/rol.route.js'

const rootRouter = Router()

rootRouter.use('/catalogos', catalogoRouter)
rootRouter.use('/cifras', cifraRouter)
rootRouter.use('/roles', rolRouter)
export default rootRouter
