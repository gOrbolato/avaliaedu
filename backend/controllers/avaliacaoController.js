// backend-nodejs/controllers/avaliacaoController.js
const db = require('../config/db');

exports.submeterAvaliacao = async (req, res) => {
    // req.usuario.id virá do middleware verificarToken (é o pk_Ra)
    const fk_usuario_ra = req.usuario.id;
    const { fk_instituicao, fk_curso, fk_materia, texto, avaliacao } = req.body;

    if (!fk_instituicao || !texto || avaliacao === undefined) {
        return res.status(400).json({ success: false, message: "Instituição, texto e nota da avaliação são obrigatórios." });
    }
    if (avaliacao < 1 || avaliacao > 5) {
        return res.status(400).json({ success: false, message: "A nota deve ser entre 1 e 5." });
    }

    // Valide se as FKs (instituicao, curso, materia) existem no banco ANTES de inserir.
    // ... (código de validação omitido para brevidade) ...

    try {
        const sql = `
            INSERT INTO avaliacoes (fk_instituicao, fk_curso, fk_materia, texto, avaliacao, fk_usuario_ra, data_avaliacao)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        // fk_curso e fk_materia podem ser nulos dependendo da lógica do seu frontend e schema do BD
        await db.execute(sql, [fk_instituicao, fk_curso || null, fk_materia || null, texto, avaliacao, fk_usuario_ra]);

        res.status(201).json({ success: true, message: "Avaliação submetida com sucesso!" });
    } catch (error) {
        console.error("Erro ao submeter avaliação:", error);
        res.status(500).json({ success: false, message: "Erro ao submeter avaliação." });
    }
};

exports.buscarAvaliacoesPorInstituicao = async (req, res) => {
    const { instituicaoId } = req.params;
    try {
        const sql = `
            SELECT a.pk_id_avaliacao, a.texto, a.avaliacao, a.data_avaliacao,
                   u.nome as nome_usuario, c.pk_curso as curso, m.pk_materia as materia
            FROM avaliacoes a
            LEFT JOIN usuarios u ON a.fk_usuario_ra = u.pk_Ra
            LEFT JOIN cursos c ON a.fk_curso = c.pk_curso
            LEFT JOIN materias m ON a.fk_materia = m.pk_materia
            WHERE a.fk_instituicao = ?
            ORDER BY a.data_avaliacao DESC
        `;
        const [avaliacoes] = await db.execute(sql, [instituicaoId]);
        res.json({ success: true, avaliacoes });
    } catch (error) {
        console.error(`Erro ao buscar avaliações para instituição ${instituicaoId}:`, error);
        res.status(500).json({ success: false, message: "Erro ao buscar avaliações." });
    }
};

exports.buscarAvaliacoesPorUsuario = async (req, res) => {
    const { usuarioId } = req.params;
    try {
        const sql = `
            SELECT a.pk_id_avaliacao, a.texto, a.avaliacao, a.data_avaliacao,
                   a.fk_instituicao as instituicao
            FROM avaliacoes a
            WHERE a.fk_usuario_ra = ?
            ORDER BY a.data_avaliacao DESC
        `;
        const [avaliacoes] = await db.execute(sql, [usuarioId]);
        res.json({ success: true, avaliacoes });
    } catch (error) {
        console.error(`Erro ao buscar avaliações do usuário ${usuarioId}:`, error);
        res.status(500).json({ success: false, message: "Erro ao buscar avaliações do usuário." });
    }
};

exports.buscarTodasAvaliacoes = async (req, res) => {
    if (!req.usuario || !req.usuario.admin) {
        return res.status(403).json({ success: false, message: 'Apenas administradores.' });
    }
    const { instituicao, data, curso, cidade } = req.query;
    let sql = `
        SELECT a.pk_id_avaliacao, a.texto, a.avaliacao, a.data_avaliacao,
               a.fk_instituicao as instituicao, u.nome as nome_usuario, c.pk_curso as curso, i.cidade as cidade
        FROM avaliacoes a
        LEFT JOIN usuarios u ON a.fk_usuario_ra = u.pk_Ra
        LEFT JOIN cursos c ON a.fk_curso = c.pk_curso
        LEFT JOIN instituicoes i ON a.fk_instituicao = i.pk_instituicao
        WHERE 1=1`;
    const params = [];
    if (instituicao) {
        sql += ' AND a.fk_instituicao = ?';
        params.push(instituicao);
    }
    if (data) {
        sql += ' AND DATE(a.data_avaliacao) = ?';
        params.push(data);
    }
    if (curso) {
        sql += ' AND a.fk_curso = ?';
        params.push(curso);
    }
    if (cidade) {
        sql += ' AND i.cidade = ?';
        params.push(cidade);
    }
    sql += ' ORDER BY a.data_avaliacao DESC';
    try {
        const [avaliacoes] = await db.execute(sql, params);
        res.json({ success: true, avaliacoes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar avaliações.' });
    }
};