// middleware/uploadMiddleware.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Definir la carpeta de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    // Verificar si la carpeta existe, si no, crearla
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});


// Inicializar multer
const upload = multer({
  storage,

  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB límite
});

module.exports = upload;
