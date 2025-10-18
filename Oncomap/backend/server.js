// Oncomap/backend/server.js
require('dotenv').config();

// Importa a configuração do app que ficará em src/app.js
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor OncoMap rodando na porta ${PORT}`);
});