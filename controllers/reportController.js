// controllers/reportController.js

const { Sale, Transaction } = require('../models');
const moment = require('moment-timezone');
const { Op } = require('sequelize');

// Obtener ventas de hoy para una sucursal
exports.getSalesToday = async (req, res) => {
  try {
    const { sucursalId } = req.query;

    if (!sucursalId) {
      return res.status(400).json({ message: 'sucursalId es requerido.' });
    }

    const startOfDay = moment().tz('America/La_Paz').startOf('day').toDate();
    const endOfDay = moment().tz('America/La_Paz').endOf('day').toDate();

    const salesToday = await Sale.findAll({
      where: {
        sucursalId: sucursalId,
        fecha: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      include: [
        {
          model: Transaction,
          as: 'transacciones',
          attributes: ['id', 'tipo', 'monto', 'motivo', 'fecha'],
        },
      ],
      order: [['fecha', 'DESC']],
    });

    res.status(200).json(salesToday);
  } catch (error) {
    console.error('Error al obtener las ventas de hoy:', error);
    res.status(500).json({ message: 'Error al obtener las ventas de hoy.' });
  }
};

// Obtener ventas de la semana para una sucursal
exports.getSalesWeek = async (req, res) => {
  try {
    const { sucursalId } = req.query;

    if (!sucursalId) {
      return res.status(400).json({ message: 'sucursalId es requerido.' });
    }

    const startOfWeek = moment().tz('America/La_Paz').startOf('isoWeek').toDate();
    const endOfWeek = moment().tz('America/La_Paz').endOf('isoWeek').toDate();

    const salesWeek = await Sale.findAll({
      where: {
        sucursalId: sucursalId,
        fecha: {
          [Op.between]: [startOfWeek, endOfWeek],
        },
      },
      include: [
        {
          model: Transaction,
          as: 'transacciones',
          attributes: ['id', 'tipo', 'monto', 'motivo', 'fecha'],
        },
      ],
      order: [['fecha', 'DESC']],
    });

    res.status(200).json(salesWeek);
  } catch (error) {
    console.error('Error al obtener las ventas de la semana:', error);
    res.status(500).json({ message: 'Error al obtener las ventas de la semana.' });
  }
};

// Obtener ventas del mes para una sucursal
exports.getSalesMonth = async (req, res) => {
  try {
    const { sucursalId } = req.query;

    if (!sucursalId) {
      return res.status(400).json({ message: 'sucursalId es requerido.' });
    }

    const startOfMonth = moment().tz('America/La_Paz').startOf('month').toDate();
    const endOfMonth = moment().tz('America/La_Paz').endOf('month').toDate();

    const salesMonth = await Sale.findAll({
      where: {
        sucursalId: sucursalId,
        fecha: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      include: [
        {
          model: Transaction,
          as: 'transacciones',
          attributes: ['id', 'tipo', 'monto', 'motivo', 'fecha'],
        },
      ],
      order: [['fecha', 'DESC']],
    });

    res.status(200).json(salesMonth);
  } catch (error) {
    console.error('Error al obtener las ventas del mes:', error);
    res.status(500).json({ message: 'Error al obtener las ventas del mes.' });
  }
};

// Obtener ventas por rango de fechas para una sucursal
exports.getSalesByDateRange = async (req, res) => {
  try {
    const { sucursalId, startDate, endDate } = req.query;

    if (!sucursalId || !startDate || !endDate) {
      return res.status(400).json({ message: 'sucursalId, startDate y endDate son requeridos.' });
    }

    const start = moment(startDate).tz('America/La_Paz').startOf('day').toDate();
    const end = moment(endDate).tz('America/La_Paz').endOf('day').toDate();

    const salesRange = await Sale.findAll({
      where: {
        sucursalId: sucursalId,
        fecha: {
          [Op.between]: [start, end],
        },
      },
      include: [
        {
          model: Transaction,
          as: 'transacciones',
          attributes: ['id', 'tipo', 'monto', 'motivo', 'fecha'],
        },
      ],
      order: [['fecha', 'DESC']],
    });

    res.status(200).json(salesRange);
  } catch (error) {
    console.error('Error al obtener las ventas por rango de fechas:', error);
    res.status(500).json({ message: 'Error al obtener las ventas por rango de fechas.' });
  }
};
