// backend-nodejs/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verificarToken = require('../middlewares/verificarToken');

router.post('/cadastro', authController.cadastro);
router.post('/login', authController.login);
router.put('/editar-perfil', verificarToken, authController.editarPerfil);

module.exports = router;