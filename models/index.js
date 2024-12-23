// models/index.js

const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Branch = require('./Branch');
const User = require('./User');
const Product = require('./Product');
const Client = require('./Client');
const Sale = require('./Sale');
const SaleProduct = require('./SaleProduct');
const Order = require('./Order');
const OrderProduct = require('./OrderProduct');
const Transaction = require('./Transaction');

// Definir relaciones

// Branch ↔ User
Branch.hasMany(User, { foreignKey: 'sucursalId', as: 'usuarios' });
User.belongsTo(Branch, { foreignKey: 'sucursalId', as: 'sucursal' });

// Product ↔ Sale a través de SaleProduct
Product.belongsToMany(Sale, { through: SaleProduct, foreignKey: 'productId', as: 'ventas' });
Sale.belongsToMany(Product, { through: SaleProduct, foreignKey: 'saleId', as: 'productos' });

// Client ↔ Sale
Client.hasMany(Sale, { foreignKey: 'clientId', as: 'ventas' });
Sale.belongsTo(Client, { foreignKey: 'clientId', as: 'cliente' });

// Client ↔ Order
Client.hasMany(Order, { foreignKey: 'clientId', as: 'pedidos' });
Order.belongsTo(Client, { foreignKey: 'clientId', as: 'cliente' });

// Order ↔ Sale
Sale.hasMany(Order, { foreignKey: 'saleId', as: 'pedidos' });
Order.belongsTo(Sale, { foreignKey: 'saleId', as: 'venta' });

// Order ↔ Product a través de OrderProduct
Order.belongsToMany(Product, { through: OrderProduct, foreignKey: 'orderId', as: 'productos' });
Product.belongsToMany(Order, { through: OrderProduct, foreignKey: 'productId', as: 'pedidos' });

// Sale ↔ Branch y User
Sale.belongsTo(Branch, { foreignKey: 'sucursalId', as: 'sucursalSale' });
Sale.belongsTo(User, { foreignKey: 'usuarioId', as: 'usuario' });

// Sale ↔ Transaction
Sale.hasMany(Transaction, { foreignKey: 'saleId', as: 'transacciones' });
Transaction.belongsTo(Sale, { foreignKey: 'saleId', as: 'venta' });

// Order ↔ Transaction
Order.hasMany(Transaction, { foreignKey: 'orderId', as: 'transacciones' });
Transaction.belongsTo(Order, { foreignKey: 'orderId', as: 'orden' });

// Transaction ↔ Branch
Branch.hasMany(Transaction, { foreignKey: 'sucursalId', as: 'transacciones' });
Transaction.belongsTo(Branch, { foreignKey: 'sucursalId', as: 'sucursal' });

// Product ↔ Branch
Product.belongsTo(Branch, { foreignKey: 'sucursalId', as: 'sucursalProduct' });
Branch.hasMany(Product, { foreignKey: 'sucursalId', as: 'productos' });

// Sincronizar modelos con la base de datos
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('Error al sincronizar los modelos:', error);
  }
};

syncModels();

module.exports = {
  Branch,
  User,
  Product,
  Client,
  Sale,
  SaleProduct,
  Order,
  OrderProduct,
  Transaction,
  sequelize,
};
