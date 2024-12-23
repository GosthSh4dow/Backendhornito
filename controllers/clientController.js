// controllers/clientController.js

const { Client } = require('../models');

// Obtener todos los clientes
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error al obtener los clientes:', error);
    res.status(500).json({ message: 'Error al obtener los clientes' });
  }
};

// Obtener un cliente por ID
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.status(200).json(client);
  } catch (error) {
    console.error('Error al obtener el cliente:', error);
    res.status(500).json({ message: 'Error al obtener el cliente' });
  }
};

// Crear un nuevo cliente
exports.createClient = async (req, res) => {
  try {
    const { ci_nit, nombre, telefono } = req.body;

    // Validaciones básicas
    if (!ci_nit || !nombre || !telefono) {
      return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    // Verificar si el ci_nit ya existe
    const existingClient = await Client.findOne({ where: { ci_nit } });
    if (existingClient) {
      return res.status(400).json({ message: 'El CI/NIT ya está en uso.' });
    }

    const newClient = await Client.create({
      ci_nit,
      nombre,
      telefono,
    });

    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error al crear el cliente:', error);
    res.status(500).json({ message: 'Error al crear el cliente' });
  }
};

// Actualizar un cliente existente
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { ci_nit, nombre, telefono } = req.body;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    if (ci_nit && ci_nit !== client.ci_nit) {
      // Verificar si el nuevo ci_nit ya está en uso
      const existingClient = await Client.findOne({ where: { ci_nit } });
      if (existingClient) {
        return res.status(400).json({ message: 'El CI/NIT ya está en uso.' });
      }
      client.ci_nit = ci_nit;
    }

    client.nombre = nombre || client.nombre;
    client.telefono = telefono || client.telefono;

    await client.save();

    res.status(200).json(client);
  } catch (error) {
    console.error('Error al actualizar el cliente:', error);
    res.status(500).json({ message: 'Error al actualizar el cliente' });
  }
};

// Eliminar un cliente
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    await client.destroy();

    res.status(200).json({ message: 'Cliente eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar el cliente:', error);
    res.status(500).json({ message: 'Error al eliminar el cliente' });
  }
};exports.findClientByCI = async (req, res) => {
    try {
      const { ci_nit } = req.query;
      if (!ci_nit) {
        return res.status(400).json({ message: 'El parámetro ci_nit es requerido.' });
      }
  
      const client = await Client.findOne({ where: { ci_nit } });
  
      if (!client) {
        return res.status(404).json({ message: 'Cliente no encontrado.' });
      }
  
      res.status(200).json(client);
    } catch (error) {
      console.error('Error al buscar el cliente:', error);
      res.status(500).json({ message: 'Error al buscar el cliente.' });
    }
  };
