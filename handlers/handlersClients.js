import Client from "../models/clientModel.js";
import { createNotifications } from "./handlerNotifications.js";

export const createClient = async (req, res) => {
  try {
    const {
      fechaSolicitud,
      nombreCrm,
      nombreLocal,
      telContacto,
      vendedor,
      observaciones,
      antiguedad,
      userName,
      instagram,
      seguidores,
      logistica,
    } = req.body;

    const cliente = await Client.create({
      fechaSolicitud,
      nombreCrm,
      nombreLocal,
      telContacto,
      vendedor,
      observaciones,
      antiguedad,
      modificacion: { user: userName, fechaModificacion: new Date() },
      redes: { instagram, seguidores, logistica },
    });
    res
      .status(200)
      .json({ message: "cliente creado con exito", data: cliente });
  } catch (error) {
    res.status(404).send(error);
  }
};

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res
      .status(200)
      .json({ message: "todos los clientes obtenidos", data: clients });
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

export const getClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id);
    res.status(200).json({ message: "cliente obtenido", data: client });
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

export const updateClient = async (req, res) => {
  const { id, datoClient, estado, estadoClient, obs, userName, interes } =
    req.body;
  let updateObj = {};
  try {
    if (datoClient) {
      updateObj[`${datoClient}.estado`] = estadoClient;
      updateObj[`${datoClient}.fecha${estadoClient}`] = new Date();
      const complete = await Client.findByIdAndUpdate(id, updateObj);
      res.status(200).json({ message: "complete", data: complete });
    } else if (obs) {
      const update = await Client.findByIdAndUpdate(id, {
        $push: { observaciones: obs },
      });
      res.status(200).json({ message: "complete", data: update });
    } else {
      const client = await Client.findById(id);
      if (client.fechaContacto) {
        if (
          estado !== "Pendiente" &&
          estado !== "No lo quiere" &&
          estado !== "No contesta"
        ) {
          const update = await Client.findByIdAndUpdate(id, {
            estado,
            ["fecha" + estado]: new Date(),
          });
          res.status(200).json({ message: "complete", data: update });
        } else {
          const update = await Client.findByIdAndUpdate(id, {
            estado,
          });
          res.status(200).json({ message: "complete", data: update });
        }
      } else {
        // La propiedad fechaContacto no existe en el cliente, agregar fechaContacto
        const update = await Client.findByIdAndUpdate(id, {
          estado,
          fechaContacto: new Date(),
        });
        res.status(200).json({ message: "complete", data: update });
      }
    }
    await Client.findByIdAndUpdate(id, {
      $set: {
        "modificacion.user": userName,
        "modificacion.fechaModificacion": new Date(),
      },
    });
    if (interes !== "") {
      const cliente = await Client.findById(id);
      cliente.interes = interes;
      await cliente.save();
    }
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

export const updateContacto = async (req, res) => {
  const { idClient, nombreNewContacto, telNewContacto } = req.body;
  try {
    const client = await Client.findByIdAndUpdate(idClient, {
      $push: { contactos: { nombre: nombreNewContacto, tel: telNewContacto } },
    });

    const description = `Nuevo contacto agregado a cliente con ID: ${idClient}`;
    const idUsers = ["idUsuarioNotificacion"]; // Reemplaza 'idUsuarioNotificacion' con el ID del usuario al que quieres enviar la notificación.
    const tipo = "Nuevo Contacto"; // Puedes ajustar el tipo de notificación según tus necesidades.

    const reqForNotifications = {
      body: {
        date: new Date(),
        description,
        idUsers,
        tipo,
      },
    };

    const noti = await createNotifications(reqForNotifications, res);
    res.status(200).json({ message: "complete contacto nuevo", data: noti });
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

export const updateUsersApi = async (req, res) => {
  const { usuarioApi, claveApi, linkTienda, idClient, userName } = req.body;

  try {
    const cliente = await Client.findByIdAndUpdate(
      idClient,
      {
        $set: {
          "usuarios.usuarioApi": usuarioApi,
          "usuarios.claveApi": claveApi,
          "usuarios.linkTienda": linkTienda,
        },
      },
      { new: true }
    );
    await Client.findByIdAndUpdate(id, {
      $set: {
        "modificacion.user": userName,
        "modificacion.fechaModificacion": new Date(),
      },
    });
    res.status(200).json({ message: "Usuario actualizado con éxito", cliente });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el usuario", error });
  }
};

export const updateUsersDatos = async (req, res) => {
  const {
    usuarioAdmin,
    claveAdmin,
    usuarioLocal,
    claveLocal,
    usuarioOperador,
    claveOperador,
    idClient,
    userName,
  } = req.body;
  try {
    const cliente = await Client.findByIdAndUpdate(
      idClient,
      {
        $set: {
          "usuarios.usuarioAdmin": usuarioAdmin,
          "usuarios.claveAdmin": claveAdmin,
          "usuarios.usuarioLocal": usuarioLocal,
          "usuarios.claveLocal": claveLocal,
          "usuarios.usuarioOperador": usuarioOperador,
          "usuarios.claveOperador": claveOperador,
        },
      },
      { new: true }
    );
    await Client.findByIdAndUpdate(id, {
      $set: {
        "modificacion.user": userName,
        "modificacion.fechaModificacion": new Date(),
      },
    });
    res.status(200).json({ message: "Usuario actualizado con éxito", cliente });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el usuario", error });
  }
};

export const updateDatosDespachados = async (req, res) => {
  const { idClient, tipoDato, estadoDato, comentarioDato, userName } = req.body;
  try {
    const updateQuery = {
      $set: {
        [`${tipoDato}.estado`]: estadoDato,
        [`${tipoDato}.comentario`]: comentarioDato,
      },
    };
    const cliente = await Client.findByIdAndUpdate(idClient, updateQuery);
    await Client.findByIdAndUpdate(id, {
      $set: {
        "modificacion.user": userName,
        "modificacion.fechaModificacion": new Date(),
      },
    });
    res
      .status(200)
      .json({ message: "Datos despachados actualizados correctamente" });
  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar los datos despachados del cliente",
      error,
    });
  }
};

export const updateClientData = async (req, res) => {
  const { idClient, nombreLocal, instagram, seguidores, logistica } = req.body;

  try {
    // Buscar el cliente por id
    const client = await Client.findById(idClient);
    if (!client.redes) {
      client.redes = {
        instagram: "",
        seguidores: 0,
        logistica: "",
      };
    }
    // Si existe el cliente, actualizar las propiedades dentro de redes
    if (client) {
      if (instagram) {
        client.redes.instagram = instagram;
      }

      if (seguidores) {
        client.redes.seguidores = seguidores;
      }

      if (logistica) {
        client.redes.logistica = logistica;
      }

      // Actualizar el nombreLocal si se proporciona
      if (nombreLocal) {
        client.nombreLocal = nombreLocal;
      }

      // Guardar los cambios en la base de datos
      await client.save();
    } else {
      // Si el cliente no existe, puedes optar por crearlo aquí o devolver un error
      return res.status(404).json({ error: "Cliente no encontrado" });
      // o
      // const newClient = new Client({ _id: idClient, redes: { instagram, seguidores, logistica } });
      // await newClient.save();
    }

    res.status(200).json({ message: "Modificado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateVentas = async (req, res) => {
  const { idClient, ventas, userName } = req.body;
  try {
    const client = await Client.findById(idClient);
    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    if (!client.ventas) {
      client.ventas = ventas;
    } else {
      client.ventas = ventas;
    }

    await client.save();

    await Client.findByIdAndUpdate(idClient, {
      $set: {
        "modificacion.user": userName,
        "modificacion.fechaModificacion": new Date(),
      },
    });
    res.status(200).json({ message: "modificado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
