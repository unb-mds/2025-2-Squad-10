const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.get('/api/health', (req, res) => {
res.json({ message: 'Backend está funcionando!' });
});

// Iniciar servidor
app.listen(PORT, () => {
console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
