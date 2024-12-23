// routes/branchRoutes.js

const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

// Obtener todas las sucursales
router.get('/', branchController.getAllBranches);

// Obtener una sucursal por ID
router.get('/:id', branchController.getBranchById);

// Crear una nueva sucursal
router.post('/', branchController.createBranch);

// Actualizar una sucursal existente
router.put('/:id', branchController.updateBranch);

// Eliminar una sucursal
router.delete('/:id', branchController.deleteBranch);

module.exports = router;
