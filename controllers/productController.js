// controllers/productController.js

const { Product, Branch } = require('../models');
const fs = require('fs');
const path = require('path');

// Asegurarse de que la carpeta 'uploads' existe
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Obtener todos los productos con sus sucursales
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Branch,
          as: 'sucursalProduct',
          attributes: ['id', 'nombre', 'direccion', 'telefono', 'estado'],
        },
      ],
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
};

// Obtener un producto por ID con su sucursal
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Branch,
          as: 'sucursalProduct',
          attributes: ['id', 'nombre', 'direccion', 'telefono', 'estado'],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ message: 'Error al obtener el producto' });
  }
};

// Crear un nuevo producto con manejo de imagen y asociación a sucursal
exports.createProduct = async (req, res) => {
  try {
    const { sku, nombre, descripcion, categoria, precio, stock, sucursalId } = req.body;
    let imagenUrl = null;

    if (req.file) {
      imagenUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const newProduct = await Product.create({
      sku,
      nombre,
      descripcion,
      categoria,
      precio,
      stock,
      sucursalId,
      imagenUrl,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ message: 'Error al crear el producto' });
  }
};

// Actualizar un producto existente con manejo de imagen y asociación a sucursal
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, nombre, descripcion, categoria, precio, stock, sucursalId } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    let imagenUrl = product.imagenUrl;

    if (req.file) {
      imagenUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    product.sku = sku || product.sku;
    product.nombre = nombre || product.nombre;
    product.descripcion = descripcion || product.descripcion;
    product.categoria = categoria || product.categoria;
    product.precio = precio !== undefined ? precio : product.precio;
    product.stock = stock !== undefined ? stock : product.stock;
    product.sucursalId = sucursalId || product.sucursalId;
    product.imagenUrl = imagenUrl || product.imagenUrl;

    await product.save();

    res.status(200).json(product);
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ message: 'Error al actualizar el producto' });
  }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    await product.destroy();

    res.status(200).json({ message: 'Producto eliminado con éxito.' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ message: 'Error al eliminar el producto.' });
  }
};
