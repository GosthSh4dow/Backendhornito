// controllers/userController.js

const { User, Branch } = require('../models');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'hornito'; // Reemplaza con una clave segura en producción

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: {
        model: Branch,
        as: 'sucursal',
        attributes: ['id', 'nombre', 'direccion', 'telefono', 'estado'],
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      include: {
        model: Branch,
        as: 'sucursal',
        attributes: ['id', 'nombre', 'direccion', 'telefono', 'estado'],
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
  try {
    const { nombre, apellido, telefono, usuario, contraseña, rol, sucursalId } = req.body;

    // Validar que la sucursal exista
    const branch = await Branch.findByPk(sucursalId);
    if (!branch) {
      return res.status(400).json({ message: 'Sucursal no existe' });
    }

    const newUser = await User.create({
      nombre,
      apellido,
      telefono,
      usuario,
      contraseña, // **Nota:** Deberías hash la contraseña antes de almacenarla
      rol,
      sucursalId,
      estado: true, // Por defecto, activo
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
};

// Actualizar un usuario existente
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, usuario, contraseña, rol, sucursalId, estado } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (sucursalId) {
      const branch = await Branch.findByPk(sucursalId);
      if (!branch) {
        return res.status(400).json({ message: 'Sucursal no existe' });
      }
      user.sucursalId = sucursalId;
    }

    user.nombre = nombre || user.nombre;
    user.apellido = apellido || user.apellido;
    user.telefono = telefono || user.telefono;
    user.usuario = usuario || user.usuario;
    user.rol = rol || user.rol;
    user.estado = typeof estado === 'boolean' ? estado : user.estado;

    if (contraseña) {
      user.contraseña = contraseña; // **Nota:** Deberías hash la contraseña antes de almacenarla
    }

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await user.destroy();

    res.status(200).json({ message: 'Usuario eliminado con éxito.' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ message: 'Error al eliminar el usuario.' });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { usuario, contraseña } = req.body;

    const user = await User.findOne({
      where: { usuario },
      include: {
        model: Branch,
        as: 'sucursal',
        attributes: ['id', 'nombre', 'direccion', 'telefono', 'estado'],
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    if (user.contraseña !== contraseña) { // **Nota:** Deberías usar hashed passwords
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, user });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};
