import { cifraServices } from '../../services/index.services.js'

const actualizarCupoMaximo = async (req, res) => {
  try {
    const { id } = req.params
    const { cupoMaximo } = req.body
    const { code, message } = await cifraServices.actualizarCupoMaximo(id, cupoMaximo)
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

export { actualizarCupoMaximo }
