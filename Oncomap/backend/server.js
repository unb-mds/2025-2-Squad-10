require('dotenv').config();

// Importa a configuração do app que ficará em src/app.js
const app = require('./src/app');

// CORREÇÃO: Alterado de 3001 para 3000 para alinhar com o Dockerfile e docker-compose
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor OncoMap rodando na porta ${PORT}`);
});