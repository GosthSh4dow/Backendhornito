// index.js

require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3002;
const cors = require('cors'); // Importa
const fs = require('fs-extra'); // Importar fs-extra
// Middleware para manejar JSON
app.use(express.json());
app.use(cors());


// Verificar y crear la carpeta 'uploads' si no existe
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(uploadsDir));

// Importar rutas
const branchRoutes = require('./routes/branchRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const clientRoutes = require('./routes/clientRoutes');
const saleRoutes = require('./routes/saleRoutes');
const orderRoutes = require('./routes/orderRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Usar rutas
app.use('/api/branches', branchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

// Ruta básica
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando correctamente!');
});

// Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
