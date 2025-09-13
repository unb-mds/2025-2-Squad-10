import express from "express"; // se usar "type": "module" no package.json
// ou const express = require("express"); se não usar ESM

const app = express();
const PORT = 3000;

// Middleware para interpretar JSON
app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.send("Backend Node.js funcionando! 🚀");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

import dotenv from "dotenv";
dotenv.config();

const PORT2 = process.env.PORT || 3000;
