// backend-nodejs/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testa a conexão
pool.getConnection()
    .then(connection => {
        console.log('Conectado ao banco de dados MySQL com sucesso!');
        connection.release();
    })
    .catch(err => {
        console.error('Erro ao conectar ao banco de dados MySQL:', err);
        // Em uma aplicação real, você pode querer encerrar o processo ou tentar reconectar.
    });

// ATENÇÃO: Certifique-se de que a tabela 'usuarios' tem o campo 'admin' (TINYINT(1) DEFAULT 0)
// Exemplo SQL:
// ALTER TABLE usuarios ADD COLUMN admin TINYINT(1) DEFAULT 0;

module.exports = pool;