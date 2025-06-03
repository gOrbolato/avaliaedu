// backend-nodejs/controllers/instituicaoController.js
const db = require('../config/db');

exports.buscarInstituicoes = async (req, res) => {
    // Adicionar lógica para filtros (termo, local, curso) de req.query
    const { termo, local, curso } = req.query;
    let sql = 'SELECT pk_instituicao, cidade, estado FROM instituicoes WHERE 1=1';
    const params = [];

    if (termo) {
        sql += ' AND (pk_instituicao LIKE ? OR cidade LIKE ?)';
        params.push(`%${termo}%`, `%${termo}%`);
    }
    if (local) {
        sql += ' AND (cidade LIKE ? OR estado LIKE ?)';
        params.push(`%${local}%`, `%${local}%`);
    }
    // Filtro por curso exigiria um JOIN, simplificado aqui

    try {
        const [rows] = await db.execute(sql, params);
        res.json({ success: true, instituicoes: rows });
    } catch (error) {
        console.error("Erro ao buscar instituições:", error);
        res.status(500).json({ success: false, message: "Erro ao buscar instituições." });
    }
};

exports.buscarCursos = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT pk_curso FROM cursos');
        res.json({ success: true, cursos: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar cursos.' });
    }
};

// Adicionar controller para cadastrar instituição, se necessário
// exports.cadastrarInstituicao ...