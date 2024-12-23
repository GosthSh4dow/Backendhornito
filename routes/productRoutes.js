// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento con Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); // Ruta a la carpeta uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage});


// Obtener todos los productos
router.get('/', productController.getAllProducts);

// Obtener un producto por ID
router.get('/:id', productController.getProductById);

// Crear un nuevo producto (solo administradores)
router.post('/',  upload.single('imagen'), productController.createProduct);

// Actualizar un producto existente (solo administradores)
router.put('/:id',  upload.single('imagen'), productController.updateProduct);

// Eliminar un producto (solo administradores)
router.delete('/:id', productController.deleteProduct);

module.exports = router;
