// models/Product.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  imagenUrl: {
    type: DataTypes.STRING,
    allowNull: true,
   /* validate: {
      isUrl: {
        args: {
          protocols: ['http', 'https'],
          require_protocol: true,
          require_tld: false, // Permite URLs como 'http://localhost/...'
        },
        msg: 'Debe ser una URL válida',
      },
    },*/
  },
  sucursalId: { // Nueva columna para la asociación con Branch
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'branches',
      key: 'id',
    },
  },
}, {
  tableName: 'products',
  timestamps: true,
});

// Definir la asociación con Branch
Product.associate = (models) => {
  Product.belongsTo(models.Branch, { foreignKey: 'sucursalId', as: 'sucursalProduct' });
};

module.exports = Product;
