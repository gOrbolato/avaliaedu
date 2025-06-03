// backend-nodejs/controllers/relatorioController.js
const db = require('../config/db');
const { stringify } = require('csv-stringify/sync'); // Para download CSV

exports.getMediaAvaliacoesPorInstituicao = async (req, res) => {
    try {
        const sql = `
            SELECT i.pk_instituicao AS nome_instituicao, i.cidade, i.estado,
                   AVG(a.avaliacao) AS media_geral_avaliacao,
                   COUNT(a.pk_id_avaliacao) AS total_avaliacoes
            FROM instituicoes i
            LEFT JOIN avaliacoes a ON i.pk_instituicao = a.fk_instituicao
            GROUP BY i.pk_instituicao, i.cidade, i.estado
            ORDER BY media_geral_avaliacao DESC;
        `;
        const [rows] = await db.execute(sql);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Erro ao gerar relatório de médias por instituição:", error);
        res.status(500).json({ success: false, message: "Erro ao gerar relatório." });
    }
};

exports.downloadAvaliacoesCSV = async (req, res) => {
    // Permitir apenas admin
    if (!req.usuario || !req.usuario.admin) {
        return res.status(403).send('Apenas administradores podem exportar dados.');
    }
    try {
        // Query mais completa para o CSV
        const sql = `
            SELECT
                a.pk_id_avaliacao, a.texto, a.avaliacao, DATE_FORMAT(a.data_avaliacao, '%Y-%m-%d %H:%i:%s') as data_avaliacao,
                u.nome AS usuario_nome, u.email AS usuario_email,
                i.pk_instituicao AS instituicao_nome, i.cidade AS instituicao_cidade, i.estado AS instituicao_estado,
                c.pk_curso AS curso_nome,
                m.pk_materia AS materia_nome
            FROM avaliacoes a
            LEFT JOIN usuarios u ON a.fk_usuario_ra = u.pk_Ra
            LEFT JOIN instituicoes i ON a.fk_instituicao = i.pk_instituicao
            LEFT JOIN cursos c ON a.fk_curso = c.pk_curso
            LEFT JOIN materias m ON a.fk_materia = m.pk_materia
            ORDER BY a.data_avaliacao DESC;
        `;
        const [avaliacoes] = await db.execute(sql);

        if (avaliacoes.length === 0) {
            return res.status(404).send('Nenhuma avaliação encontrada para download.');
        }

        const csvData = stringify(avaliacoes, { header: true });

        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.attachment('relatorio_avaliacoes_completo.csv');
        res.send(csvData);

    } catch (error) {
        console.error("Erro ao gerar CSV de avaliações:", error);
        res.status(500).send("Erro ao gerar CSV.");
    }
};

// Configuração do intervalo de reavaliação (poderia vir do banco ou .env)
let intervaloReavaliacaoMeses = 6; // padrão 6 meses
exports.getConfigReavaliacao = (req, res) => {
    res.json({ success: true, meses: intervaloReavaliacaoMeses });
};
exports.setConfigReavaliacao = (req, res) => {
    if (!req.usuario || !req.usuario.admin) {
        return res.status(403).json({ success: false, message: 'Apenas administradores.' });
    }
    const { meses } = req.body;
    if (!meses || isNaN(meses) || meses < 1) {
        return res.status(400).json({ success: false, message: 'Valor inválido.' });
    }
    intervaloReavaliacaoMeses = Number(meses);
    res.json({ success: true, meses: intervaloReavaliacaoMeses });
};