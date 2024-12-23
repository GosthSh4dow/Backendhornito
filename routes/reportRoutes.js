// routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Obtener ventas de hoy
router.get('/sales/today', reportController.getSalesToday);

// Obtener ventas de la semana
router.get('/sales/week', reportController.getSalesWeek);

// Obtener ventas del mes
router.get('/sales/month', reportController.getSalesMonth);

// Obtener ventas por rango de fechas
router.get('/sales', reportController.getSalesByDateRange);

module.exports = router;
