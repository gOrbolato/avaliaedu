// backend-nodejs/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const instituicaoRoutes = require('./routes/instituicaoRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
// Importe o pool de conexão para garantir que ele seja inicializado
require('./config/db');


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

app.listen(PORT, () => {
    console.log(`Servidor backend Node.js rodando em http://localhost:${PORT}`);
});