// backend/src/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

// O objeto Pool do 'pg' gerencia múltiplas conexões para nós,
// o que é mais eficiente do que criar uma nova conexão a cada consulta.
const pool = new Pool({
  // Se você tiver a variável DATABASE_URL no seu .env, 
  // o 'pg' a utiliza automaticamente.
  // Caso contrário, ele usará as variáveis DB_USER, DB_HOST, etc.
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Exportamos um objeto com um método 'query' que usaremos em todo o projeto
// para interagir com o banco de dados.
module.exports = {
  query: (text, params) => pool.query(text, params),
};