// models/Order.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  saleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'sales',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  fechaEntrega: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  horaEntrega: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('Pendiente', 'Entregado', 'Cancelado'),
    allowNull: false,
    defaultValue: 'Pendiente',
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  adelanto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'branches',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'orders',
  timestamps: true,
});

module.exports = Order;
