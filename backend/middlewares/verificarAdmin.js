// backend/middlewares/verificarAdmin.js
module.exports = (req, res, next) => {
    // O middleware verificarToken já deve ter populado req.usuario
    if (!req.usuario || !req.usuario.admin) {
        return res.status(403).json({ success: false, message: 'Acesso restrito a administradores.' });
    }
    next();
};
