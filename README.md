# EntreMentes 🧠

O **EntreMentes** é uma plataforma digital voltada ao registro e análise de humor de estudantes universitários. Permite que os alunos registrem seu estado emocional diariamente (sono, tempo de tela, exercícios, estresse e humor) e utiliza técnicas de mineração de dados — especificamente o algoritmo não-supervisionado K-Means (K=4) — para identificar padrões e enquadrar o discente em um de quatro perfis comportamentais.

Projeto Interdisciplinar (PI) do **6º semestre** do curso de Desenvolvimento de Software Multiplataforma (DSM) — **FATEC**.

---

## Arquitetura do Sistema

```
mobile/          → React Native + Expo (Android e iOS)
web/             → React.js + Vite + Recharts (dashboard web)
backend/         → Node.js + Express + Prisma (API REST)
mining-service/  → Python 3.11 + Flask + scikit-learn
```

Todos os serviços se comunicam via HTTP/REST. A classificação de perfil comportamental é processada de forma assíncrona via **Google Cloud Pub/Sub**.

---

## Fluxo de Mensageria (Google Cloud Pub/Sub)

![Fluxo do Sistema](./Documentação/Fluxo-do-Sistema.png)

1. O usuário envia o registro de humor → `POST /mood`. O backend salva no banco e **publica** no tópico `mood-registered`.
2. O Mining Service (Python) **assina** esse tópico, recebe os dados e roda o K-Means.
3. O resultado é **publicado** no tópico `profile-classified`.
4. O backend **assina** esse tópico e atualiza a tabela `BehavioralProfile` silenciosamente.

Quando o usuário consultar seu perfil, os dados já estarão processados.

---

## Modelagem de Dados

### Modelo Conceitual
![Modelo Conceitual](./Documentação/BD%20-%20Conceitual.jpeg)

### Modelo Lógico
![Modelo Lógico](./Documentação/BD%20-%20Logico.jpeg)

---

## Tecnologias

| Camada       | Tecnologia                                                              |
|--------------|-------------------------------------------------------------------------|
| Mobile       | React Native 0.81, Expo SDK 54                                          |
| Web          | React 18, Vite, Recharts 2                                              |
| Backend      | Node.js v24, Express 4, Prisma 5, PostgreSQL 16                         |
| Auth         | JWT (jsonwebtoken), bcrypt                                              |
| Mineração    | Python 3.11, Flask 3, scikit-learn 1.4, pandas 2, numpy 1.26            |
| Mensageria   | Google Cloud Pub/Sub                                                    |
| Docs API     | swagger-jsdoc + swagger-ui-express                                      |

---

## Telas implementadas

### Mobile (React Native)
| Tela               | Status | Descrição                                                                 |
|--------------------|--------|---------------------------------------------------------------------------|
| Login              | ✅     | Fundo com gradiente, card branco centralizado, typewriter "Olá!" em 2s   |
| Cadastro           | ✅     | Mesmo estilo do login, typewriter "Seja bem-vindo!" em 3s                |
| Dashboard          | ✅     | Seletor de humor com modal de confirmação → redireciona para Diário       |
| Registro Diário    | ✅     | Sliders, seleções, barra de progresso, integrado ao `POST /mood`          |
| Histórico          | ✅     | FlatList com cards expansíveis, integrado ao `GET /mood`                  |
| Perfil             | ✅     | Nome, e-mail e botão de logout                                            |
| Humor              | 🔜     | Placeholder — Sprint 3                                                    |

### Web (React)
| Tela               | Status | Descrição                                                                 |
|--------------------|--------|---------------------------------------------------------------------------|
| Login              | ✅     | Split-screen: form esquerda / gradiente direita, typewriter em 2s         |
| Cadastro           | ✅     | Split-screen espelhado: gradiente esquerda / form direita, typewriter 3s  |
| Dashboard          | ✅     | Métricas, gráficos Recharts, modal de humor → redireciona para Diário     |
| Registro Diário    | ✅     | Sliders HTML, seleções, barra de progresso, integrado ao `POST /mood`     |
| Histórico          | ✅     | Cards expansíveis integrados ao `GET /mood`                               |

---

## Perfis Comportamentais (K-Means, K=4)

| Cluster | Perfil          | Risco         | Características                                   |
|---------|-----------------|---------------|---------------------------------------------------|
| 0       | Equilibrado     | Baixo         | Sono ~7.5h, exercício regular, estresse baixo     |
| 1       | Moderado        | Moderado      | Sono ~6h, níveis médios de pressão                |
| 2       | Sob Pressão     | Moderado-Alto | Sono ~5h, tempo de tela ~9h, sem exercício        |
| 3       | Em Alerta       | Alto          | Sono ~4.5h, tela ~10h, queda no desempenho        |

> Este projeto foca na identificação de padrões estatísticos e **não possui** validade diagnóstica psicológica ou médica.

---

## Como Executar Localmente

### Pré-requisitos
- Node.js v24+
- Python 3.11+
- Docker e Docker Compose

### 1. Banco de dados
```bash
docker-compose up -d
```

### 2. Backend
```bash
cd backend
npm install
# Criar .env com DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, GCP_PROJECT_ID
npx prisma db push
node prisma/seed.js   # opcional — popula com dados de teste
npm run dev           # http://localhost:3000
```

### 3. Web
```bash
cd web
npm install
npm run dev           # http://localhost:5173
```

### 4. Mobile
```bash
cd mobile
npm install
npx expo start        # escaneie o QR com Expo Go
```

### 5. Mining Service
```bash
cd mining-service
pip install -r requirements.txt
flask run --port=5000
```

---

## Endpoints da API

Base URL: `http://localhost:3000`

| Método | Rota                    | Auth | Descrição                        |
|--------|-------------------------|------|----------------------------------|
| POST   | /auth/register          | —    | Criar conta                      |
| POST   | /auth/login             | —    | Login, retorna JWT               |
| GET    | /users/me               | JWT  | Dados do usuário autenticado     |
| PUT    | /users/me               | JWT  | Atualizar perfil                 |
| POST   | /mood                   | JWT  | Criar registro de humor          |
| GET    | /mood                   | JWT  | Listar registros do usuário      |
| GET    | /mood/:id               | JWT  | Buscar registro por ID           |
| PUT    | /mood/:id               | JWT  | Atualizar registro               |
| GET    | /analytics/profile      | JWT  | Retorna perfil comportamental    |

---

## Variáveis de Ambiente

### backend/.env
```
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/entrementes"
JWT_SECRET=sua_chave_secreta
JWT_EXPIRES_IN=7d
GCP_PROJECT_ID=entrementes-pi
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
```

### mining-service/.env
```
FLASK_PORT=5000
GCP_PROJECT_ID=entrementes-pi
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
GCP_SUBSCRIPTION_ID=mining-worker
GCP_TOPIC_RESULT=profile-classified
```

---

## Equipe

Desenvolvido por 2 integrantes — março a junho de 2026.

- **Gabriel** — mobile, web, backend, data-analysis, documentação
- **Leonardo** — mobile, web, backend, api.js

---

## Figma

[Acessar protótipo](https://www.figma.com/design/t3bPkPFGW4uXckBCziasEx/EntreMentes?node-id=0-1&p=f&t=cpJM06Qzt1sGj8P5-0)
