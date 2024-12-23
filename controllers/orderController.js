// controllers/orderController.js

const { Order, Product, OrderProduct, Client, Transaction, Branch, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Obtener todas las órdenes
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: Client,
          as: 'cliente',
          attributes: ['id', 'ci_nit', 'nombre', 'telefono'],
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
          attributes: ['id', 'tipo', 'monto', 'motivo', 'fecha', 'sucursalId'],
        },
      ],
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error al obtener las órdenes:', error);
    res.status(500).json({ message: 'Error al obtener las órdenes' });
  }
};

// Obtener una orden por ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'cliente',
          attributes: ['id', 'ci_nit', 'nombre', 'telefono'],
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
          attributes: ['id', 'tipo', 'monto', 'motivo', 'fecha', 'sucursalId'],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error al obtener la orden:', error);
    res.status(500).json({ message: 'Error al obtener la orden' });
  }
};

// Crear una nueva orden
exports.createOrder = async (req, res) => {
  try {
    const { clientId, fechaEntrega, horaEntrega, estado, total, adelanto, productos, sucursalId, usuarioId } = req.body;

    // Validaciones básicas
    if (
      !clientId ||
      !fechaEntrega ||
      !horaEntrega ||
      !estado ||
      total === undefined ||
      adelanto === undefined ||
      !productos ||
      !Array.isArray(productos) ||
      productos.length === 0 ||
      !sucursalId ||
      !usuarioId
    ) {
      return res.status(400).json({ message: 'Faltan campos requeridos o la lista de productos está vacía.' });
    }

    await sequelize.transaction(async (t) => {
      // Verificar que el cliente exista
      const client = await Client.findByPk(clientId, { transaction: t });
      if (!client) {
        throw new Error('Cliente no existe.');
      }

      // Verificar que la sucursal exista
      const branch = await Branch.findByPk(sucursalId, { transaction: t });
      if (!branch) {
        throw new Error('Sucursal no existe.');
      }

      // Verificar que el usuario exista y pertenezca a la sucursal
      const user = await User.findByPk(usuarioId, { transaction: t });
      if (!user || user.sucursalId !== sucursalId) {
        throw new Error('Usuario no existe o no pertenece a la sucursal especificada.');
      }

      // Crear la orden
      const newOrder = await Order.create(
        {
          clientId,
          fechaEntrega,
          horaEntrega,
          estado,
          total,
          adelanto,
          sucursalId,
          usuarioId,
          saleId: null, // saleId es null al crear la orden
        },
        { transaction: t }
      );

      // Registrar los productos en la orden y actualizar el stock
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

        // Registrar el producto en la orden
        await OrderProduct.create(
          {
            orderId: newOrder.id,
            productId,
            cantidad,
            precioUnitario: product.precio,
          },
          { transaction: t }
        );

        // Actualizar el stock del producto
        product.stock -= cantidad;
        await product.save({ transaction: t });
      }

      // Registrar la transacción asociada a la orden
      if (adelanto > 0) {
        await Transaction.create(
          {
            tipo: 'Ingreso',
            monto: adelanto,
            motivo: `Adelanto de la orden ID ${newOrder.id}`,
            fecha: new Date(),
            orderId: newOrder.id,
            sucursalId: sucursalId, // Asegurar que sucursalId está establecido
          },
          { transaction: t }
        );
      }

      // Obtener la orden recién creada con las relaciones dentro de la transacción
      const createdOrder = await Order.findByPk(newOrder.id, {
        include: [
          {
            model: Client,
            as: 'cliente',
            attributes: ['id', 'ci_nit', 'nombre', 'telefono'],
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
            attributes: ['id', 'tipo', 'monto', 'motivo', 'fecha', 'sucursalId'],
          },
        ],
        transaction: t,
      });

      res.status(201).json(createdOrder);
    });
  } catch (error) {
    console.error('Error al crear la orden:', error);

    // Manejar errores específicos
    if (error.message === 'Cliente no existe.' || error.message.startsWith('Producto') || error.message.startsWith('Usuario')) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: error.message || 'Error al crear la orden' });
  }
};

// Confirmar una orden (Entregar)
exports.confirmOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'productos',
          through: {
            attributes: ['cantidad'],
          },
        },
        {
          model: Client,
          as: 'cliente',
          attributes: ['id', 'ci_nit', 'nombre', 'telefono'],
        },
      ],
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: 'Orden no encontrada.' });
    }

    if (order.estado === 'Entregado') {
      await t.rollback();
      return res.status(400).json({ message: 'La orden ya ha sido entregada.' });
    }

    if (order.estado === 'Cancelado') {
      await t.rollback();
      return res.status(400).json({ message: 'No se puede confirmar una orden cancelada.' });
    }

    // Cambiar el estado a 'Entregado'
    order.estado = 'Entregado';
    await order.save({ transaction: t });

    // Calcular el monto restante a pagar
    const montoRestante = parseFloat(order.total) - parseFloat(order.adelanto);

    if (montoRestante > 0) {
      // Registrar la transacción de tipo Venta para el monto restante
      await Transaction.create(
        {
          tipo: 'Venta',
          monto: montoRestante,
          motivo: `Venta completa de la orden ID ${order.id}`,
          fecha: new Date(),
          orderId: order.id,
          sucursalId: order.sucursalId, // Asegurar que sucursalId está establecido
        },
        { transaction: t }
      );
    }

    await t.commit();

    // Obtener la orden actualizada con las relaciones
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'cliente',
          attributes: ['id', 'ci_nit', 'nombre', 'telefono'],
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
          attributes: ['id', 'tipo', 'monto', 'motivo', 'fecha', 'sucursalId'],
        },
      ],
    });

    res.status(200).json({ message: 'Orden confirmada y entregada exitosamente.', order: updatedOrder });
  } catch (error) {
    await t.rollback();
    console.error('Error al confirmar la orden:', error);
    res.status(500).json({ message: error.message || 'Error al confirmar la orden' });
  }
};

// Eliminar una orden
exports.deleteOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
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

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: 'Orden no encontrada.' });
    }

    // Restaurar el stock de los productos en la orden
    for (const product of order.productos) {
      const cantidad = product.OrderProduct.cantidad;
      product.stock += cantidad;
      await product.save({ transaction: t });
    }

    // Eliminar las transacciones asociadas a la orden
    await Transaction.destroy({ where: { orderId: id }, transaction: t });

    // Eliminar los productos de la orden
    await OrderProduct.destroy({ where: { orderId: id }, transaction: t });

    // Eliminar la orden
    await order.destroy({ transaction: t });

    await t.commit();

    res.status(200).json({ message: 'Orden eliminada con éxito.' });
  } catch (error) {
    await t.rollback();
    console.error('Error al eliminar la orden:', error);
    res.status(500).json({ message: 'Error al eliminar la orden' });
  }
};

// Cancelar una orden
exports.cancelOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
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

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: 'Orden no encontrada.' });
    }

    if (order.estado === 'Entregado') {
      await t.rollback();
      return res.status(400).json({ message: 'No se puede cancelar una orden ya entregada.' });
    }

    // Cambiar el estado a 'Cancelado' y restablecer adelanto a 0
    order.estado = 'Cancelado';
    order.adelanto = 0;
    await order.save({ transaction: t });

    // Restaurar el stock de los productos en la orden
    for (const product of order.productos) {
      const cantidad = product.OrderProduct.cantidad;
      product.stock += cantidad;
      await product.save({ transaction: t });
    }

    // Eliminar transacciones anteriores relacionadas con la orden
    await Transaction.destroy({ where: { orderId: id }, transaction: t });

    // Registrar la transacción de tipo Egreso para la devolución del adelanto (que ahora es 0)
    // Si se desea mantener un registro de la cancelación, se puede agregar una transacción adicional
    await Transaction.create(
      {
        tipo: 'Devolución de Pedido',
        monto: 0,
        motivo: `Cancelación de la orden ID ${order.id}`,
        fecha: new Date(),
        orderId: order.id,
        sucursalId: order.sucursalId, // Asegurar que sucursalId está establecido
      },
      { transaction: t }
    );

    await t.commit();

    res.status(200).json({ message: 'Orden cancelada exitosamente.' });
  } catch (error) {
    await t.rollback();
    console.error('Error al cancelar la orden:', error);
    res.status(500).json({ message: error.message || 'Error al cancelar la orden' });
  }
};

// Actualizar una orden existente
exports.updateOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { saleId, clientId, fechaEntrega, horaEntrega, estado, total, adelanto, productos, sucursalId, usuarioId } = req.body;

    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: 'Orden no encontrada.' });
    }

    // Actualizar campos básicos
    order.saleId = saleId || order.saleId;
    order.clientId = clientId || order.clientId;
    order.fechaEntrega = fechaEntrega || order.fechaEntrega;
    order.horaEntrega = horaEntrega || order.horaEntrega;
    order.estado = estado || order.estado;
    order.total = total !== undefined ? total : order.total;
    order.adelanto = adelanto !== undefined ? adelanto : order.adelanto;
    order.sucursalId = sucursalId || order.sucursalId;
    order.usuarioId = usuarioId || order.usuarioId;
    await order.save({ transaction: t });

    // Si se proporcionan productos, actualizar la relación
    if (productos && Array.isArray(productos)) {
      // Primero, restaurar el stock de los productos existentes en la orden
      const existingOrderProducts = await OrderProduct.findAll({ where: { orderId: id }, transaction: t });
      for (const op of existingOrderProducts) {
        const product = await Product.findByPk(op.productId, { transaction: t });
        if (product) {
          product.stock += op.cantidad;
          await product.save({ transaction: t });
        }
      }

      // Eliminar los productos existentes en la orden
      await OrderProduct.destroy({ where: { orderId: id }, transaction: t });

      // Luego, agregar los nuevos productos
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

        // Registrar el producto en la orden
        await OrderProduct.create(
          {
            orderId: order.id,
            productId,
            cantidad,
            precioUnitario: product.precio,
          },
          { transaction: t }
        );

        // Actualizar el stock del producto
        product.stock -= cantidad;
        await product.save({ transaction: t });
      }

      // Registrar las nuevas transacciones si es necesario (opcional)
      // Aquí podrías agregar lógica adicional si se requieren transacciones al actualizar productos
    }

    // Actualizar o crear las transacciones de adelanto y venta si es necesario
    if (adelanto !== undefined) {
      // Eliminar transacciones anteriores de adelanto
      await Transaction.destroy({ where: { orderId: id, motivo: { [Op.like]: 'Adelanto%' } }, transaction: t });

      if (adelanto > 0) {
        // Registrar el nuevo adelanto
        await Transaction.create(
          {
            tipo: 'Ingreso',
            monto: adelanto,
            motivo: `Adelanto de la orden ID ${order.id}`,
            fecha: new Date(),
            orderId: order.id,
            sucursalId: order.sucursalId, // Asegurar que sucursalId está establecido
          },
          { transaction: t }
        );
      }
    }

    if (total !== undefined) {
      // Eliminar transacciones anteriores de venta completa
      await Transaction.destroy({ where: { orderId: id, motivo: { [Op.like]: 'Venta completa%' } }, transaction: t });

      // Registrar la nueva transacción de venta completa
      await Transaction.create(
        {
          tipo: 'Venta',
          monto: total,
          motivo: `Venta completa de la orden ID ${order.id}`,
          fecha: new Date(),
          orderId: order.id,
          sucursalId: order.sucursalId, // Asegurar que sucursalId está establecido
        },
        { transaction: t }
      );
    }

    await t.commit();

    // Obtener la orden actualizada con las relaciones
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'cliente',
          attributes: ['id', 'ci_nit', 'nombre', 'telefono'],
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
          attributes: ['id', 'tipo', 'monto', 'motivo', 'fecha', 'sucursalId'],
        },
      ],
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar la orden:', error);
    res.status(500).json({ message: error.message || 'Error al actualizar la orden' });
  }
};
