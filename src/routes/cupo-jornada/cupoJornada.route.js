import { cupoJornadaControllers } from "../../controllers/index.controllers.js";
import { Router } from "express";


const cupoJornadaRouter = Router()


cupoJornadaRouter.post("/registrar", cupoJornadaControllers.registrarCupoJornada)




export default cupoJornadaRouter