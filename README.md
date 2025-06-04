# AvaliaEdu

## Descrição
O AvaliaEdu é uma plataforma web colaborativa para avaliação de instituições de ensino, cursos e experiências acadêmicas. Permite que alunos avaliem, reavaliem e consultem informações sobre instituições, enquanto administradores têm acesso a relatórios, gráficos e exportação de dados para análise educacional.

## Tecnologias Utilizadas
- **Frontend:** ReactJS (com CSS Modules e CSS puro/global)
- **Backend:** Node.js + Express
- **Banco de Dados:** MySQL
- **Autenticação:** JWT (JSON Web Token)
- **Gráficos:** Recharts
- **Ícones:** react-icons
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
- **Padronização visual:**
  - Todas as telas principais utilizam CSS Modules para estilos modernos, responsivos e sem conflitos
  - Não há mais dependência de TailwindCSS: todo o visual é feito com CSS puro (Modules e index.css)
  - Uso de react-icons para ícones padronizados e modernos
  - Animações, efeitos de hover, popups animados e responsividade aprimorada
- **Segurança:**
  - Middleware de autenticação JWT
  - Middleware de verificação de admin para rotas sensíveis (`verificarAdmin`)
  - Proteção de rotas de exportação e configuração

## Como rodar o sistema

### 1. Pré-requisitos
- Node.js (v18+ recomendado)
- MySQL

### 2. Configuração do Banco de Dados
- Crie um banco de dados MySQL chamado `avaliaedu`.
- Importe o schema/tabelas conforme necessário (veja exemplo abaixo).
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
# Recomendado: instalar bibliotecas extras para segurança e praticidade
npm install cors helmet morgan express-rate-limit
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

## Principais Alterações Recentes
- **Frontend agora 100% CSS puro:**
  - Todas as classes utilitárias do Tailwind foram removidas do JSX
  - Todos os arquivos `.module.css` usam apenas CSS tradicional, sem `@apply` ou diretivas do Tailwind
  - O visual e responsividade são garantidos por CSS Modules e pelo arquivo `index.css` global
- Padronização visual de todas as telas com CSS Modules
- Uso de react-icons para ícones modernos
- Animações, popups e responsividade aprimorada
- Middleware `verificarAdmin` para rotas sensíveis (ex: configuração de reavaliação)
- Proteção de rotas de exportação e configuração com autenticação e permissão de admin
- Sugestão de uso de bibliotecas como `cors`, `helmet`, `morgan` e `express-rate-limit` para maior segurança

## Estrutura de Pastas
```
backend/
  controllers/
  middlewares/
  routes/
  config/
  server.js
frontend/
  src/
    components/
    pages/
    App.js
    index.js
```

## Observações
- O envio de e-mail de confirmação é simulado no backend.
- O admin é identificado automaticamente pelo e-mail `admin@avaliaedu.com` no cadastro.
- Para customizações visuais, edite os arquivos `.module.css` em cada tela ou componente, ou o arquivo `src/index.css` para estilos globais.
- Para adicionar novas funcionalidades (ex: comentários, notificações), crie novos controllers, rotas e middlewares conforme necessário.

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
