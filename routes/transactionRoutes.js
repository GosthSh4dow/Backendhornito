// routes/transactionRoutes.js

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Obtener todas las transacciones
router.get('/', transactionController.getAllTransactions);
router.get('/sum-ingresos', transactionController.sumIngresos);
// Obtener una transacción por ID
router.get('/:id', transactionController.getTransactionById);

// Crear una nueva transacción (solo administradores)
router.post('/', transactionController.createTransaction);

// Actualizar una transacción existente (solo administradores)
router.put('/:id', transactionController.updateTransaction);

// Eliminar una transacción (solo administradores)
router.delete('/:id',transactionController.deleteTransaction);

module.exports = router;
