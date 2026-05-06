import { Router } from 'express'
import { usuarioControllers } from '../../controllers/index.controllers.js'

const usuarioRouter = Router()

usuarioRouter.get('/listar/todos', usuarioControllers.listarUsuarios)
usuarioRouter.post('/agregar', usuarioControllers.registrarUsuario)
usuarioRouter.patch('/actualizar/informacion/:id', usuarioControllers.actualizarUsuario)
usuarioRouter.patch('/actualizar/clave/:id', usuarioControllers.actualizarClave)
usuarioRouter.delete('/eliminar/:id', usuarioControllers.eliminarUsuario)
usuarioRouter.patch('/restaurar/:id', usuarioControllers.restaurarUsuario)

export default usuarioRouter
