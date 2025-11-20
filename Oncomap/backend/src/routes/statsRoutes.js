const express = require('express');
const router = express.Router();
const statsController = require('../api/controllers/statsController');

// Rota GET que retorna os totais acumulados de Estados e Municípios
router.get('/general', statsController.getGeneralStats);

module.exports = router;