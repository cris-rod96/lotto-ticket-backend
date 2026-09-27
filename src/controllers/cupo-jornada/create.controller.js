import { cupoJornadaServices } from "../../services/index.services.js"



export const registrarCupoJornada = async (req, res) => {
  try {
    const data = req.body
    const { code, message } = await cupoJornadaServices.registrarCupoJornada(data)
    res.status(code).json({
      message
    })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({
        message: err.message
      })
    } else {
      res.status(500).json({
        message: "Error desconocido. Intente de nuevo o contacte con el administrador."
      })
    }
  }
}