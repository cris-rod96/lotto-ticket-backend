import CajaModel from './caja/caja.model.js'
import CatalogoModel from './catalogo/catalogo.model.js'
import CifraModel from './cifra/cifra.model.js'
import ClienteModel from './cliente/cliente.model.js'
import DetalleResultadoModel from './detalle-resultado/detalleResultado.model.js'
import DetalleTicketModel from './detalle-ticket/detalleTicket.model.js'
import MovimientoModel from './movimiento/movimiento.model.js'
import PuntoVentaModel from './punto-venta/puntoVenta.model.js'
import ResultadoModel from './resultado/resultado.model.js'
import RolModel from './rol/rol.model.js'
import SorteoModel from './sorteo/sorteo.model.js'
import SuerteModel from './suerte/suerte.model.js'
import TicketModel from './ticket/ticket.model.js'
import UsuarioModel from './usuario/usuario.model.js'

export const models = [
  RolModel,
  UsuarioModel,
  CatalogoModel,
  CifraModel,
  SuerteModel,
  SorteoModel,
  TicketModel,
  DetalleTicketModel,
  PuntoVentaModel,
  CajaModel,
  MovimientoModel,
  ResultadoModel,
  DetalleResultadoModel,
  ClienteModel,
]
