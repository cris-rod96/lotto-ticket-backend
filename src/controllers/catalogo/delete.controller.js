import { catalogoService } from '../../services/index.services.js'

const eliminarRegistro = async (req, res) => {
  try {
    const { id } = req.params
    const { code, message } = await catalogoService.eliminarRegistro(id)
    res.status(code).json({ message })
  } catch (error) {
    const msg =
      error.message ||
      'Error interno en el servidor. Intente de nuevo o contacte con un administrador.'

    res.status(500).json({
      message: msg,
    })
  }
}

export { eliminarRegistro }
