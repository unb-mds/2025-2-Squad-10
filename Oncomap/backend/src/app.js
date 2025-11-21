// Oncomap/backend/src/app.js
const express = require('express');
const cors = require('cors');

const statsRoutes = require('./routes/statsRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar as rotas (note o novo caminho relativo)
const mapRoutes = require('./api/routes/mapRoutes');

// Rota para verificar a saúde da API
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Backend está funcionando!' });
});

// Usar as Rotas com um prefixo de versão (boa prática)
app.use('/api/v1/map', mapRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/report', reportRoutes);

// Exportamos o 'app' para que o server.js possa usá-lo
module.exports = app;