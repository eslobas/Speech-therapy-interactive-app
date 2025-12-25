require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');

// Importar rotas
const authRoutes = require('./src/routes/auth.routes');
const missionRoutes = require('./src/routes/mission.routes');
const progressRoutes = require('./src/routes/progress.routes');
const therapistRoutes = require('./src/routes/therapist.routes');

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar à base de dados
connectDB();

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/therapist', therapistRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Speech Therapy API está a funcionar!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo correu mal!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});