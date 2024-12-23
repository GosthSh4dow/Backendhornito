// models/User.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Branch = require('./Branch');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isNumeric: true,
      len: [7, 15], // Ajusta según el formato de teléfono
    },
  },
  usuario: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  contraseña: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true, // true: activo, false: inactivo
  },
  rol: {
    type: DataTypes.ENUM('Administrador', 'Usuario'),
    allowNull: false,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
