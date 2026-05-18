import { DetallesSuerte, Sorteos, Tickets } from '../../lib/db.lib.js'

const actualizarPremio = async (id, data) => {
  const { premio, PuntoVentaId } = data

  if (!PuntoVentaId) {
    return { code: 400, message: 'El ID del Punto de Venta es obligatorio' }
  }

  if (parseFloat(premio) <= 0.0) {
    return { code: 400, message: 'El valor del premio debe ser mayor a 0' }
  }

  try {
    // 1. BLOQUEO DE SEGURIDAD REFINADO:
    // Buscamos si hay tickets VENDIDOS (estado Pendiente) en ESTE Punto de Venta
    // que pertenezcan a sorteos que aún están ABIERTOS.
    const ticketVendido = await Tickets.findOne({
      where: {
        PuntoVentaId: PuntoVentaId,
        estado: 'Pendiente', // El ticket está activo
      },
      include: [
        {
          model: Sorteos,
          where: { estado: 'Abierto' }, // El sorteo aún no se ha cerrado ni jugado
        },
      ],
    })

    if (ticketVendido) {
      return {
        code: 403,
        message: `No se puede modificar el premio: Este punto de venta ya tiene tickets vendidos para el sorteo activo Nº ${ticketVendido.Sorteo.numero}.`,
      }
    }

    // 2. Búsqueda del detalle para el punto de venta específico
    const detalle = await DetallesSuerte.findOne({
      where: {
        SuerteId: id,
        PuntoVentaId: PuntoVentaId,
      },
    })

    if (!detalle) {
      return {
        code: 404,
        message: 'No se encontró la configuración de premio para este punto de venta',
      }
    }

    // 3. Actualización del valor (usando tu campo 'premio' según el modelo DetallesSuerte)
    await detalle.update({ premio: premio })

    return { code: 200, message: 'Premio actualizado con éxito' }
  } catch (error) {
    console.error('Error al actualizar premio:', error)
    return { code: 500, message: 'Error interno al procesar la solicitud' }
  }
}

export { actualizarPremio }
