import { cupoJornadaControllers } from "../../controllers/index.controllers.js";
import { Router } from "express";

const cupoJornadaRouter = Router();

cupoJornadaRouter.post(
  "/registrar",
  cupoJornadaControllers.registrarCupoJornada,
);
cupoJornadaRouter.get("/listar/todos", cupoJornadaControllers.listarTodos);
cupoJornadaRouter.patch(
  "/actualizar/:id",
  cupoJornadaControllers.actualizarCupo,
);

export default cupoJornadaRouter;
