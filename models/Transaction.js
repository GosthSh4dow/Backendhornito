// models/Transaction.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: {
    type: DataTypes.STRING, // 'Ingreso', 'Egreso', 'Venta', 'Devolución de Pedido', etc.
    allowNull: false,
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  saleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'sales',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  sucursalId: { // Nueva asociación con sucursal
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'branches',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'transactions',
  timestamps: true,
});

Transaction.associate = (models) => {
  Transaction.belongsTo(models.Sale, {
    as: 'venta',
    foreignKey: 'saleId',
  });

  Transaction.belongsTo(models.Order, {
    as: 'orden',
    foreignKey: 'orderId',
  });

  Transaction.belongsTo(models.Branch, { // Asociación con sucursal
    as: 'sucursal',
    foreignKey: 'sucursalId',
  });
};

module.exports = Transaction;
