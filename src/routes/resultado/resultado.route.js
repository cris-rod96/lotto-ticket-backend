import { Router } from 'express'
import { resultadoControllers } from '../../controllers/index.controllers.js'

const resultadoRouter = Router()

resultadoRouter.get('/listar/todos', resultadoControllers.listarResultados)
resultadoRouter.post('/registrar', resultadoControllers.registrarResultados)

export default resultadoRouter
