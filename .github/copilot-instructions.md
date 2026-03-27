# EntreMentes — GitHub Copilot Instructions

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

Todos os serviços rodam separadamente e se comunicam via HTTP/REST.
Deploy em Railway (free tier). Banco PostgreSQL hospedado no Railway.

---

## Stack e versões

| Camada        | Tecnologia                        |
|---------------|-----------------------------------|
| Mobile        | React Native 0.74, Expo SDK 51    |
| Web           | React 18, Recharts 2              |
| Backend       | Node.js v24 LTS, Express 4, Prisma 5 |
| Banco         | PostgreSQL 16                     |
| Mineração     | Python 3.11, Flask 3, scikit-learn 1.4, pandas 2, numpy 1.26 |
| Auth          | JWT (jsonwebtoken), bcrypt        |
| Docs API      | swagger-jsdoc + swagger-ui-express |

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
  moodLevel            Int      // 1 a 5
  note                 String?
  screenTime           Float    // horas/dia (0-24)
  sleepDuration        Float    // horas (0-16)
  physicalActivity     Float    // horas/semana (0-40)
  stressLevel          String   // "Baixo" | "Médio" | "Alto"
  anxiousBeforeExams   Boolean
  academicPerformance  String   // "Melhorou" | "Mesmo" | "Piorou"
  createdAt            DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ClusterDefinition {
  id             Int      @id @default(autoincrement())
  clusterLabel   Int      @unique  // 0, 1, 2, 3
  profileName    String   // "Equilibrado" | "Moderado" | "Sob Pressão" | "Em Alerta"
  description    String
  centroidData   Json
  characteristics Json
  studentCount   Int      @default(0)
  generatedAt    DateTime @default(now())

  profiles BehavioralProfile[]
}

model BehavioralProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  clusterId   Int
  riskLevel   String   // "Baixo" | "Moderado" | "Alto"
  insights    Json
  generatedAt DateTime @default(now())

  user    User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  cluster ClusterDefinition @relation(fields: [clusterId], references: [id])
}

model MoodStreak {
  id             String   @id @default(uuid())
  userId         String   @unique
  currentStreak  Int      @default(0)
  longestStreak  Int      @default(0)
  lastEntryDate  DateTime?
  updatedAt      DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Endpoints da API REST

Base URL: `http://localhost:3000/api`

### Auth
- `POST /auth/register` — cadastro (name, email, password, course, semester)
- `POST /auth/login` — login → retorna JWT
- `POST /auth/logout` — invalida token

### Users
- `GET /users/me` — perfil do usuário autenticado
- `PUT /users/me` — atualiza perfil
- `DELETE /users/me` — exclui conta

### Mood
- `POST /mood` — registra humor do dia
- `GET /mood` — histórico (query: ?from=&to=&limit=)
- `GET /mood/:id` — registro específico
- `PUT /mood/:id` — atualiza registro do dia

### Analytics
- `GET /analytics/summary` — média, distribuição, correlações
- `GET /analytics/profile` — perfil comportamental do usuário
- `POST /analytics/classify` — aciona classificação no serviço Python

### Mining Service (Flask — porta 5000)
- `POST /classify` — recebe dados do usuário, retorna perfil + insights
- `POST /train` — re-treina K-Means com dados atualizados
- `GET /clusters` — retorna definições dos 4 clusters

---

## Os 4 perfis comportamentais (K-Means K=4)

| Cluster | Nome         | Risco         | Características                                      |
|---------|--------------|---------------|------------------------------------------------------|
| 0       | Equilibrado  | Baixo         | Sono ~7.5h, exercício ~5h/sem, estresse baixo        |
| 1       | Moderado     | Moderado      | Sono ~6h, exercício ~3h/sem, estresse médio          |
| 2       | Sob Pressão  | Moderado-Alto | Sono ~5h, tela ~9h, sem exercício, estresse alto     |
| 3       | Em Alerta    | Alto          | Sono ~4.5h, tela ~10h, sem exercício, desempenho caindo |

Variáveis usadas no K-Means (6):
- screenTime, sleepDuration, physicalActivity
- stressLevel (0/1/2), anxiousBeforeExams (0/1), academicPerformance (0/1/2)

---

## Convenções de código

### Geral
- Idioma do código: inglês (variáveis, funções, comentários)
- Idioma das mensagens ao usuário: português
- Sem comentários óbvios — apenas comentários que explicam o "porquê", não o "o quê"
- Sempre usar async/await, nunca callbacks ou .then() encadeados
- Variáveis de ambiente sempre via process.env — nunca hardcoded

### Backend (Node.js)
- Controllers finos: lógica de negócio fica em services/
- Sempre validar input com express-validator antes de chegar no controller
- Respostas padronizadas: { success: true/false, data: {}, message: "" }
- Erros com status HTTP correto: 400 validação, 401 auth, 403 permissão, 404 não encontrado, 500 servidor
- Middleware de auth em todas as rotas protegidas
- Documentar cada endpoint com JSDoc para o swagger-jsdoc gerar automaticamente

### Python (Flask)
- Carregar modelo K-Means treinado via joblib no startup da aplicação
- Normalizar inputs antes de classificar (StandardScaler salvo junto com o modelo)
- Retornar sempre JSON com: { cluster, profileName, riskLevel, insights, recommendations }
- Usar flask-cors para aceitar requisições do backend Node

### React Native
- Sempre usar StyleSheet.create() — sem estilos inline
- Axios para chamadas à API — instância configurada em services/api.js
- AsyncStorage para guardar o JWT localmente
- Navegação com React Navigation (stack + bottom tabs)

### React Web
- Recharts para todos os gráficos
- Axios com instância configurada em services/api.js
- Context API para estado global do usuário autenticado

---

## Variáveis de ambiente

### backend/.env
```
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/entrementes"
JWT_SECRET=troque_esta_chave_por_algo_seguro
JWT_EXPIRES_IN=7d
MINING_SERVICE_URL=http://localhost:5000
```

### mining-service/.env
```
FLASK_ENV=development
FLASK_PORT=5000
NODE_API_URL=http://localhost:3000
```

---

## Regras importantes

- NUNCA commitar arquivos .env com dados reais
- NUNCA retornar passwordHash em nenhuma resposta da API
- NUNCA fazer diagnóstico psicológico — o sistema apenas identifica padrões
- Sempre incluir disclaimer nos insights: "Este resultado não substitui acompanhamento profissional"
- Commits em português, descritivos: "feat: adiciona endpoint de registro de humor"
- Ambos os integrantes devem ter commits em todos os módulos

---

## Estrutura de pastas esperada

```
backend/
  src/
    routes/         auth.routes.js, mood.routes.js, users.routes.js, analytics.routes.js
    controllers/    auth.controller.js, mood.controller.js, ...
    services/       auth.service.js, mood.service.js, mining.service.js, ...
    middlewares/    auth.middleware.js, validate.middleware.js
    swagger/        swagger.config.js
  prisma/
    schema.prisma
    migrations/
  .env
  server.js

mining-service/
  app.py
  kmeans.py          treino e re-treino do modelo
  classifier.py      classificação de usuário individual
  data/              dataset universitário CSV
  models/            modelo_kmeans.joblib, scaler.joblib
  requirements.txt
  .env

mobile/
  src/
    screens/         LoginScreen, RegisterScreen, HomeScreen, HistoryScreen, ProfileScreen
    components/      MoodPicker, MoodCard, StreakBadge, ...
    services/        api.js
    navigation/      AppNavigator.js
  app.json
  App.js

web/
  src/
    pages/           Dashboard, Login, Profile
    components/      MoodChart, WeeklyChart, ProfileCard, ...
    services/        api.js
    context/         AuthContext.js
  public/
  package.json
```
