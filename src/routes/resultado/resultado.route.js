import { Router } from 'express'
import { resultadoControllers } from '../../controllers/index.controllers.js'

const resultadoRouter = Router()

resultadoRouter.get('/listar/todos', resultadoControllers.listarResultados)
resultadoRouter.post('/registrar', resultadoControllers.registrarResultados)
resultadoRouter.put('/actualizar', resultadoControllers.actualizarResultados)
resultadoRouter.get('/listar/por-punto', resultadoControllers.listarResultadosPorPunto)

export default resultadoRouter
