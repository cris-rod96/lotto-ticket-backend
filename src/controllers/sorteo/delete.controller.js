import { sorteoServices } from "../../services/index.services.js"

const eliminarSorteo = async (req, res) => {
  try {
    const { id } = req.params
    const { code, message } = await sorteoServices.eliminarSorteo(id)
    res.status(code).json({ message })
  } catch (error) {
    const msg = error.message || "Error crítico en el servidor. Intente de nuevo o contacte con un administrador"
  }
}

export {
  eliminarSorteo
}