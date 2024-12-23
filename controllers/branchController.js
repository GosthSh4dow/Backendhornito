// controllers/branchController.js

const { Branch } = require('../models');

// Obtener todas las sucursales
exports.getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.findAll();
    res.status(200).json(branches);
  } catch (error) {
    console.error('Error al obtener las sucursales:', error);
    res.status(500).json({ message: 'Error al obtener las sucursales' });
  }
};

// Obtener una sucursal por ID
exports.getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByPk(id);

    if (!branch) {
      return res.status(404).json({ message: 'Sucursal no encontrada' });
    }

    res.status(200).json(branch);
  } catch (error) {
    console.error('Error al obtener la sucursal:', error);
    res.status(500).json({ message: 'Error al obtener la sucursal' });
  }
};

// Crear una nueva sucursal
exports.createBranch = async (req, res) => {
  try {
    const { nombre, direccion, telefono, estado } = req.body;

    const newBranch = await Branch.create({
      nombre,
      direccion,
      telefono,
      estado,
    });

    res.status(201).json(newBranch);
  } catch (error) {
    console.error('Error al crear la sucursal:', error);
    res.status(500).json({ message: 'Error al crear la sucursal' });
  }
};

// Actualizar una sucursal existente
exports.updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, telefono, estado } = req.body;

    const branch = await Branch.findByPk(id);

    if (!branch) {
      return res.status(404).json({ message: 'Sucursal no encontrada' });
    }

    branch.nombre = nombre || branch.nombre;
    branch.direccion = direccion || branch.direccion;
    branch.telefono = telefono || branch.telefono;
    branch.estado = estado || branch.estado;

    await branch.save();

    res.status(200).json(branch);
  } catch (error) {
    console.error('Error al actualizar la sucursal:', error);
    res.status(500).json({ message: 'Error al actualizar la sucursal' });
  }
};

// Eliminar una sucursal
exports.deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findByPk(id);

    if (!branch) {
      return res.status(404).json({ message: 'Sucursal no encontrada' });
    }

    await branch.destroy();

    res.status(200).json({ message: 'Sucursal eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar la sucursal:', error);
    res.status(500).json({ message: 'Error al eliminar la sucursal' });
  }
};
