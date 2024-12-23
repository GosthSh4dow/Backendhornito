// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Obtener todos los usuarios
router.get('/', userController.getAllUsers);

// Obtener un usuario por ID
router.get('/:id', userController.getUserById);

// Crear un nuevo usuario
router.post('/', userController.createUser);

// Login
router.post('/login', userController.loginUser);

// Actualizar un usuario existente
router.put('/:id', userController.updateUser);

// Eliminar un usuario
router.delete('/:id', userController.deleteUser);

module.exports = router;
