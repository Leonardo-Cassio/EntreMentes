# EntreMentes — GitHub Copilot Instructions

## ⚠️ Instrução de continuidade (OBRIGATÓRIO)

**Antes de encerrar qualquer sessão de chat, o assistente DEVE atualizar este arquivo**
refletindo o estado atual do projeto. Isso garante que o próximo chatbot consiga
retomar exatamente de onde o anterior parou.

### O que atualizar ao final de cada sessão:
1. **Seção "Estado atual do desenvolvimento"** (abaixo) — marcar o que foi concluído,
   o que ficou pendente e quais decisões foram tomadas.
2. **Qualquer mudança arquitetural** — novos arquivos, renomeações, dependências
   adicionadas ou removidas.
3. **Bugs conhecidos ou débitos técnicos** identificados durante a sessão.

### Estado atual do desenvolvimento

> **Última atualização:** 2026-04-22
>
> ---
>
> ### Sprint 1 — Fundação ✅ CONCLUÍDA
>
> **Backend + Banco de Dados**
> - [x] Schema Prisma com todos os models (User, Humor, RegistroBemEstar, DefinicaoCluster, PerfilComportamental, SequenciaHumor)
> - [x] Docker Compose para PostgreSQL
> - [x] Auth básica (register/login) com JWT + bcrypt
> - [x] CRUD completo de RegistroBemEstar — POST, GET lista, GET por id, PUT, DELETE
> - [x] CRUD de Users autenticado (GET /users/me, PUT /users/me, DELETE /users/me)
> - [x] Prisma singleton centralizado em src/lib/prisma.js
> - [x] Respostas HTTP padronizadas { success, data, message }
> - [x] Middleware de auth usando JWT_SECRET do .env (suporta formato Bearer)
> - [x] CORS habilitado no server.js
>
> **Frontend Mobile (React Native + Expo)**
> - [x] Projeto Expo inicializado em mobile/ (SDK 54, React Native 0.81)
> - [x] Tema centralizado: src/theme/colors.js + fonts.js
> - [x] Componentes reutilizáveis: Input.js + Button.js
> - [x] Tela de Login (LoginScreen.js)
> - [x] Tela de Cadastro (RegisterScreen.js)
> - [x] AuthStack (Stack Navigator) configurado
>
> **Frontend Web (React + Vite)**
> - [x] Projeto React + Vite inicializado em web/
> - [x] Estilos globais + layout split-screen auth
> - [x] Componentes: Input.jsx + Button.jsx
> - [x] Tela Login (LoginPage.jsx)
> - [x] Tela Cadastro (RegisterPage.jsx)
> - [x] Rotas configuradas (/login, /register) com redirect padrão
>
> ---
>
> ### Sprint 2 — Versão Intermediária 🚧 EM ANDAMENTO (prazo: 24/04/2026)
> Objetivo: versão intermediária com integrações parciais.
>
> **1. Back-end com endpoints básicos da API (CRUD)** ✅
> - [x] CRUD de RegistroBemEstar (POST, GET, GET/:id, PUT, DELETE)
> - [x] Auth (register, login) com JWT + bcrypt
> - [x] CRUD de usuário autenticado (GET/PUT/DELETE /users/me)
>
> **2. Front-end integrado parcialmente ao back-end** ✅
> - [x] AuthContext criado (web: localStorage | mobile: AsyncStorage)
> - [x] Proteção de rotas web (RotaProtegida / RotaPublica no App.jsx)
> - [x] Navegação mobile controlada pelo AuthContext (AuthStack ↔ AppTabs)
> - [x] Login web salva token e redireciona para /dashboard automaticamente
> - [x] Cadastro web e mobile chama API real via serviço centralizado (api.js)
> - [x] Dashboard web criado com dados estáticos (gráficos Recharts)
> - [x] Dashboard mobile criado com dados estáticos (gráficos SVG nativos)
> - [x] Bottom navigation mobile com 5 abas (Dashboard, Diário, Humor, Histórico, Perfil)
> - [x] Login mobile corrigido: usa api.js + chama auth.login() → navega para AppTabs automaticamente
> - [x] Tela Registro Diário mobile criada (RegistroDiarioScreen.js) — sliders, emojis, barra de progresso, validação
>
> **3. Banco de dados implementado e populado com dados de teste** ✅
> - [x] Schema Prisma com todos os models
> - [x] dados_tratados.json gerado (1800 registros, formato Prisma)
> - [x] Script de seed criado (backend/prisma/seed.js)
> - [x] Migrations aplicadas via `prisma db push` (migrations antigas estavam desatualizadas)
> - [x] Seed executado com sucesso: 10 usuários + 1800 registros no banco
>
> **4. Commits ativos de todos os integrantes no GitHub**
> - [ ] Garantir commits de ambos os integrantes em todos os módulos
>
> **5. Computação em Nuvem II: ambiente em nuvem criado**
> - [ ] Criar projeto no Google Cloud Platform (GCP)
> - [ ] Criar tópicos Pub/Sub: mood-registered e profile-classified
> - [ ] Criar service account + gcp-credentials.json (no .gitignore)
> - [ ] Documentar prints da configuração inicial
>
> **6. Mineração de Dados: coleta/tratamento + técnica inicial**
> - [x] Dataset coletado (1800 registros — Student Mental Health)
> - [x] Pré-processamento: EDA, limpeza, mapeamento de features, normalização MinMax
> - [x] features_kmeans.csv exportado (6 features normalizadas, pronto para K-Means)
> - [x] Aplicar K-Means (K=4) no features_kmeans.csv — 4 perfis identificados
> - [x] Salvar modelo treinado (modelo_kmeans.pkl — 8.4 KB, joblib)
> - [x] Gráficos gerados: cotovelo, silhouette, PCA 2D, radar, heatmap centroides
>
> **7. Documentação intermediária atualizada**
> - [ ] Atualizar documentação com evidências (prints das telas, trechos de código, prints do GCP)
> - [x] copilot-instructions.md atualizado com estado real do projeto
> - [ ] Atualizar este arquivo (copilot-instructions) ao final de cada sessão
>
> ---
>
> ### Sprint 3 — Finalização (Pendente)
> - [ ] Mining Service Python (Flask + scikit-learn) em mining-service/
> - [ ] Pub/Sub consumer (mood-registered) e publisher (profile-classified)
> - [ ] Endpoint GET /analytics/profile no backend
> - [ ] Dashboard (Desktop-3 Figma) com gráficos Recharts
> - [ ] Telas pós-login mobile (Dashboard, Registro Diário)
> - [ ] Testes unitários e de integração
> - [ ] Deploy Railway (backend + PostgreSQL)

---

### Arquivos criados/modificados nesta sessão
```
--- BACKEND ---
backend/src/lib/prisma.js                  ← Prisma singleton
backend/src/server.js                      ← CORS + rotas /mood /users /auth
backend/src/middleware/authMiddleware.js   ← Bearer token + JWT_SECRET do .env
backend/src/services/authService.js        ← register/login, sem expor senha
backend/src/services/userService.js        ← getById, update, remove
backend/src/services/moodService.js        ← CRUD RegistroBemEstar
backend/src/controllers/authController.js  ← Formato { success, data, message }
backend/src/controllers/userController.js  ← GET/PUT/DELETE /me
backend/src/controllers/moodController.js  ← CRUD completo
backend/src/routes/userRoutes.js           ← /me com auth
backend/src/routes/moodRoutes.js           ← 5 endpoints
backend/prisma/seed.js                     ← NOVO: seed com 10 usuários + 1800 registros
backend/package.json                       ← ATUALIZADO: script "seed" adicionado

--- DATA ANALYSIS ---
data-analysis/preprocessing.py            ← Pré-processamento documentado
data-analysis/dados_tratados.json         ← 1800 registros formato Prisma
data-analysis/features_kmeans.csv         ← 6 features normalizadas para K-Means
data-analysis/graficos/                   ← 5 PNGs (EDA + validação)

--- MOBILE ---
mobile/App.js                             ← ATUALIZADO: AuthProvider + Navegacao dinâmica
mobile/src/context/AuthContext.js         ← NOVO: AuthContext com AsyncStorage
mobile/src/services/api.js               ← NOVO: API centralizada (auto-detecta IP)
mobile/src/navigation/AuthStack.js        ← Stack Navigator (Login/Register)
mobile/src/navigation/AppTabs.js          ← NOVO: Bottom tabs (5 abas)
mobile/src/screens/LoginScreen.js         ← Tela Login mobile
mobile/src/screens/RegisterScreen.js      ← ATUALIZADO: usa api.js
mobile/src/screens/DashboardScreen.js     ← NOVO: Dashboard com gráficos SVG
mobile/src/theme/colors.js + fonts.js     ← Paleta e tipografia
mobile/src/components/Input.js            ← Input com SVG icon
mobile/src/components/Button.js           ← Botão com loading

--- WEB ---
web/src/App.jsx                           ← ATUALIZADO: AuthProvider + RotaProtegida/RotaPublica
web/src/context/AuthContext.jsx           ← NOVO: AuthContext com localStorage
web/src/services/api.js                  ← NOVO: API centralizada
web/src/pages/LoginPage.jsx              ← ATUALIZADO: chama auth.login(), redireciona
web/src/pages/RegisterPage.jsx           ← ATUALIZADO: usa api.js
web/src/pages/DashboardPage.jsx          ← NOVO: Dashboard com Recharts
web/src/pages/DashboardPage.css          ← NOVO: Estilos do Dashboard
web/src/components/Input.jsx + .css       ← Input web
web/src/components/Button.jsx + .css      ← Button web
web/src/assets/CadeadoIcon.jsx            ← SVG cadeado (JSX)
web/src/assets/EmailIcon.jsx              ← SVG email (JSX)
```

### Pendências para próxima sessão
- K-Means: rodar clustering no features_kmeans.csv e salvar modelo_kmeans.pkl (item 6 Sprint 2)
- GCP: criar projeto, tópicos Pub/Sub e documentar (item 5 Sprint 2)
- Dashboard web/mobile: conectar aos dados reais do banco (hoje usa mock estático)
- Registro Diário web/mobile: conectar handleSalvar() à API real (POST /mood)
- Documentação: capturar prints de evidências para entrega

---

### Pendências conhecidas
- Imagem das pedras zen (Login desktop): usar URL Unsplash por ora; substituir por arquivo local quando disponível
- Schema Prisma ainda usa nomes em português (RegistroBemEstar, etc.) — manter assim, é a versão canônica
- Discrepância entre schema Prisma do copilot-instructions (inglês) e o schema real do projeto (português) — o schema REAL está em backend/prisma/schema.prisma e usa português

---


## Link FIGMA do projeto:

 https://www.figma.com/design/t3bPkPFGW4uXckBCziasEx/EntreMentes?node-id=0-1&p=f&t=cpJM06Qzt1sGj8P5-0

 Utilizar sempre para observar a identidade visual, todas as telas não precisam seguir a risca o design proposto do figma, é até recomendado que haja melhorias e adaptações, mas a identidade visual deve ser mantida.

## Visão geral do projeto

EntreMentes é uma plataforma de registro e análise de humor de estudantes universitários.
Projeto Interdisciplinar (PI) do 6º semestre — FATEC DSM.
Desenvolvido por 2 integrantes em ~3 meses (março a junho de 2026).

O sistema coleta registros emocionais diários e aplica mineração de dados (K-Means, K=4)
para classificar o estudante em um de 4 perfis comportamentais.

---

## Arquitetura do sistema

```
mobile/          → React Native + Expo (Android e iOS)
web/             → React.js + Recharts (dashboard)
backend/         → Node.js + Express + Prisma (API REST)
mining-service/  → Python 3.11 + Flask + scikit-learn
docs/            → Documentação do PI por sprint
```

Todos os serviços se comunicam via HTTP/REST e Google Cloud Pub/Sub.
Deploy em Railway (free tier). Banco PostgreSQL hospedado no Railway.

---

## Stack e versões

| Camada     | Tecnologia                                               |
|------------|----------------------------------------------------------|
| Mobile     | React Native 0.74, Expo SDK 51                           |
| Web        | React 18, Recharts 2                                     |
| Backend    | Node.js v24 LTS, Express 4, Prisma 5                     |
| Banco      | PostgreSQL 16                                            |
| Mineração  | Python 3.11, Flask 3, scikit-learn 1.4, pandas 2, numpy 1.26 |
| Mensageria | Google Cloud Pub/Sub (@google-cloud/pubsub, google-cloud-pubsub) |
| Auth       | JWT (jsonwebtoken), bcrypt                               |
| Docs API   | swagger-jsdoc + swagger-ui-express                       |

---

## Mensageria — Google Cloud Pub/Sub

O Pub/Sub é o serviço de nuvem central do projeto. Ele desacopla o backend Node.js
do serviço de mineração Python. A classificação de perfil ocorre de forma assíncrona
toda vez que um novo registro de humor é salvo.

### Fluxo

```
App Mobile
  └─► POST /mood ─► API Backend ─► salva no PostgreSQL
                              └─► publica em: mood-registered
                                        │
                                   [Google Cloud Pub/Sub]
                                        │
                              sub: mining-worker
                                        │
                              Serviço Python
                              └─► classifica com K-Means
                              └─► publica em: profile-classified
                                        │
                                   [Google Cloud Pub/Sub]
                                        │
                              sub: profile-classified-backend
                                        │
                              API Backend
                              └─► atualiza behavioral_profiles
                              └─► perfil disponível para o usuário
```

### Tópicos

| Tópico                 | Publisher | Subscriber      |
|------------------------|-----------|-----------------|
| `mood-registered`      | Node.js   | Python (mining) |
| `profile-classified`   | Python    | Node.js         |

### Formato — mood-registered
```json
{
  "userId": "uuid",
  "entryId": "uuid",
  "moodLevel": 3,
  "screenTime": 8.5,
  "sleepDuration": 5.0,
  "physicalActivity": 1.0,
  "stressLevel": "Alto",
  "anxiousBeforeExams": true,
  "academicPerformance": "Mesmo",
  "timestamp": "2026-03-27T22:00:00Z"
}
```

### Formato — profile-classified
```json
{
  "userId": "uuid",
  "clusterId": 2,
  "profileName": "Sob Pressão",
  "riskLevel": "Moderado-Alto",
  "insights": ["Sono abaixo da média", "Atividade física muito baixa"],
  "recommendations": ["Durma mais", "Faça exercício", "Reduza tempo de tela"],
  "processedAt": "2026-03-27T22:00:05Z"
}
```

### Implementação Node.js
```javascript
// backend/src/services/pubsub.service.js
const { PubSub } = require('@google-cloud/pubsub');
const pubsub = new PubSub({ projectId: process.env.GCP_PROJECT_ID });

async function publishMoodRegistered(data) {
  const topic = pubsub.topic('mood-registered');
  await topic.publishMessage({ data: Buffer.from(JSON.stringify(data)) });
}

async function subscribeProfileClassified() {
  const sub = pubsub.subscription('profile-classified-backend');
  sub.on('message', async (message) => {
    const data = JSON.parse(message.data.toString());
    await updateUserProfile(data); // atualiza behavioral_profiles
    message.ack();
  });
}

module.exports = { publishMoodRegistered, subscribeProfileClassified };
```

### Implementação Python
```python
# mining-service/pubsub_consumer.py
from google.cloud import pubsub_v1
import json, os

subscriber = pubsub_v1.SubscriberClient()
publisher  = pubsub_v1.PublisherClient()

sub_path    = subscriber.subscription_path(os.environ['GCP_PROJECT_ID'], 'mining-worker')
topic_path  = publisher.topic_path(os.environ['GCP_PROJECT_ID'], 'profile-classified')

def callback(message):
    data   = json.loads(message.data.decode('utf-8'))
    result = classify_user(data)  # chama classifier.py
    publisher.publish(topic_path, json.dumps(result).encode('utf-8'))
    message.ack()

subscriber.subscribe(sub_path, callback=callback)
```

---

## Banco de dados — schema Prisma

```prisma
model User {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  passwordHash  String
  course        String?
  semester      Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  moodEntries       WellbeingMoodEntry[]
  behavioralProfile BehavioralProfile?
  moodStreak        MoodStreak?
}

model WellbeingMoodEntry {
  id                   String   @id @default(uuid())
  userId               String
  moodLevel            Int
  note                 String?
  screenTime           Float
  sleepDuration        Float
  physicalActivity     Float
  stressLevel          String
  anxiousBeforeExams   Boolean
  academicPerformance  String
  createdAt            DateTime @default(now())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ClusterDefinition {
  id              Int      @id @default(autoincrement())
  clusterLabel    Int      @unique
  profileName     String
  description     String
  centroidData    Json
  characteristics Json
  studentCount    Int      @default(0)
  generatedAt     DateTime @default(now())
  profiles BehavioralProfile[]
}

model BehavioralProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  clusterId   Int
  riskLevel   String
  insights    Json
  generatedAt DateTime @default(now())
  user    User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  cluster ClusterDefinition @relation(fields: [clusterId], references: [id])
}

model MoodStreak {
  id             String    @id @default(uuid())
  userId         String    @unique
  currentStreak  Int       @default(0)
  longestStreak  Int       @default(0)
  lastEntryDate  DateTime?
  updatedAt      DateTime  @updatedAt
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Endpoints da API REST

Base URL: `http://localhost:3000/api`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`

### Users
- `GET /users/me`
- `PUT /users/me`
- `DELETE /users/me`

### Mood
- `POST /mood` — salva registro e publica no Pub/Sub automaticamente
- `GET /mood` — histórico (?from=&to=&limit=)
- `GET /mood/:id`
- `PUT /mood/:id`

### Analytics
- `GET /analytics/summary`
- `GET /analytics/profile` — retorna perfil classificado via Pub/Sub

### Mining Service (Flask — porta 5000)
- `GET /health`
- `GET /clusters`

> A classificação não é chamada via HTTP. É acionada automaticamente
> pelo Pub/Sub quando um novo registro é publicado no tópico mood-registered.

---

## Os 4 perfis comportamentais (K-Means K=4)

| Cluster | Nome         | Risco         | Características                              |
|---------|--------------|---------------|----------------------------------------------|
| 0       | Equilibrado  | Baixo         | Sono ~7.5h, exercício ~5h/sem, estresse baixo |
| 1       | Moderado     | Moderado      | Sono ~6h, exercício ~3h/sem, estresse médio  |
| 2       | Sob Pressão  | Moderado-Alto | Sono ~5h, tela ~9h, sem exercício, estresse alto |
| 3       | Em Alerta    | Alto          | Sono ~4.5h, tela ~10h, desempenho caindo     |

---

## Variáveis de ambiente

### backend/.env
```
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/entrementes"
JWT_SECRET=troque_esta_chave_por_algo_seguro
JWT_EXPIRES_IN=7d
GCP_PROJECT_ID=entrementes-pi
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
```

### mining-service/.env
```
FLASK_ENV=development
FLASK_PORT=5000
GCP_PROJECT_ID=entrementes-pi
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
GCP_SUBSCRIPTION_ID=mining-worker
GCP_TOPIC_RESULT=profile-classified
```

---

## Regras importantes

- NUNCA commitar .env com dados reais
- NUNCA commitar gcp-credentials.json — está no .gitignore
- NUNCA retornar passwordHash em resposta da API
- NUNCA fazer diagnóstico psicológico
- Sempre incluir disclaimer: "Este resultado não substitui acompanhamento profissional"
- Commits descritivos em português
- Ambos os integrantes devem ter commits em todos os módulos

---

## Estrutura de pastas

```
backend/
  src/
    routes/       auth, mood, users, analytics
    controllers/
    services/     auth.service.js, mood.service.js, pubsub.service.js
    middlewares/  auth.middleware.js, validate.middleware.js
    swagger/
  prisma/
  gcp-credentials.json  ← no .gitignore
  .env / server.js

mining-service/
  app.py
  kmeans.py / classifier.py
  pubsub_consumer.py
  data/ / models/
  gcp-credentials.json  ← no .gitignore
  requirements.txt / .env

mobile/
  src/screens/ components/ services/ navigation/

web/
  src/pages/ components/ services/ context/
```
