// controllers/saleController.js

const { Sale, Product, SaleProduct, Transaction, Branch, User,  Client,sequelize } = require('../models');

// Obtener todas las ventas
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [
        {
          model: Branch,
          as: 'sucursal',
          attributes: ['id', 'nombre', 'direccion', 'telefono', 'estado'],
        },
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'usuario', 'rol'],
        },
        {
          model: Product,
          as: 'productos',
          through: {
            attributes: ['cantidad', 'precioUnitario'],
          },
        },
        {
          model: Transaction,
          as: 'transacciones',
        },
      ],
    });
    res.status(200).json(sales);
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    res.status(500).json({ message: 'Error al obtener las ventas' });
  }
};

// Obtener una venta por ID
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findByPk(id, {
      include: [
        {
          model: Branch,
          as: 'sucursalSale',
          attributes: ['id', 'nombre', 'direccion', 'telefono', 'estado'],
        },
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'usuario', 'rol'],
        },
        {
          model: Product,
          as: 'productos',
          through: {
            attributes: ['cantidad', 'precioUnitario'],
          },
        },
        {
          model: Transaction,
          as: 'transacciones',
        },
      ],
    });

    if (!sale) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    res.status(200).json(sale);
  } catch (error) {
    console.error('Error al obtener la venta:', error);
    res.status(500).json({ message: 'Error al obtener la venta' });
  }
};
exports.createSale = async (req, res) => {
  try {
    const { total, adelanto, sucursalId, usuarioId, productos, clientId } = req.body;
    if (!total || adelanto === undefined || !sucursalId || !usuarioId || !productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: 'Faltan campos requeridos o la lista de productos está vacía.' });
    }

    await sequelize.transaction(async (t) => {
      const branch = await Branch.findByPk(sucursalId, { transaction: t });
      if (!branch) {
        throw new Error('Sucursal no existe.');
      }
      const user = await User.findByPk(usuarioId, { transaction: t });
      if (!user || user.sucursalId !== sucursalId) {
        throw new Error('Usuario no existe o no pertenece a la sucursal especificada.');
      }

      let client = null;
      if (clientId) {
        // Verificar que el cliente exista
        client = await Client.findByPk(clientId, { transaction: t });
        if (!client) {
          throw new Error('Cliente no existe.');
        }
      }

      // Crear la venta
      const newSale = await Sale.create({
        total,
        adelanto,
        sucursalId,
        usuarioId,
        clientId: client ? client.id : null,
      }, { transaction: t });

      // Registrar los productos en la venta y actualizar el stock
      for (const item of productos) {
        const { productId, cantidad } = item;

        // Verificar que el producto exista
        const product = await Product.findByPk(productId, { transaction: t });
        if (!product) {
          throw new Error(`Producto con ID ${productId} no existe.`);
        }

        // Verificar que haya suficiente stock
        if (product.stock < cantidad) {
          throw new Error(`Producto ${product.nombre} no tiene suficiente stock.`);
        }

        // Registrar el producto en la venta
        await SaleProduct.create({
          saleId: newSale.id,
          productId,
          cantidad,
          precioUnitario: product.precio,
        }, { transaction: t });

        // Actualizar el stock del producto
        product.stock -= cantidad;
        await product.save({ transaction: t });
      }

      // Registrar el adelanto como una transacción de ingreso
      if (adelanto > 0) {
        await Transaction.create({
          tipo: 'Ingreso',
          monto: adelanto,
          motivo: `Adelanto de la venta ID ${newSale.id}`,
          fecha: new Date(),
          saleId: newSale.id,
          sucursalId: sucursalId, // Añadido sucursalId
        }, { transaction: t });
      }

      // Registrar la transacción de tipo Venta
      await Transaction.create({
        tipo: 'Ingreso',
        monto: total, // O subtotal si prefieres
        motivo: `Venta completa de la venta ID ${newSale.id}`,
        fecha: new Date(),
        saleId: newSale.id,
        sucursalId: sucursalId, // Añadido sucursalId
      }, { transaction: t });

      // Obtener la venta recién creada con las relaciones
      const sale = await Sale.findByPk(newSale.id, {
        include: [
          {
            model: Branch,
            as: 'sucursalSale',
            attributes: ['id', 'nombre', 'direccion', 'telefono', 'estado'],
          },
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nombre', 'apellido', 'usuario', 'rol'],
          },
          {
            model: Product,
            as: 'productos',
            through: {
              attributes: ['cantidad', 'precioUnitario'],
            },
          },
          {
            model: Transaction,
            as: 'transacciones',
          },
          {
            model: Client,
            as: 'cliente',
            attributes: ['id', 'ci_nit', 'nombre', 'telefono'],
          },
        ],
        transaction: t,
      });

      res.status(201).json(sale);
    });
  } catch (error) {
    console.error('Error al crear la venta:', error);
    res.status(500).json({ message: error.message || 'Error al crear la venta' });
  }
};

// Actualizar una venta existente (por ejemplo, modificar el adelanto)
exports.updateSale = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { total, adelanto, sucursalId, usuarioId, productos } = req.body;

    const sale = await Sale.findByPk(id, { transaction: t });
    if (!sale) {
      await t.rollback();
      return res.status(404).json({ message: 'Venta no encontrada.' });
    }

    // Actualizar campos básicos
    sale.total = total !== undefined ? total : sale.total;
    sale.adelanto = adelanto !== undefined ? adelanto : sale.adelanto;
    sale.sucursalId = sucursalId || sale.sucursalId;
    sale.usuarioId = usuarioId || sale.usuarioId;
    await sale.save({ transaction: t });

    // Si se proporcionan productos, actualizar la relación
    if (productos && Array.isArray(productos)) {
      // Primero, eliminar los productos existentes en la venta
      await SaleProduct.destroy({ where: { saleId: id }, transaction: t });

      // Luego, agregar los nuevos productos
      for (const item of productos) {
        const { productId, cantidad } = item;

        // Verificar que el producto exista
        const product = await Product.findByPk(productId, { transaction: t });
        if (!product) {
          await t.rollback();
          return res.status(400).json({ message: `Producto con ID ${productId} no existe.` });
        }

        // Verificar que haya suficiente stock
        if (product.stock < cantidad) {
          await t.rollback();
          return res.status(400).json({ message: `Producto ${product.nombre} no tiene suficiente stock.` });
        }

        // Registrar el producto en la venta
        await SaleProduct.create({
          saleId: sale.id,
          productId,
          cantidad,
          precioUnitario: product.precio,
        }, { transaction: t });

        // Actualizar el stock del producto
        product.stock -= cantidad;
        await product.save({ transaction: t });
      }
    }

    // Actualizar o crear la transacción de adelanto
    if (adelanto !== undefined) {
      // Eliminar transacciones anteriores de adelanto
      await Transaction.destroy({ where: { saleId: id, motivo: { [sequelize.Op.like]: 'Adelanto%' } }, transaction: t });

      if (adelanto > 0) {
        // Registrar el nuevo adelanto
        await Transaction.create({
          tipo: 'Ingreso',
          monto: adelanto,
          motivo: `Adelanto de la venta ID ${sale.id}`,
          fecha: new Date(),
          saleId: sale.id,
          sucursalId: sale.sucursalId, // Añadido sucursalId
        }, { transaction: t });
      }
    }

    // Actualizar o crear la transacción de Venta
    if (total !== undefined) {
      // Eliminar transacciones anteriores de venta
      await Transaction.destroy({ where: { saleId: id, motivo: { [sequelize.Op.like]: 'Venta completa%' } }, transaction: t });

      // Registrar la nueva transacción de venta
      await Transaction.create({
        tipo: 'Ingreso',
        monto: total,
        motivo: `Venta completa de la venta ID ${sale.id}`,
        fecha: new Date(),
        saleId: sale.id,
        sucursalId: sale.sucursalId, // Añadido sucursalId
      }, { transaction: t });
    }

    await t.commit();

    // Obtener la venta actualizada con las relaciones
    const updatedSale = await Sale.findByPk(id, {
      include: [
        {
          model: Branch,
          as: 'sucursal',
          attributes: ['id', 'nombre', 'direccion', 'telefono', 'estado'],
        },
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'usuario', 'rol'],
        },
        {
          model: Product,
          as: 'productos',
          through: {
            attributes: ['cantidad', 'precioUnitario'],
          },
        },
        {
          model: Transaction,
          as: 'transacciones',
        },
      ],
    });

    res.status(200).json(updatedSale);
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar la venta:', error);
    res.status(500).json({ message: 'Error al actualizar la venta' });
  }
};
exports.deleteSale = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const sale = await Sale.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'productos',
          through: {
            attributes: ['cantidad'],
          },
        },
      ],
      transaction: t,
    });

    if (!sale) {
      await t.rollback();
      return res.status(404).json({ message: 'Venta no encontrada.' });
    }

    // Restaurar el stock de los productos
    for (const product of sale.productos) {
      const cantidadVendida = product.SaleProduct.cantidad;
      product.stock += cantidadVendida;
      await product.save({ transaction: t });
    }

    // Eliminar las transacciones asociadas
    await Transaction.destroy({ where: { saleId: id }, transaction: t });

    // Eliminar la venta (esto también eliminará las entradas en SaleProduct debido a onDelete: CASCADE)
    await sale.destroy({ transaction: t });

    await t.commit();

    res.status(200).json({ message: 'Venta eliminada con éxito.' });
  } catch (error) {
    await t.rollback();
    console.error('Error al eliminar la venta:', error);
    res.status(500).json({ message: 'Error al eliminar la venta' });
  }
};
