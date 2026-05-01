import { cifraServices } from '../../services/index.services.js'

const agregarCifra = async (req, res) => {
  try {
    const data = req.body
    const { code, message } = await cifraServices.agregarCifra(data)
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

export { agregarCifra }
