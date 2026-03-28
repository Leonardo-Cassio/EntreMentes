# ⚙️ Backend API | EntreMentes

Bem-vindo(a) ao repositório do backend do projeto **EntreMentes**. Esta é uma API RESTful construída com Node.js, Express e Prisma ORM.

Ela atua como o núcleo principal da plataforma, sendo responsável pelo gerenciamento de usuários, sistema de autenticação, recebimento de registros diários de saúde mental e atuando como ponte (via mensageria Pub/Sub) com o serviço de Inteligência Artificial responsável por classificar os perfis comportamentais.

---

## 🛠 Tecnologias e Bibliotecas

- **Node.js**: Ambiente de execução (Runtime).
- **Express**: Framework minimalista para criação das rotas HTTP.
- **Prisma ORM**: Modelagem do banco de dados e migrações tipadas.
- **PostgreSQL**: Banco de dados relacional (instanciado via Docker).
- **JWT (JSON Web Token)**: Controle de acesso (stateless) para API.
- **Bcrypt**: Criptografia segura das senhas antes da gravação no banco.
- **Docker Compose**: Orquestração rápida da infraestrutura de dados.
- **Google Cloud Pub/Sub** *(Em implementação)*: Mensageria orientada a eventos para integração com o Python.

---

## 📂 Estrutura de Diretórios

A arquitetura do projeto segue uma divisão em camadas bem definida para separar responsabilidades (Rotas → Controladores → Regras de Negócio):

```text
backend/
├── docker-compose.yml     # Serviços Docker (PostgreSQL)
├── prisma/                
│   ├── schema.prisma      # Modelagem atual do banco de dados (Inglês)
│   └── migrations/        # Histórico de alterações do BD (Automático pelo Prisma)
├── src/
│   ├── server.js          # Ponto de entrada (Entrypoint) da aplicação API
│   ├── controllers/       # Lidam com as requisições (Req) e respostas (Res) HTTP
│   ├── services/          # Realizam lógicas de negócio e as querys via Prisma
│   ├── routes/            # Definição e mapeamento de todos os endpoints REST
│   └── middleware/        # Interceptadores (ex: Validação de Token JWT)
└── package.json           # Dependências e scripts npm
```

*Nota em transição: O backend ainda se encontra com alguns domínios com nomes antigos (ex: `humorController.js`), mas está passando por uma refatoração progressiva para o padrão em inglês (ex: `moodController.js`), conforme definido na arquitetura do PI.*

---

## ⚙️ Variáveis de Ambiente (`.env`)

Para executar este projeto, você precisa criar um arquivo `.env` na raiz da pasta `backend` contendo:

```env
# Porta de execução do servidor Node
PORT=3000

# String de Conexão Oficial (User Postgres, Port 5432)
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/entrementes"

# Segurança
JWT_SECRET="insira-sua-chave-super-secreta-aqui"

# Google Cloud
# GCP_PROJECT_ID="entrementes-pi"
# GOOGLE_APPLICATION_CREDENTIALS="./gcp-credentials.json"
```

---

## 🚀 Como Executar

**1. Subir o Banco de Dados (Docker)**
Certifique-se de estar com o Docker rodando e inicialize o serviço do Postgres:
```bash
docker-compose up -d
```

**2. Instalar as Dependências do Node**
```bash
npm install
```

**3. Criar / Atualizar a Estrutura do Banco de Dados**
Isso criará as tabelas oficiais (`User`, `WellbeingMoodEntry`, etc) baseadas no arquivo `schema.prisma`.
```bash
npx prisma migrate dev
```

**4. Executar o Servidor**
(O modo dev monitora mudanças em tempo real via Nodemon).
```bash
npm run dev
```

O terminal indicará `Rodando na porta 3000`.

---

## 📡 Endpoints Base (Em construção)

- **http://localhost:3000/auth** : Autenticação (`login` / `register`).
- **http://localhost:3000/users** : Gerenciamento e listagem de alunos.
- **http://localhost:3000/humor** : *(Em breve `mood`)* Registros das métricas diárias, repassadas para o Pub/Sub.

---

## 🔜 Próximos Passos (To-Do Sprint 1)

- [ ] Ajustar e padronizar todas as respostas HTTP em formato JSON padrão: `{ success, data, message }`.
- [ ] Refatorar os arquios nomeados em português (`humor`) para o padrão universal (`mood`).
- [ ] Implementar a validação de rotas com a biblioteca `express-validator`.
- [ ] Implementação de Documentação oficial interativa com **Swagger**.
- [ ] Acoplar os Publishers e Subscribers do **GCP Pub/Sub**.