const User = require('../models/User.model');
const TherapistPatient = require('../models/TherapistPatient.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Gerar código único para terapeuta
const generateTherapistCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

exports.registerTherapist = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Verificar se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já registado' });
    }

    // Criar código do terapeuta
    const therapistCode = generateTherapistCode();

    // Hash da password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar terapeuta
    const therapist = new User({
      email,
      password: hashedPassword,
      name,
      role: 'therapist'
    });

    await therapist.save();

    // Gerar token JWT
    const token = jwt.sign(
      { userId: therapist._id, role: therapist.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Terapeuta registado com sucesso',
      token,
      user: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        role: therapist.role,
        therapistCode
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

exports.registerPatient = async (req, res) => {
  try {
    const { email, password, name, age, therapistCode } = req.body;
    
    // Verificar se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já registado' });
    }

    // Verificar código do terapeuta
    const therapist = await User.findOne({ 
      role: 'therapist',
      therapistCode 
    });

    if (!therapist) {
      return res.status(400).json({ error: 'Código do terapeuta inválido' });
    }

    // Hash da password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar paciente
    const patient = new User({
      email,
      password: hashedPassword,
      name,
      role: 'patient',
      age,
      therapistCode
    });

    await patient.save();

    // Associar paciente ao terapeuta
    const therapistPatient = new TherapistPatient({
      therapist: therapist._id,
      patient: patient._id,
      therapistCode
    });

    await therapistPatient.save();

    // Gerar token JWT
    const token = jwt.sign(
      { userId: patient._id, role: patient.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Paciente registado com sucesso',
      token,
      user: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        role: patient.role,
        age: patient.age
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Encontrar utilizador
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Atualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login bem-sucedido',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
};