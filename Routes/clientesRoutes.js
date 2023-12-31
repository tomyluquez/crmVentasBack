import { Router } from "express";
import {
  createClient,
  getClient,
  getClients,
  updateClient,
  updateContacto,
  updateUsersApi,
  updateUsersDatos,
  updateDatosDespachados,
  updateClientData,
  updateVentas,
} from "../handlers/handlersClients.js";

const router = Router();

router
  .post("/", createClient)
  .put("/usersAPI", updateUsersApi)
  .put("/usersDatos", updateUsersDatos)
  .put("/datos", updateDatosDespachados)
  .put("/ventas", updateVentas)
  .put("/changeData/", updateClientData)
  .put("/:id", updateContacto)
  .get("/", getClients)
  .get("/:id", getClient)
  .put("/", updateClient);

export { router as clientesRoutes };
