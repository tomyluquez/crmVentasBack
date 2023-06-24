import { Router } from "express";
import {
  createClient,
  getClient,
  getClients,
  updateClient,
  updateActividad,
  createAct,
} from "../handlers/handlersClients.js";

const router = Router();

router
  .post("/", createClient)
  .get("/", getClients)
  .get("/:id", getClient)
  .put("/actividades/:id", updateActividad)
  .put("/actividades", createAct)
  .put("/", updateClient);

export { router as clientesRoutes };
