const express = require('express');
const router = express.Router();
const reportController = require('../api/controllers/reportController');

// Rota para baixar PDF da região
// GET http://localhost:3001/api/report/region/norte/pdf
router.get('/region/:regionName/pdf', reportController.generateRegionReport);

// Rota para PDF de Estado
// GET /api/report/state/:uf/pdf
router.get('/state/:uf/pdf', reportController.generateStateReport);

// Rota para PDF de Município
// GET /api/report/municipality/:ibge/pdf
router.get('/municipality/:ibge/pdf', reportController.generateMunicipalityReport);

module.exports = router;