// backend-nodejs/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.cadastro = async (req, res) => {
    const {
        nome, idade, rg, telefone, email,
        instituicaoNome, cursoNome, cidadeInstituicao, estadoInstituicao,
        periodoCurso, senha
    } = req.body;

    if (!nome || !email || !senha || !instituicaoNome || !cursoNome) {
        return res.status(400).json({ success: false, message: "Campos obrigatórios faltando (nome, email, senha, instituição, curso)." });
    }
    if (senha.length < 8) {
        return res.status(400).json({ success: false, message: "Senha deve ter no mínimo 8 caracteres." });
    }

    const connection = await db.getConnection(); // Obter uma conexão do pool

    try {
        await connection.beginTransaction();

        const [usuariosExistentes] = await connection.execute('SELECT email FROM usuarios WHERE email = ?', [email]);
        if (usuariosExistentes.length > 0) {
            await connection.rollback();
            return res.status(409).json({ success: false, message: "E-mail já cadastrado." });
        }

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        let fk_instituicao = instituicaoNome;
        let fk_curso = cursoNome;

        const [instRows] = await connection.execute('SELECT pk_instituicao FROM instituicoes WHERE pk_instituicao = ?', [instituicaoNome]);
        if (instRows.length === 0) {
            await connection.execute(
                'INSERT INTO instituicoes (pk_instituicao, cidade, estado) VALUES (?, ?, ?)',
                [instituicaoNome, cidadeInstituicao || null, estadoInstituicao || null]
            );
        }

        const [cursoRows] = await connection.execute('SELECT pk_curso FROM cursos WHERE pk_curso = ? AND fk_instituicao = ?', [cursoNome, instituicaoNome]);
        if (cursoRows.length === 0) {
            await connection.execute(
                'INSERT INTO cursos (pk_curso, fk_instituicao) VALUES (?, ?)',
                [cursoNome, instituicaoNome]
            );
        }

        const pk_Ra = `RA_${Date.now()}`; // Exemplo de geração de RA

        const sqlInsertUsuario = `
            INSERT INTO usuarios (pk_Ra, nome, id, email, fk_instituicao, fk_curso, periodo, senha, idade, telefone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(sqlInsertUsuario, [
            pk_Ra, nome, rg || null, email, fk_instituicao, fk_curso,
            periodoCurso || null, senhaHash, idade || null, telefone || null
        ]);

        const isAdmin = email === 'admin@avaliaedu.com';
        if (isAdmin) {
            await connection.execute('UPDATE usuarios SET admin = 1 WHERE pk_Ra = ?', [pk_Ra]);
        }

        await connection.commit();
        console.log(`Simulando envio de email de confirmação para ${email}`);
        res.status(201).json({
            success: true,
            message: "Cadastro realizado com sucesso! Verifique seu e-mail para confirmar sua conta (simulado)."
        });

    } catch (error) {
        await connection.rollback();
        console.error("Erro no controller de cadastro:", error);
        res.status(500).json({ success: false, message: "Erro interno do servidor ao cadastrar." });
    } finally {
        if (connection) connection.release(); // Sempre liberar a conexão de volta para o pool
    }
};

exports.login = async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ success: false, message: "E-mail e senha são obrigatórios." });
    }

    try {
        const [rows] = await db.execute(
            'SELECT pk_Ra, nome, email, fk_instituicao, fk_curso, periodo, senha as senha_hash FROM usuarios WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            if (email === "novo@cadastro.com") { // Para manter a simulação do frontend
                return res.status(401).json({ success: false, message: "Por favor, confirme seu e-mail para fazer login (simulado)." });
            }
            return res.status(404).json({ success: false, message: "E-mail não cadastrado." });
        }

        const usuario = rows[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaCorreta) {
            return res.status(401).json({ success: false, message: "Senha incorreta." });
        }

        const [adminRows] = await db.execute('SELECT admin FROM usuarios WHERE pk_Ra = ?', [usuario.pk_Ra]);
        const isAdminLogin = adminRows.length > 0 && adminRows[0].admin === 1;

        const tokenPayload = { id: usuario.pk_Ra, email: usuario.email, nome: usuario.nome, admin: isAdminLogin };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

        delete usuario.senha_hash;

        res.json({
            success: true,
            message: "Login bem-sucedido!",
            user: { ...usuario, admin: isAdminLogin },
            token: token
        });

    } catch (error) {
        console.error("Erro no controller de login:", error);
        res.status(500).json({ success: false, message: "Erro interno do servidor." });
    }
};

exports.editarPerfil = async (req, res) => {
    const usuarioId = req.usuario.id; // Vem do middleware verificarToken
    const { nome, telefone, senhaAtual, novaSenha } = req.body;
    if (!nome && !telefone && !novaSenha) {
        return res.status(400).json({ success: false, message: "Nenhum dado para atualizar." });
    }
    try {
        // Buscar usuário
        const [rows] = await db.execute('SELECT senha FROM usuarios WHERE pk_Ra = ?', [usuarioId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Usuário não encontrado." });
        }
        // Atualizar nome/telefone
        if (nome || telefone) {
            await db.execute('UPDATE usuarios SET nome = COALESCE(?, nome), telefone = COALESCE(?, telefone) WHERE pk_Ra = ?', [nome, telefone, usuarioId]);
        }
        // Atualizar senha se solicitado
        if (novaSenha) {
            if (!senhaAtual) {
                return res.status(400).json({ success: false, message: "Informe a senha atual para alterar a senha." });
            }
            const senhaCorreta = await bcrypt.compare(senhaAtual, rows[0].senha);
            if (!senhaCorreta) {
                return res.status(401).json({ success: false, message: "Senha atual incorreta." });
            }
            if (novaSenha.length < 8) {
                return res.status(400).json({ success: false, message: "Nova senha deve ter no mínimo 8 caracteres." });
            }
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(novaSenha, salt);
            await db.execute('UPDATE usuarios SET senha = ? WHERE pk_Ra = ?', [senhaHash, usuarioId]);
        }
        res.json({ success: true, message: "Perfil atualizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao editar perfil:", error);
        res.status(500).json({ success: false, message: "Erro ao atualizar perfil." });
    }
};