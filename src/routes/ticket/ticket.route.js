import { Router } from 'express'
import { ticketControllers } from '../../controllers/index.controllers.js'

const ticketRouter = Router()

ticketRouter.get('/listar/todos', ticketControllers.listarTickets)
ticketRouter.post('/vender', ticketControllers.venderTicket)
ticketRouter.delete('/eliminar/:id', ticketControllers.eliminarTicket)

export default ticketRouter
