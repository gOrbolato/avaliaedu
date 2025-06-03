// backend-nodejs/routes/instituicaoRoutes.js
const express = require('express');
const router = express.Router();
const instituicaoController = require('../controllers/instituicaoController');
// const verificarToken = require('../middlewares/verificarToken'); // Se precisar de autenticação

router.get('/', instituicaoController.buscarInstituicoes); // GET /api/instituicoes
router.get('/cursos', instituicaoController.buscarCursos);
// router.post('/', verificarToken, instituicaoController.cadastrarInstituicao); // Exemplo

module.exports = router;