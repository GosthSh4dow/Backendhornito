// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Obtener todas las órdenes
router.get('/', orderController.getAllOrders);

// Obtener una orden por ID
router.get('/:id', orderController.getOrderById);

// Crear una nueva orden (solo administradores y usuarios)
router.post('/', orderController.createOrder);

// Actualizar una orden existente (solo administradores)
router.put('/:id',  orderController.updateOrder);

// Eliminar una orden (solo administradores)
router.delete('/:id',  orderController.deleteOrder);
router.post('/:id/cancel', orderController.cancelOrder);
router.post('/:id/confirm', orderController.confirmOrder);
module.exports = router;
