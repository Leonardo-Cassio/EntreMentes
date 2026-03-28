# EntreMentes 🧠📊

O **EntreMentes** é uma plataforma digital inovadora voltada ao registro e análise de humor de estudantes universitários. Permite que os alunos registrem seu estado emocional diariamente (sono, tempo de tela, exercícios, estresse e humor) e utiliza técnicas de mineração de dados — especificamente o algoritmo não-supervisionado K-Means (K=4) — para identificar padrões e enquadrar o discente em um de quatro perfis comportamentais.

Este projeto é fruto do **Projeto Interdisciplinar (PI) do 6º semestre** do curso de Desenvolvimento de Software Multiplataforma (DSM) da **FATEC**.

---

## 🏗 Arquitetura do Sistema

A solução é distribuída em microserviços e interfaces multiplataforma:

- **Mobile:** React Native (Expo) — App para iOS e Android destinado aos registros do estudante.
- **Web:** React.js (Recharts) — Dashboard Administrativo/Visualização detalhada.
- **Backend (API):** Node.js, Express e PostgreSQL (Prisma ORM) — Responsável pelas conexões, banco de dados, auth e regras de negócio.
- **Mining Service:** Python (Flask, scikit-learn, pandas) — Serviço de Inteligência Artificial que consome dados, treina o K-Means e devolve o agrupamento dos usuários.
- **Mensageria (Event-driven):** Google Cloud Pub/Sub — Responsável por desacoplar o backend (Node.js) do serviço de mineração de dados (Python), realizando processamento assíncrono.

---

## 📡 Mensageria e Fluxo de IA (Google Cloud Pub/Sub)

Para garantir que a API principal continue rápida e não aguarde o processamento custoso de inteligência artificial na requisição HTTP, utilizamos uma arquitetura orientada a eventos. 

O fluxo funciona da seguinte maneira:
1. **O usuário envia o registro de humor:** App Mobile `POST /mood`. O Node.js salva no banco e **publica um evento** no tópico `mood-registered`.
2. **Mineração de Dados Asíncrona:** O Mining Service assina (`subscriber`) esse tópico, recebe os dados, roda o algoritmo **K-Means** e define o cluster do aluno.
3. **Classificação Devolvida:** O Python **publica o resultado** no tópico `profile-classified`.
4. **Atualização no Banco:** O Node.js (que assina esse segundo tópico) intercepta o resultado e atualiza a tabela `BehavioralProfile` silenciosamente. 

Quando o usuário checar seu perfil pelo App ou Web, os dados já estarão processados e salvos.

---

## 🗄️ Modelagem de Dados e Documentação

O projeto conta com uma diagramação de banco de dados pensada para suportar tanto os atributos comportamentais quanto a associação de clusters do modelo não supervisionado.

### Modelo Conceitual
![Modelo Conceitual](./Documentação/BD%20-%20Conceitual.jpeg)

### Modelo Lógico
![Modelo Lógico](./Documentação/BD%20-%20Logico.jpeg)

*(Acesse também a [Documentação em PDF](./Documentação/EntreMentes%20Documentação.pdf) na pasta correspondente).*

---

## 🛠 Tecnologias Utilizadas

### Backend
- **Node.js (v24 LTS)** & **Express 4**
- **Prisma ORM (v5)** para integração e migrações.
- **PostgreSQL 16** (Deploy no Railway / Local via Docker).
- **JWT (jsonwebtoken)** & **bcrypt** (Autenticação).
- **Google Cloud Pub/Sub** (`@google-cloud/pubsub` para mensageria assíncrona).
- **Swagger** (Documentação da API via swagger-jsdoc).

### Data Mining (Inteligência Artificial)
- **Python 3.11** 
- **Flask 3**
- **Google Cloud Pub/Sub** (`google-cloud-pubsub` para assinar eventos e retornar classificação).
- **scikit-learn 1.4**, **pandas 2**, **numpy 1.26** (Mineração, escalonamento e agrupamento).

### Frontend (Mobile e Web)
- **React Native 0.74** / **Expo SDK 51** (Mobile)
- **React 18** e **Recharts 2** (Web)

---

## 📊 Perfis Comportamentais (K-Means)

A Inteligência Artificial divide os estudantes em quatro clusters principais baseados nos dados fornecidos:

| Cluster | Perfil         | Nível de Risco | Resumo das Características                        |
|---------|----------------|----------------|---------------------------------------------------|
| `0`     | **Equilibrado**| Baixo          | Sono regular (~7.5h), exercícios, estresse baixo. |
| `1`     | **Moderado**   | Moderado       | Sono adequado (~6h), níveis médios de pressão.    |
| `2`     | **Sob Pressão**| Moderado-Alto  | Sono curto (~5h), muito tempo de tela (~9h).      |
| `3`     | **Em Alerta**  | Alto           | Sem repouso (~4.5h), exausto, queda em desempenho.|

*(Aviso: O projeto foca na identificação de padrões estatísticos e **não tem** validade diagnóstica psicológica ou médica).*

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (v24+) e npm
- Python (v3.11+) e pip
- Docker e Docker Compose (para o PostgreSQL)

### 1. Iniciar o Banco de Dados
Na raiz do projeto (onde está o `docker-compose.yml`), execute:
```bash
docker-compose up -d
```

### 2. Configurar o Backend
Acesse a pasta `backend`, instale as dependências e rode a API principal:
```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend` seguindo os padrões das suas configurações locais (ex: `DATABASE_URL`, `JWT_SECRET`, `MINING_SERVICE_URL`).

Em seguida, crie a estrutura no banco de dados e inicie o servidor:
```bash
npx prisma migrate dev
npm run dev
```

### 3. Configurar o Mining Service (Python)
Abra outro terminal e acesse a pasta `mining-service` (que será criada conforme o andamento do projeto).
```bash
cd mining-service
pip install -r requirements.txt
flask run --port=5000
```

### 4. Interfaces
Futuramente, conforme as pastas `mobile/` e `web/` ganharem vida, o processo utilizará o `npm start` padrão do React/Expo em cada diretório.

---

## 📚 Endpoints Básicos (Backend API)
A API Node roda em `http://localhost:3000/api`

- **Auth:** `POST /auth/register`, `POST /auth/login`
- **Users:** `GET /users/me`, `PUT /users/me`
- **Mood Tracking:** `POST /mood` (Registrar humor do dia)
- **Analytics:** `GET /analytics/profile`, `POST /analytics/classify` (Dispara requisição ao Flask)

---

## 👥 Equipe
Desenvolvido por 2 integrantes em um prazo estimado de ~3 meses (março a junho de 2026).
- Sprints divididas entre banco de dados/backend, integração de IA, interfaces e testes unitários.
