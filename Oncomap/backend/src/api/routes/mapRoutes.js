// backend/src/routes/mapRoutes.js
const express = require('express');
const router = express.Router();
const mockController = require('../controllers/mockController');

// Rota ÚNICA para buscar todos os dados de investimento
router.get('/investimentos', mockController.getDadosInvestimentos);

module.exports = router;