// backend-nodejs/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs'); // Importar bcrypt
const db = require('./config/db'); // Importar a conexão com o BD (pool)

const authRoutes = require('./routes/authRoutes');
const instituicaoRoutes = require('./routes/instituicaoRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');

// Definição dos administradores padrão
// !! IMPORTANTE: Troque 'SuaSenhaSuperSegura123!' por senhas fortes e únicas !!
// Considere gerar os hashes offline e colocar os hashes aqui para maior segurança em produção.
const predefinedAdmins = [
    {
        email: 'orbolato.guilherme@gmail.com',
        senhaPlana: 'Eumesmo1993',
        nome: 'Administrador Secundário',
    },
    // Adicione outros administradores se necessário:
    // {
    //   email: 'outro.admin@avaliaedu.com',
    //   senhaPlana: 'OutraSenhaForte456!', // TROCAR ESTA SENHA
    //   nome: 'Administrador Primario',
    // }
];

/**
 * Garante que os administradores predefinidos existam no banco de dados.
 * Se um administrador não existir, ele será criado com a senha hasheada.
 * Se já existir, garante que a flag 'admin' esteja definida como 1.
 */
async function ensureAdminsExist() {
    let connection; // Definir connection fora do try para que esteja acessível no finally
    try {
        connection = await db.getConnection(); // Obter uma conexão do pool
        console.log('Verificando/Criando administradores padrão...');

        for (const adminData of predefinedAdmins) {
            const [existingUsers] = await connection.execute('SELECT pk_Ra, admin FROM usuarios WHERE email = ?', [adminData.email]);

            if (existingUsers.length === 0) {
                console.log(`Cadastrando administrador padrão: ${adminData.email}`);
                const salt = await bcrypt.genSalt(10);
                const senhaHash = await bcrypt.hash(adminData.senhaPlana, salt);
                // Geração de um pk_Ra único para o admin. Pode ser um UUID ou outro formato.
                const pk_Ra = `ADMIN_RA_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

                // Adapte os campos e valores NULL/padrão conforme o schema da sua tabela usuarios.
                // Se sua tabela não permite NULL para certos campos, você precisará fornecer valores dummy
                // ou ajustar o schema para usuários administradores que podem não ter todos os campos de um aluno.
                const sqlInsertUsuario = `
                    INSERT INTO usuarios (pk_Ra, nome, email, senha, admin, idade, telefone, fk_instituicao, fk_curso, periodo, email_verificado)
                    VALUES (?, ?, ?, ?, 1, NULL, NULL, NULL, NULL, NULL, 1)
                `; // email_verificado como 1 para admins
                await connection.execute(sqlInsertUsuario, [
                    pk_Ra,
                    adminData.nome,
                    adminData.email,
                    senhaHash
                ]);
                console.log(`Administrador ${adminData.email} cadastrado com sucesso com pk_Ra: ${pk_Ra}.`);
            } else {
                // Se o usuário já existe, apenas garante que ele é admin
                const existingAdmin = existingUsers[0];
                if (existingAdmin.admin !== 1) {
                    await connection.execute('UPDATE usuarios SET admin = 1 WHERE pk_Ra = ?', [existingAdmin.pk_Ra]);
                    console.log(`Usuário ${adminData.email} (pk_Ra: ${existingAdmin.pk_Ra}) atualizado para administrador.`);
                } else {
                    console.log(`Administrador ${adminData.email} (pk_Ra: ${existingAdmin.pk_Ra}) já existe e é admin.`);
                }
            }
        }
        console.log('Verificação/Criação de administradores padrão concluída.');
    } catch (error) {
        console.error('Erro ao garantir administradores padrão no banco de dados:', error);
        // Considere lançar o erro ou tratar de forma mais específica se o seeding for crítico para o startup
    } finally {
        if (connection) {
            connection.release(); // Liberar a conexão de volta para o pool
        }
    }
}


const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
    origin: 'http://localhost:3000', // Permite requisições do seu frontend React
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // Se você usar cookies/sessões com CORS
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/instituicoes', instituicaoRoutes);
app.use('/api/avaliacoes', avaliacaoRoutes);
app.use('/api/relatorios', relatorioRoutes);


app.get('/', (req, res) => {
    res.send('API AvaliaEdu com Node.js está funcionando!');
});

// Middleware para tratamento de erros genérico (opcional, mas bom para produção)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ success: false, message: 'Algo deu errado no servidor!' });
});

// Função para iniciar o servidor e fazer o seeding dos admins
async function startServer() {
    try {
        // Garante que a conexão com o banco está ok antes de tentar criar admins
        const connection = await db.getConnection();
        console.log('Conexão com o banco de dados estabelecida com sucesso para setup inicial.');
        connection.release();

        await ensureAdminsExist(); // Garante que os admins predefinidos existam ou sejam criados

        app.listen(PORT, () => {
            console.log(`Servidor backend Node.js rodando em http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Falha crítica ao conectar ao banco de dados ou ao fazer seeding de admins. Servidor não iniciado.', err);
        process.exit(1); // Encerra o processo se não conseguir preparar o ambiente
    }
}

startServer(); // Chama a função para iniciar o servidor
