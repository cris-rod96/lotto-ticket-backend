import { cupoJornadaServices } from "../../services/index.services.js";

const listarTodos = async (req, res) => {
  try {
    const { code, cuposJornadas } = await cupoJornadaServices.listarTodos();
    res.status(code).json({
      cuposJornadas,
    });
  } catch (error) {
    const msg =
      error.message ||
      "Error interno en el servidor. Intente de nuevo o contacte con un administrador.";

    res.status(500).json({
      message: msg,
    });
  }
};

export { listarTodos };
