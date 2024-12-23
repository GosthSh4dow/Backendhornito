// routes/saleRoutes.js

const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

// Obtener todas las ventas
router.get('/', saleController.getAllSales);

// Obtener una venta por ID
router.get('/:id', saleController.getSaleById);

// Crear una nueva venta (solo administradores y usuarios)
router.post('/',  saleController.createSale);

// Actualizar una venta existente (solo administradores)
router.put('/:id',  saleController.updateSale);

// Eliminar una venta (solo administradores)
router.delete('/:id', saleController.deleteSale);

module.exports = router;
