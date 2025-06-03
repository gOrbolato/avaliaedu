// backend-nodejs/middlewares/verificarToken.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Acesso negado. Nenhum token fornecido.' });
    }

    // O token geralmente vem no formato "Bearer <token>"
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer') {
        return res.status(401).json({ success: false, message: 'Token mal formatado.' });
    }

    const token = tokenParts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; // Adiciona os dados do usuário decodificados à requisição
        // Ex: req.usuario.id será o pk_Ra do usuário
        next(); // Passa para a próxima função (controller)
    } catch (ex) {
        res.status(400).json({ success: false, message: 'Token inválido.' });
    }
};