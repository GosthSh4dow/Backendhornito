// models/SaleProduct.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Sale = require('./Sale');
const Product = require('./Product');

const SaleProduct = sequelize.define('SaleProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  saleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sales', // Nombre de la tabla Sale
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products', // Nombre de la tabla Product
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
}, {
  tableName: 'sale_products',
  timestamps: true,
});

module.exports = SaleProduct;
