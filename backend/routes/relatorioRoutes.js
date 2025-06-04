// backend-nodejs/routes/relatorioRoutes.js
const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');
const verificarToken = require('../middlewares/verificarToken'); // Pode ser necessário para alguns relatórios
const verificarAdmin = require('../middlewares/verificarAdmin');

// Endpoint para dados JSON para gráficos no React
router.get('/media-avaliacoes-instituicao', relatorioController.getMediaAvaliacoesPorInstituicao);

// Endpoint para download CSV
router.get('/avaliacoes/download-csv', verificarToken, relatorioController.downloadAvaliacoesCSV);

// Endpoint para configuração do intervalo de reavaliação
router.get('/config/reavaliacao', relatorioController.getConfigReavaliacao);
router.post('/config/reavaliacao', verificarToken, verificarAdmin, relatorioController.setConfigReavaliacao);

module.exports = router;