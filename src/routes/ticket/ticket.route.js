import { Router } from 'express'
import { ticketControllers } from '../../controllers/index.controllers.js'

const ticketRouter = Router()

ticketRouter.get('/listar/todos', ticketControllers.listarTickets)
ticketRouter.get('/listar/punto-de-venta/:id', ticketControllers.listarPorPuntoDeVenta)

ticketRouter.post('/vender', ticketControllers.venderTicket)
ticketRouter.patch('/anular/:id', ticketControllers.anularTicket)
ticketRouter.post('/verificar-cupo', ticketControllers.verificarCupo)

ticketRouter.patch('/pagar-ticket', ticketControllers.pagarTicket)

export default ticketRouter
