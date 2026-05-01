import { cifraServices } from '../../services/index.services.js'

const eliminarCifra = async (req, res) => {
  try {
    const { id } = req.params
    const { code, message } = await cifraServices.eliminarCifra(id)
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

export { eliminarCifra }
