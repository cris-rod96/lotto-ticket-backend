import { sorteoServices } from '../../services/index.services.js'

const crearSorteo = async (req, res) => {
  try {
    const dataBody = req.body
    const { code, message, data } = await sorteoServices.crearSorteo(dataBody)
    res.status(code).json(data ? { data, message } : { message })
  } catch (error) {
    const msg = error.message || 'Error interno en el servidor. Intente de nuevo'
    req.status(500).json({
      message: msg,
    })
  }
}

export { crearSorteo }
