import { sorteoServices } from '../../services/index.services.js'

const actualizarSorteo = async (req, res) => {
  try {
    const { id } = req.params
    const { code, message, data } = await sorteoServices.actualizarSorteo(id, req.body)
    res.status(code).json(data ? { data, message } : { message })
  } catch (error) {
    const msg = error.message || 'Error interno en el servidor. Intente de nuevo'
    req.status(500).json({
      message: msg,
    })
  }
}

export { actualizarSorteo }
