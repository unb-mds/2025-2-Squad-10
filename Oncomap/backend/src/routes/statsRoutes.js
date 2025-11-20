// backend/src/routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const statsController = require('../api/controllers/statsController');

// Rota Geral (que fizemos antes)
// GET /api/stats/general
router.get('/general', statsController.getGeneralStats); 

// --- NOVAS ROTAS ---

// Rota para buscar um Estado por UF (ex: SP, RJ)
// GET /api/stats/state/SP
router.get('/state/:uf', statsController.getStateSpecificStats);

// Rota para buscar um Município por IBGE (ex: 3550308)
// GET /api/stats/municipality/3550308
router.get('/municipality/:ibge', statsController.getMunicipalitySpecificStats);

module.exports = router;