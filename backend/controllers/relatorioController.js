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

// --- Funções de Configuração de Reavaliação Atualizadas ---

/**
 * Busca a configuração do intervalo de reavaliação do banco de dados.
 * Se não existir, cria com um valor padrão (6 meses).
 */
exports.getConfigReavaliacao = async (req, res) => {
    const chaveConfig = 'intervaloReavaliacaoMeses';
    const valorPadrao = 6; // Padrão de 6 meses
    const descricaoPadrao = 'Intervalo em meses para permitir nova avaliação da mesma instituição pelo mesmo usuário.';

    try {
        const [rows] = await db.execute("SELECT valor FROM configuracoes WHERE chave = ?", [chaveConfig]);
        if (rows.length > 0) {
            res.json({ success: true, meses: parseInt(rows[0].valor, 10) });
        } else {
            // Se a configuração não existir, insere o valor padrão
            await db.execute(
                "INSERT INTO configuracoes (chave, valor, descricao) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE valor = valor", // ON DUPLICATE KEY UPDATE valor=valor para evitar erro se houver corrida e já tiver sido inserido
                [chaveConfig, String(valorPadrao), descricaoPadrao]
            );
            console.log(`Configuração '${chaveConfig}' não encontrada, valor padrão de ${valorPadrao} meses foi definido no banco.`);
            res.json({ success: true, meses: valorPadrao });
        }
    } catch (error) {
        console.error("Erro ao buscar configuração de reavaliação:", error);
        res.status(500).json({ success: false, message: "Erro ao buscar configuração de reavaliação." });
    }
};

/**
 * Define/Atualiza a configuração do intervalo de reavaliação no banco de dados.
 * Apenas administradores podem realizar esta ação.
 */
exports.setConfigReavaliacao = async (req, res) => {
    // Verifica se o usuário é admin (vem do middleware verificarToken)
    if (!req.usuario || !req.usuario.admin) {
        return res.status(403).json({ success: false, message: 'Acesso negado. Apenas administradores podem alterar esta configuração.' });
    }

    const { meses } = req.body;
    const chaveConfig = 'intervaloReavaliacaoMeses';
    const descricaoPadrao = 'Intervalo em meses para permitir nova avaliação da mesma instituição pelo mesmo usuário.';

    if (meses === undefined || isNaN(meses) || Number(meses) < 1) {
        return res.status(400).json({ success: false, message: 'Valor para "meses" é inválido. Deve ser um número maior ou igual a 1.' });
    }

    const valorMeses = String(Number(meses));

    try {
        // UPSERT: Atualiza se a chave existir, insere se não existir.
        const sql = `
            INSERT INTO configuracoes (chave, valor, descricao)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE valor = ?, ultima_modificacao = CURRENT_TIMESTAMP;
        `;
        await db.execute(sql, [chaveConfig, valorMeses, descricaoPadrao, valorMeses]);

        console.log(`Configuração '${chaveConfig}' atualizada para ${valorMeses} meses por admin: ${req.usuario.email}`);
        res.json({ success: true, meses: Number(valorMeses), message: 'Configuração do intervalo de reavaliação atualizada com sucesso!' });
    } catch (error) {
        console.error("Erro ao salvar configuração de reavaliação:", error);
        res.status(500).json({ success: false, message: 'Erro interno ao salvar configuração de reavaliação.' });
    }
};
