const express = require('express');
const router = express.Router();
const reportController = require('../api/controllers/reportController');

// Rota para baixar PDF da região
// GET http://localhost:3001/api/report/region/norte/pdf
router.get('/region/:regionName/pdf', reportController.generateRegionReport);

module.exports = router;