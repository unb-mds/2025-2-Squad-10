// Oncomap/backend/src/config/database.js
const { Pool } = require('pg');
require('dotenv').config(); // Garante que o .env seja lido

const pool = new Pool({
  // Esta é a mudança principal:
  // O 'pg' automaticamente entende a variável DATABASE_URL
  // e pega todas as informações (host, porta, usuário, senha, ssl) dela.
  connectionString: process.env.DATABASE_URL, 
  
  // Nós ainda forçamos o SSL, o que é uma boa prática
  // para garantir a conexão com o Supabase Pooler.
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};