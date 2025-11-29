const { Pool } = require('pg');
require('dotenv').config();

// Verifica se estamos em produção (na nuvem)
const isProduction = process.env.NODE_ENV === 'production';

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
};

// Só ativa SSL se estivermos em produção. 
// No Docker local, o banco não usa SSL, então isso evita o erro de conexão.
if (isProduction) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(poolConfig);

module.exports = {
  query: (text, params) => pool.query(text, params),
};