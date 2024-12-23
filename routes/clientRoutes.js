// routes/clientRoutes.js

const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// Obtener todos los clientes
router.get('/', clientController.getAllClients);
router.get('/search', clientController.findClientByCI);
// Obtener un cliente por ID
router.get('/:id', clientController.getClientById);

// Crear un nuevo cliente
router.post('/', clientController.createClient);

// Actualizar un cliente existente
router.put('/:id', clientController.updateClient);

// Eliminar un cliente
router.delete('/:id', clientController.deleteClient);

module.exports = router;
