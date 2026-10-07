import { cupoJornadaServices } from "../../services/index.services.js";

export const actualizarCupo = async (req, res) => {
  try {
    const { id } = req.params;
    const { cupoMaximo } = req.body;

    const { code, message } = await cupoJornadaServices.actualizarCupo(
      id,
      cupoMaximo,
    );

    res.status(code).json({
      message,
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({
        message: err.message,
      });
    } else {
      res.status(500).json({
        message:
          "Error desconocido. Intente de nuevo o contacte con el administrador.",
      });
    }
  }
};
