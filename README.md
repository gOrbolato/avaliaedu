# AvaliaEdu

## Descrição
O AvaliaEdu é uma plataforma web colaborativa para avaliação de instituições de ensino, cursos e experiências acadêmicas. Permite que alunos avaliem, reavaliem e consultem informações sobre instituições, enquanto administradores têm acesso a relatórios, gráficos e exportação de dados para análise educacional.

## Tecnologias Utilizadas
- **Frontend:** ReactJS (com Tailwind CSS)
- **Backend:** Node.js + Express
- **Banco de Dados:** MySQL
- **Autenticação:** JWT (JSON Web Token)
- **Gráficos:** Recharts
- **Outros:** Fetch API, Context API, JWT, CSV export

## Funcionalidades
- Cadastro e login de usuários (com confirmação de e-mail)
- Edição de perfil (nome, telefone, senha)
- Avaliação e reavaliação de instituições (intervalo configurável pelo admin)
- Listagem e busca de instituições e cursos
- Visualização de avaliações e médias
- Painel do usuário com histórico de avaliações
- Painel administrativo com:
  - Gráficos dinâmicos (distribuição de notas, porcentagem por instituição, médias)
  - Relatórios dinâmicos com filtros (instituição, curso, cidade, data)
  - Exportação de dados em CSV
  - Configuração do intervalo de reavaliação
  - Controle de acesso restrito a administradores

## Como rodar o sistema

### 1. Pré-requisitos
- Node.js (v18+ recomendado)
- MySQL

### 2. Configuração do Banco de Dados
- Crie um banco de dados MySQL chamado `avaliaedu`.
- Importe o schema/tabelas conforme necessário (não incluso neste README, mas pode ser gerado a partir dos controllers).
- Configure o arquivo `.env` em `backend/` com as credenciais do seu MySQL:
  ```env
  DB_HOST=localhost
  DB_USER=seu_usuario
  DB_PASSWORD=sua_senha
  DB_NAME=avaliaedu
  JWT_SECRET=suaChaveJWT
  PORT=3001
  ```

### 3. Backend
```sh
cd backend
npm install
npm start
```
O backend estará disponível em http://localhost:3001

### 4. Frontend
```sh
cd frontend
npm install
npm start
```
O frontend estará disponível em http://localhost:3000

### 5. Usuário Administrador
- O primeiro usuário cadastrado com o e-mail `admin@avaliaedu.com` será administrador.
- Apenas administradores têm acesso ao painel admin e exportação de dados.

## Observações
- O intervalo de reavaliação pode ser configurado pelo admin no painel administrativo.
- O sistema permite reavaliação apenas após o intervalo definido (bimestral, trimestral, semestral, anual ou personalizado).
- O backend pode ser facilmente adaptado para outros bancos relacionais.
- Para produção, recomenda-se configurar variáveis de ambiente e HTTPS.

## Melhorias Futuras
- Upload de fotos/perfil
- Moderação de avaliações
- Notificações por e-mail reais
- Dashboard de desempenho para instituições
- API pública para consulta de médias

## Exemplo de uso da API

### Autenticação
- **POST /api/auth/login**
  ```json
  {
    "email": "usuario@exemplo.com",
    "senha": "SuaSenha123"
  }
  ```
- **POST /api/auth/cadastro**
  ```json
  {
    "nome": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "senha": "SuaSenha123",
    "instituicaoNome": "Minha Faculdade",
    "cursoNome": "Engenharia",
    ...
  }
  ```

### Avaliações
- **GET /api/avaliacoes/usuario/:ra** — Lista avaliações do usuário
- **POST /api/avaliacoes** — Envia nova avaliação (autenticado)
  ```json
  {
    "fk_instituicao": "Minha Faculdade",
    "texto": "Ótima estrutura!",
    "avaliacao": 5
  }
  ```

### Relatórios/Admin
- **GET /api/relatorios/media-avaliacoes-instituicao** — Dados para gráficos
- **GET /api/relatorios/avaliacoes/download-csv** — Exporta CSV (admin)

## Exemplo de criação do banco de dados (MySQL)
```sql
CREATE DATABASE IF NOT EXISTS avaliaedu;
USE avaliaedu;

CREATE TABLE IF NOT EXISTS instituicoes (
  pk_instituicao VARCHAR(100) PRIMARY KEY,
  cidade VARCHAR(100),
  estado VARCHAR(2)
);

CREATE TABLE IF NOT EXISTS cursos (
  pk_curso VARCHAR(100) PRIMARY KEY,
  fk_instituicao VARCHAR(100),
  FOREIGN KEY (fk_instituicao) REFERENCES instituicoes(pk_instituicao)
);

CREATE TABLE IF NOT EXISTS usuarios (
  pk_Ra VARCHAR(100) PRIMARY KEY,
  nome VARCHAR(100),
  id VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  fk_instituicao VARCHAR(100),
  fk_curso VARCHAR(100),
  periodo VARCHAR(20),
  senha VARCHAR(255),
  idade INT,
  telefone VARCHAR(20),
  admin TINYINT(1) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS avaliacoes (
  pk_id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
  fk_instituicao VARCHAR(100),
  fk_curso VARCHAR(100),
  fk_materia VARCHAR(100),
  texto TEXT,
  avaliacao INT,
  fk_usuario_ra VARCHAR(100),
  data_avaliacao DATETIME,
  FOREIGN KEY (fk_instituicao) REFERENCES instituicoes(pk_instituicao),
  FOREIGN KEY (fk_curso) REFERENCES cursos(pk_curso),
  FOREIGN KEY (fk_usuario_ra) REFERENCES usuarios(pk_Ra)
);
```

---

Desenvolvido por [Sua Equipe].
