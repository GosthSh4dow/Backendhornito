// controllers/transactionController.js

const { Transaction, Sale } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

// Obtener todas las transacciones filtradas por sucursalId si se proporciona
exports.getAllTransactions = async (req, res) => {
  try {
    const { sucursalId } = req.query;

    const whereCondition = {};

    if (sucursalId) {
      whereCondition.sucursalId = sucursalId;
    }

    const transactions = await Transaction.findAll({
      where: whereCondition,
      include: [
        {
          model: Sale,
          as: 'venta',
          attributes: ['id', 'fecha', 'total', 'adelanto'],
        },
      ],
      order: [['fecha', 'DESC']],
    });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error al obtener las transacciones:', error);
    res.status(500).json({ message: 'Error al obtener las transacciones' });
  }
};

// Obtener una transacción por ID
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByPk(id, {
      include: [
        {
          model: Sale,
          as: 'venta',
          attributes: ['id', 'fecha', 'total', 'adelanto'],
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transacción no encontrada' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error('Error al obtener la transacción:', error);
    res.status(500).json({ message: 'Error al obtener la transacción' });
  }
};

// Crear una nueva transacción
exports.createTransaction = async (req, res) => {
  try {
    const { tipo, monto, motivo, saleId, fecha, sucursalId } = req.body;

    // Validaciones básicas
    if (!tipo || monto === undefined || !motivo || !fecha || !sucursalId) {
      return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    // Verificar que el tipo sea válido
    if (!['Ingreso', 'Egreso'].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo de transacción inválido.' });
    }

    // Si saleId está proporcionado, verificar que la venta exista
    if (saleId) {
      const sale = await Sale.findByPk(saleId);
      if (!sale) {
        return res.status(400).json({ message: 'Venta no existe.' });
      }
    }

    const newTransaction = await Transaction.create({
      tipo,
      monto,
      motivo,
      saleId: saleId || null,
      fecha,
      sucursalId,
    });

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error al crear la transacción:', error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((err) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error al crear la transacción' });
  }
};

// Actualizar una transacción existente
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, monto, motivo, saleId } = req.body;

    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transacción no encontrada.' });
    }

    // Actualizar campos
    if (tipo) {
      if (!['Ingreso', 'Egreso'].includes(tipo)) {
        return res.status(400).json({ message: 'Tipo de transacción inválido.' });
      }
      transaction.tipo = tipo;
    }

    if (monto !== undefined) {
      transaction.monto = monto;
    }

    if (motivo) {
      transaction.motivo = motivo;
    }

    if (saleId !== undefined) {
      if (saleId) {
        const sale = await Sale.findByPk(saleId);
        if (!sale) {
          return res.status(400).json({ message: 'Venta no existe.' });
        }
        transaction.saleId = saleId;
      } else {
        transaction.saleId = null;
      }
    }

    await transaction.save();

    res.status(200).json(transaction);
  } catch (error) {
    console.error('Error al actualizar la transacción:', error);
    res.status(500).json({ message: 'Error al actualizar la transacción' });
  }
};

// Eliminar una transacción
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transacción no encontrada.' });
    }

    await transaction.destroy();

    res.status(200).json({ message: 'Transacción eliminada con éxito.' });
  } catch (error) {
    console.error('Error al eliminar la transacción:', error);
    res.status(500).json({ message: 'Error al eliminar la transacción' });
  }
};

// Sumar ingresos por fecha y sucursal
exports.sumIngresos = async (req, res) => {
  try {
    const { fecha, sucursalId } = req.query;

    if (!fecha || !sucursalId) {
      return res.status(400).json({ message: 'Faltan parámetros requeridos: fecha y sucursalId.' });
    }

    const totalIngresos = await Transaction.sum('monto', {
      where: {
        tipo: 'Ingreso',
        fecha: fecha,
        sucursalId: sucursalId,
      },
      include: [
        {
          model: Sale,
          as: 'venta',
          where: {
            sucursalId: sucursalId,
          },
          attributes: [],
        },
      ],
    });

    res.status(200).json({ totalIngresos: totalIngresos || 0 });
  } catch (error) {
    console.error('Error al sumar los ingresos:', error);
    res.status(500).json({ message: 'Error al sumar los ingresos.' });
  }
};
