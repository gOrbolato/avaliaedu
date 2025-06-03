// backend-nodejs/routes/avaliacaoRoutes.js
const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacaoController');
const verificarToken = require('../middlewares/verificarToken');

// Submeter uma nova avaliação (requer autenticação)
router.post('/', verificarToken, avaliacaoController.submeterAvaliacao);

// Buscar avaliações de uma instituição específica (não requer autenticação, por exemplo)
router.get('/instituicao/:instituicaoId', avaliacaoController.buscarAvaliacoesPorInstituicao);

// Buscar avaliações de um usuário específico (para o painel do usuário)
router.get('/usuario/:usuarioId', verificarToken, avaliacaoController.buscarAvaliacoesPorUsuario);

// Buscar todas as avaliações (admin)
router.get('/', verificarToken, avaliacaoController.buscarTodasAvaliacoes);

module.exports = router;