// models/Sale.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
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
      model: 'branches', // Nombre de la tabla Branch
      key: 'id',
    },
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Nombre de la tabla User
      key: 'id',
    },
  },
  clientId: { // Añade este campo
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clients', // Nombre de la tabla Client
      key: 'id',
    },
  },
}, {
  tableName: 'sales',
  timestamps: true,
});

module.exports = Sale;
