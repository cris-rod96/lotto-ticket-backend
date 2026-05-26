import { Sorteos, Tickets } from "../../lib/db.lib.js"

const eliminarSorteo = async (id) => {
  try {
    // 1. Buscar el sorteo
    const sorteo = await Sorteos.findByPk(id)

    // CORREGIDO: Detener si NO existe el sorteo
    if (!sorteo) {
      return { code: 404, message: "Sorteo no encontrado" }
    }

    // 2. Validar si tiene tickets usando .count() (es mucho más rápido que .findAll)
    const tieneTickets = await Tickets.count({
      where: { SorteoId: id }
    })

    if (tieneTickets > 0) {
      return {
        code: 400,
        message: "No se puede eliminar el sorteo, ya existen tickets vendidos o registrados"
      }
    }

    // 3. Eliminar el sorteo
    await sorteo.destroy()

    return { code: 200, message: "Sorteo eliminado exitosamente" }

  } catch (error) {
    console.error("Error al eliminar sorteo:", error.message)
    return {
      code: 500,
      message: "Error interno del servidor al intentar eliminar el sorteo: " + error.message
    }
  }
}

export { eliminarSorteo }