# EntreMentes — GitHub Copilot Instructions

## ⚠️ Instrução de continuidade (OBRIGATÓRIO)

**Antes de encerrar qualquer sessão de chat, o assistente DEVE atualizar este arquivo**
refletindo o estado atual do projeto. Isso garante que o próximo chatbot consiga
retomar exatamente de onde o anterior parou.

### O que atualizar ao final de cada sessão:
1. **Seção "Estado atual do desenvolvimento"** — marcar o que foi concluído, pendente e decisões tomadas.
2. **Seção "Arquivos modificados"** — registrar todos os arquivos criados ou alterados.
3. **Seção "Pendências"** — atualizar o que fica para a próxima sessão.
4. **Qualquer decisão de design ou arquitetura** relevante para continuidade.

---

## Estado atual do desenvolvimento

> **Última atualização:** 2026-05-12
> **Sprint 2 apresentada com sucesso — sem objeções dos professores ✅**

---

### Sprint 1 — Fundação ✅ CONCLUÍDA

**Backend**
- [x] Schema Prisma com todos os models em português (ver seção Schema abaixo)
- [x] Docker Compose para PostgreSQL local
- [x] Auth completa: register/login com JWT + bcrypt
- [x] CRUD completo de RegistroBemEstar (POST, GET, GET/:id, PUT, DELETE) na rota `/mood`
- [x] CRUD de usuário autenticado (GET/PUT/DELETE `/users/me`)
- [x] Prisma singleton em `src/lib/prisma.js`
- [x] Respostas padronizadas `{ success, data, message }`
- [x] Middleware de auth com JWT Bearer
- [x] CORS habilitado

**Mobile (React Native + Expo SDK 54)**
- [x] Estrutura Expo inicializada com New Architecture habilitada
- [x] Tema centralizado: `src/theme/colors.js` + `fonts.js`
- [x] Componentes: `Input.js`, `Button.js`
- [x] `LoginScreen.js` e `RegisterScreen.js`
- [x] `AuthStack` (Stack Navigator)

**Web (React + Vite)**
- [x] Projeto React + Vite inicializado
- [x] Componentes: `Input.jsx`, `Button.jsx`
- [x] `LoginPage.jsx` e `RegisterPage.jsx`
- [x] Rotas com redirect automático via `RotaProtegida` / `RotaPublica`

---

### Sprint 2 — Versão Intermediária ✅ CONCLUÍDA E APROVADA (apresentada em 12/05/2026)

**1. Backend com CRUD completo** ✅
- [x] Todos os endpoints funcionando e testados

**2. Frontend integrado ao backend** ✅
- [x] AuthContext (web: localStorage | mobile: AsyncStorage)
- [x] Login/Cadastro web e mobile consumindo API real
- [x] Dashboard web (gráficos Recharts, dados mock por ora)
- [x] Dashboard mobile (dados mock, seletor de humor funcional)
- [x] Bottom navigation mobile: 5 abas (Dashboard, Diário, Humor, Histórico, Perfil)
- [x] Registro Diário web e mobile integrado ao `POST /mood`
- [x] Histórico web e mobile integrado ao `GET /mood`

**3. Banco populado com dados de teste** ✅
- [x] `dados_tratados.json` com 1.800 registros gerado pelo preprocessing.py
- [x] Script de seed (`backend/prisma/seed.js`) executado com sucesso
- [x] 10 usuários + 1.800 registros no banco

**4. Commits de todos os integrantes** ✅
- [x] Gabriel: mobile, web, data-analysis, backend, docs
- [x] Leonardo: HistoricoScreen (mobile), HistoricoPage (web), authService fix, api.js

**5. Computação em Nuvem — Pub/Sub** ⏳ PENDENTE
- [ ] Professor ainda não liberou acesso ao GCP Console
- [ ] Criar projeto `entrementes-pi`, tópicos `mood-registered` e `profile-classified`
- [ ] Service account + `gcp-credentials.json`
- Toda a arquitetura está planejada e documentada (ver seção Pub/Sub abaixo)

**6. Mineração de Dados** ✅
- [x] Dataset: *Student Mental Health & Academic Performance* — Kaggle, 1.800 registros
- [x] `preprocessing.py`: EDA, limpeza, mapeamento PHQ-9→humor, normalização MinMaxScaler
- [x] `kmeans_clustering.py`: K-Means K=4, validação cotovelo + silhouette (0.123)
- [x] `modelo_kmeans.pkl` gerado (8.4 KB, joblib)
- [x] 9 gráficos gerados em `data-analysis/graficos/`
- [x] `data-analysis/README.md` com documentação completa do pipeline

**7. Documentação** ✅
- [x] `Documentação/EntreMentes_Sprint2_Doc.md` (Notion-ready, 17 placeholders de prints)
- [x] `data-analysis/README.md` com todos os gráficos e justificativas
- [x] `README.md` raiz atualizado com tabela de telas e endpoints

---

### Sprint 3 — Finalização 🚧 EM ANDAMENTO

- [ ] Mining Service Python (Flask) — `/classify` endpoint carregando `modelo_kmeans.pkl`
- [ ] Pub/Sub: publisher no backend (após `POST /mood`) + subscriber no mining-service
- [ ] Endpoint `GET /analytics/profile` no backend (busca perfil classificado)
- [ ] Conectar Dashboard (web e mobile) aos dados reais do banco
- [ ] Conectar modal "Seu Perfil" ao `GET /analytics/profile` real (hoje usa mock)
- [ ] Deploy Railway (backend + PostgreSQL)
- [ ] Tela Humor mobile (hoje é placeholder — pode usar o modal de perfil)
- [ ] Testes unitários e de integração

---

## Histórico de sessões

### Sessão 22/04/2026
```
mobile/src/screens/RegistroDiarioScreen.js  ← NOVO: sliders, emojis, barra progresso
mobile/src/navigation/AppTabs.js            ← aba "Diário" → RegistroDiarioScreen
mobile/package.json                         ← @react-native-community/slider adicionado
data-analysis/kmeans_clustering.py          ← NOVO: K-Means K=4, validação, pkl
data-analysis/modelo_kmeans.pkl             ← NOVO: modelo serializado
data-analysis/graficos/06–09               ← NOVOS: cotovelo, PCA, radar, distribuição
```

### Sessão 24/04/2026 — manhã
```
backend/src/services/authService.js         ← CORRIGIDO: expiresIn fixo → JWT_EXPIRES_IN do .env
web/src/services/api.js                     ← CORRIGIDO: ...options sobrescrevia Content-Type
web/src/pages/RegistroDiarioPage.jsx        ← handleSalvar() integrado ao POST /mood
web/src/pages/HistoricoPage.jsx             ← NOVO: cards expansíveis + GET /mood
web/src/App.jsx                             ← rota /historico adicionada
mobile/src/services/api.js                  ← mesma correção + createRegistro/listRegistros
mobile/src/screens/RegistroDiarioScreen.js  ← handleSalvar() integrado ao POST /mood
mobile/src/screens/HistoricoScreen.js       ← NOVO: FlatList + cards expansíveis + GET /mood
mobile/src/navigation/AppTabs.js            ← aba Histórico real; aba Perfil com logout
```

### Sessão 24/04/2026 — tarde
```
Documentação/EntreMentes_Sprint2_Doc.md     ← NOVO: doc Sprint 2 completa, Notion-ready
mobile/app.json                             ← NSAppTransportSecurity (iOS HTTP)
mobile/src/services/api.js                  ← timeout 8s + fallback IP tunnel
```

### Sessão 24/04/2026 — noite (redesign auth)
```
web/src/pages/LoginPage.jsx                 ← REDESENHADO: split-screen, typewriter "Olá!" 2s
web/src/pages/RegisterPage.jsx              ← REDESENHADO: espelhado, typewriter "Seja bem-vindo!" 3s
web/src/App.css                             ← auth styles reescritos, animações slide
web/src/components/Button.css               ← variante .btn-dark (preto, pill)
mobile/src/screens/LoginScreen.js           ← REDESENHADO: LinearGradient + card branco
mobile/src/screens/RegisterScreen.js        ← REDESENHADO: mesmo estilo, typewriter 3s
mobile/App.js                               ← animação fade+scale na troca AuthStack↔AppTabs
```

### Sessão 12/05/2026 (atual)
```
--- WEB ---
web/src/pages/DashboardPage.jsx             ← emoji humor → Modal confirmação → /registro
                                               card "Seu Perfil" clicável → modal perfil completo
                                               (gradiente header, dados, insights, recomendações)
web/src/pages/DashboardPage.css             ← estilos modal humor + modal perfil
web/src/pages/RegistroDiarioPage.jsx        ← useLocation lê state.nivelHumorInicial do Dashboard
web/src/assets/Circulo amarelo.png          ← NOVO: imagem usada no modal de perfil

--- MOBILE ---
mobile/src/screens/DashboardScreen.js       ← emoji humor → Modal nativo → navigate("Diário", params)
mobile/src/screens/RegistroDiarioScreen.js  ← lê route.params.nivelHumorInicial, pré-preenche humor

--- DATA ANALYSIS ---
data-analysis/README.md                     ← NOVO: documentação completa do pipeline com gráficos

--- DOCS ---
README.md                                   ← atualizado com tabela de telas e endpoints reais
```

---

## Pendências para próxima sessão

1. **GCP / Pub/Sub** — aguardando professor liberar acesso ao Console. Quando liberado:
   - Criar projeto `entrementes-pi`
   - Criar tópicos: `mood-registered`, `profile-classified`
   - Criar subscriptions: `mining-worker`, `profile-classified-backend`
   - Criar service account, baixar `gcp-credentials.json`

2. **Mining Service Flask** — criar `mining-service/app.py` com endpoint `/classify` que carrega `modelo_kmeans.pkl` e classifica novos registros

3. **Endpoint `GET /analytics/profile`** — backend Node.js busca perfil do usuário em `BehavioralProfile` e retorna com insights e recomendações

4. **Modal "Seu Perfil" web** — trocar constante `PERFIL` mock por chamada real ao `GET /analytics/profile`

5. **Dashboard web/mobile** — conectar gráficos de evolução ao `GET /mood` real (atualmente usa arrays estáticos)

6. **Tela Humor mobile** — hoje é placeholder. Pode receber o mesmo modal de perfil do web.

7. **Deploy Railway** — backend + PostgreSQL em produção

---

## Decisões de design importantes (não óbvias)

### Identidade visual — Auth pages
- **Gradiente padrão:** `linear-gradient(135deg, #7B2FBE 0%, #4A90D9 60%, #6C5CE7 100%)`
- Web Login: form à **esquerda** (52%), gradiente à **direita**
- Web Cadastro: gradiente à **esquerda**, form à **direita** — layout espelhado via JSX order (sem `flex-direction: row-reverse`)
- Mobile: `LinearGradient` do `expo-linear-gradient` (já instalado), card branco centralizado com `borderRadius: 14`
- Animação de entrada: `Animated.timing` no mobile (fade + translateY), CSS keyframes no web (`authSlideIn` / `authSlideInReversed`)

### Typewriter animation
- Implementada via `setInterval` em JavaScript, **não** via CSS `steps()` — mais confiável com fontes proporcionais (Inter)
- Login: "Olá!" em 2 segundos | Cadastro: "Seja bem-vindo!" em 3 segundos
- Cursor `|` pisca via `Animated.loop` (mobile) ou CSS `cursorBlink` (web), desaparece ao terminar

### Fluxo Dashboard → Registro Diário (humor pré-selecionado)
- **Mobile:** `navigation.navigate('Diário', { nivelHumorInicial: nivel })` → `RegistroDiarioScreen` lê via `route.params` no `useFocusEffect`. Após ler, chama `navigation.setParams({ nivelHumorInicial: undefined })` para não persistir.
- **Web:** `navigate('/registro', { state: { nivelHumorInicial: nivel } })` → `RegistroDiarioPage` lê via `useLocation().state` no `useState` inicial. State do React Router não persiste no reload — comportamento correto.

### Modal de Perfil Comportamental (web)
- Ativado pelo card "Seu Perfil" no Dashboard
- Header com gradiente idêntico ao da auth (`#7B2FBE → #4A90D9`)
- Imagem `Circulo amarelo.png` (em `web/src/assets/`) substituiu o emoji 🟡
- Dados mock na constante `PERFIL` em `DashboardPage.jsx` — shape exato do que `GET /analytics/profile` vai retornar. Quando o endpoint ficar pronto, basta substituir por `useState` + `useEffect`
- Estrutura do mock: `{ nome, emoji, risco, corRisco, bgRisco, justificativa, dados[], insights[], recomendacoes[] }`

### Outliers mantidos no pré-processamento
- Decisão consciente: valores extremos (3h de sono, 12h de tela) são dados reais de estudantes sob pressão
- Removê-los eliminaria os perfis "Sob Pressão" e "Em Alerta" que o K-Means precisa detectar

### K=4 para o K-Means
- Método do cotovelo indica inflexão em K=4
- Silhouette score K=4: **0.123** (modesto, esperado para dados comportamentais com sobreposição natural)
- K=2 tem silhouette maior (0.180) mas gera apenas 2 perfis — insuficiente para o app

### Bug histórico corrigido (24/04) — api.js
- O `request()` original usava `...options` que sobrescrevia o header `Content-Type: application/json`
- Express recebia o body sem Content-Type e não parseava → todos os campos chegavam `undefined`
- Correção: desestruturar `{ method, headers, body }` explicitamente em vez de espalhar `options`

---

## Link Figma

https://www.figma.com/design/t3bPkPFGW4uXckBCziasEx/EntreMentes?node-id=0-1&p=f&t=cpJM06Qzt1sGj8P5-0

Utilizar para referência de identidade visual. As telas **não precisam seguir o Figma à risca** — melhorias e adaptações são bem-vindas, mas a paleta de cores e tipografia devem ser mantidas.

---

## Visão geral do projeto

**EntreMentes** é uma plataforma de registro e análise de humor de estudantes universitários.
Projeto Interdisciplinar (PI) do 6º semestre — FATEC DSM.
Desenvolvido por **Gabriel Fillip** e **Leonardo Cássio** — março a junho de 2026.

O sistema coleta registros emocionais diários (humor, sono, tela, exercício, estresse, desempenho) e aplica K-Means (K=4) para classificar o estudante em um de 4 perfis comportamentais, disponibilizando insights e recomendações personalizadas.

---

## Arquitetura do sistema

```
mobile/          → React Native 0.81 + Expo SDK 54 (Android e iOS)
web/             → React 18 + Vite + Recharts 2 (dashboard web)
backend/         → Node.js v24 + Express 4 + Prisma 5 (API REST)
mining-service/  → Python 3.11 + Flask 3 + scikit-learn (classificação IA)
data-analysis/   → Scripts de pré-processamento e treinamento do modelo
```

Comunicação entre serviços: HTTP/REST para operações síncronas + Google Cloud Pub/Sub para classificação assíncrona.

---

## Stack e versões (reais, verificadas)

| Camada      | Tecnologia                                                          |
|-------------|---------------------------------------------------------------------|
| Mobile      | React Native 0.81, Expo SDK 54, New Architecture habilitada         |
| Web         | React 18, Vite, Recharts 2, React Router DOM v6                     |
| Backend     | Node.js v24 LTS, Express 4, Prisma 5, PostgreSQL 16                 |
| Auth        | jsonwebtoken, bcrypt                                                |
| Mineração   | Python 3.11, Flask 3, scikit-learn 1.4, pandas 2, numpy 1.26, joblib|
| Mensageria  | Google Cloud Pub/Sub (planejado — acesso GCP pendente)              |
| Expo libs   | expo-linear-gradient ~15.0.8, expo-font ~14.0.11                    |
| Mobile libs | @react-native-community/slider, @react-navigation/bottom-tabs       |

---

## Telas implementadas

### Web

| Tela | Rota | Status | Detalhes |
|------|------|--------|----------|
| Login | `/login` | ✅ | Split-screen: form esquerda / gradiente direita. Typewriter "Olá!" 2s. Botão dark pill. |
| Cadastro | `/register` | ✅ | Espelhado: gradiente esquerda / form direita. Typewriter "Seja bem-vindo!" 3s. |
| Dashboard | `/dashboard` | ✅ | Métricas mock, gráficos Recharts, seletor humor com modal, card perfil clicável com modal detalhado |
| Registro Diário | `/registro` | ✅ | Sliders, seleções, barra progresso, POST /mood. Recebe nivelHumorInicial via Router state. |
| Histórico | `/historico` | ✅ | Cards expansíveis, GET /mood integrado |

### Mobile

| Tela | Aba | Status | Detalhes |
|------|-----|--------|----------|
| Login | — | ✅ | LinearGradient fundo, card branco centralizado, typewriter 2s, slide-up ao montar |
| Cadastro | — | ✅ | Mesmo estilo login, typewriter 3s, 4 campos |
| Dashboard | Dashboard | ✅ | Métricas mock, seletor humor com Modal nativo, navega para Diário com param |
| Registro Diário | Diário | ✅ | Sliders, emojis, progresso, POST /mood. Recebe nivelHumorInicial via route.params. |
| Histórico | Histórico | ✅ | FlatList, cards expansíveis, GET /mood integrado |
| Perfil | Perfil | ✅ | Nome, email, botão logout |
| Humor | Humor | 🔜 | Placeholder — Sprint 3 (candidato a exibir modal de perfil IA) |

---

## Fluxo UX: Dashboard → Registro Diário (humor pré-selecionado)

```
Usuário clica emoji no Dashboard
         ↓
Modal de confirmação aparece
"Registrar como 'Bom'? Quer completar o registro?"
         ↓
    [Sim]          [Agora não]
      ↓                ↓
Navega para         Fecha modal,
Registro Diário     humor fica
com humor           selecionado
pré-preenchido      no Dashboard
```

**Web:** `navigate('/registro', { state: { nivelHumorInicial } })`
**Mobile:** `navigation.navigate('Diário', { nivelHumorInicial })`

---

## Fluxo UX: Modal de Perfil Comportamental

```
Card "Seu Perfil" no Dashboard (web)
         ↓
Modal abre com:
  - Header gradiente + círculo amarelo + nome do perfil
  - Badge de risco (cor dinâmica)
  - Justificativa em texto
  - 3 pills: sono médio / tempo tela / atividade física (valor + referência ideal)
  - Insights (pontos de atenção, fundo laranja)
  - Recomendações (fundo azul)
  - Disclaimer "não substitui acompanhamento profissional"
         ↓
Dados: hoje mock (constante PERFIL em DashboardPage.jsx)
Futuramente: GET /analytics/profile
```

---

## Mensageria — Google Cloud Pub/Sub

**Status atual: planejado. Código ainda não implementado. Acesso GCP pendente.**

### Fluxo
```
POST /mood (usuário salva registro)
      ↓
Node.js salva no PostgreSQL → responde 200 para o usuário
      ↓
Node.js publica mensagem em: mood-registered
      ↓
      [Google Cloud Pub/Sub]
      ↓ subscription: mining-worker
Python (mining-service) recebe
      ↓
Carrega modelo_kmeans.pkl → classifica cluster
      ↓
Publica resultado em: profile-classified
      ↓
      [Google Cloud Pub/Sub]
      ↓ subscription: profile-classified-backend
Node.js recebe → atualiza BehavioralProfile no banco
      ↓
GET /analytics/profile disponível para o usuário
```

### Tópicos e subscriptions

| Tópico | Publisher | Subscription | Subscriber |
|--------|-----------|--------------|------------|
| `mood-registered` | Node.js | `mining-worker` | Python |
| `profile-classified` | Python | `profile-classified-backend` | Node.js |

### Mensagem mood-registered
```json
{
  "userId": "uuid",
  "entryId": "uuid",
  "nivelHumor": 3,
  "tempoTela": 8.5,
  "duracaoSono": 5.0,
  "atividadeFisica": 1.0,
  "nivelEstresse": "Alto",
  "ansiedadeAntesProva": true,
  "desempenhoAcademico": "Mesmo",
  "timestamp": "2026-05-12T22:00:00Z"
}
```

### Mensagem profile-classified
```json
{
  "userId": "uuid",
  "clusterId": 0,
  "profileName": "Sob Pressão",
  "riskLevel": "Moderado-Alto",
  "insights": ["Sono abaixo da média", "Atividade física muito baixa"],
  "recomendacoes": ["Reduza tempo de tela 1h antes de dormir", "30min de caminhada"],
  "processedAt": "2026-05-12T22:00:05Z"
}
```

---

## Banco de dados — Schema Prisma real (em português)

> ⚠️ O schema REAL usa nomes em português. Ignorar qualquer schema em inglês que apareça em versões antigas deste documento.

```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  registros        RegistroBemEstar[]
  perfilComport    PerfilComportamental?
}

model RegistroBemEstar {
  id                   String   @id @default(uuid())
  userId               String
  nivelHumor           Int      // 1–5
  nota                 String?
  tempoTela            Float    // horas/dia
  duracaoSono          Float    // horas/noite
  atividadeFisica      Float    // horas/semana
  nivelEstresse        String   // "Baixo" | "Medio" | "Alto"
  ansiedadeAntesProva  Boolean
  desempenhoAcademico  String   // "Melhorou" | "Mesmo" | "Piorou"
  createdAt            DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PerfilComportamental {
  id          String   @id @default(uuid())
  userId      String   @unique
  clusterId   Int      // 0–3
  nomePerfil  String
  nivelRisco  String
  insights    Json
  geradoEm   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

> Nota: o schema completo com todos os models está em `backend/prisma/schema.prisma`. O acima é uma versão simplificada dos models principais.

---

## Endpoints da API REST

Base URL (local): `http://localhost:3000`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/auth/register` | — | Criar conta |
| POST | `/auth/login` | — | Login, retorna JWT |
| GET | `/users/me` | JWT | Dados do usuário |
| PUT | `/users/me` | JWT | Atualizar perfil |
| DELETE | `/users/me` | JWT | Deletar conta |
| POST | `/mood` | JWT | Criar registro de humor |
| GET | `/mood` | JWT | Listar registros do usuário |
| GET | `/mood/:id` | JWT | Buscar registro por ID |
| PUT | `/mood/:id` | JWT | Atualizar registro |
| GET | `/analytics/profile` | JWT | Perfil comportamental classificado (Sprint 3) |

---

## Os 4 perfis comportamentais (K-Means K=4)

> Valores reais dos centroides obtidos no treinamento com 1.800 estudantes.

| Cluster | Nome | Risco | Distribuição | Características principais |
|---------|------|-------|-------------|---------------------------|
| C0 | Sob Pressão | Moderado-Alto | 391 (21.7%) | Sono baixo (0.35), tela alta (0.49), exercício moderado (0.60), estresse alto (0.54) |
| C1 | Equilibrado | Baixo | 448 (24.9%) | Sono alto (0.71), exercício muito alto (0.70), estresse moderado (0.47) |
| C2 | Rotina Saudável | Baixo-Moderado | 447 (24.8%) | Sono médio (0.52), exercício muito baixo (0.22), estresse baixo (0.33) |
| C3 | Em Alerta | Alto | 514 (28.6%) | Sono médio-alto (0.63), exercício mínimo (0.23), estresse muito alto (0.66) |

> Valores normalizados [0–1] via MinMaxScaler. Silhouette score: **0.123**.

---

## Pipeline de Mineração de Dados

```
data.csv (1.800 × 16 colunas — Kaggle)
    ↓
preprocessing.py
    ├── EDA: distribuições, correlações, boxplots
    ├── Qualidade: 0 nulos, 0 duplicatas, outliers MANTIDOS (dados reais válidos)
    ├── Mapeamento:
    │     PHQ9 (0–27) → nivelHumor (1–5) via escala clínica Kroenke et al. 2001
    │     AcademicStress (0–10) → nivelEstresse (Baixo|Medio|Alto)
    │     GPA (0–4) → desempenhoAcademico (Melhorou|Mesmo|Piorou)
    │     AcademicStress > 7 → ansiedadeAntesProva (boolean)
    ├── Seleção: 6 features (SleepHours, ScreenTime, ExerciseFreq, AcademicStress, PHQ9, GAD7)
    └── Normalização: MinMaxScaler → [0, 1]
    ↓
dados_tratados.json → seed do banco PostgreSQL
features_kmeans.csv → treinamento K-Means
    ↓
kmeans_clustering.py
    ├── Validação K: cotovelo + silhouette → K=4
    ├── Treinamento KMeans(n_clusters=4, random_state=42)
    └── Visualizações: PCA 2D, radar, distribuição, heatmap centroides
    ↓
modelo_kmeans.pkl (8.4 KB) → mining-service Flask
```

---

## Variáveis de ambiente

### backend/.env
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/entrementes"
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d
GCP_PROJECT_ID=entrementes-pi
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
```

### mining-service/.env
```env
FLASK_PORT=5000
GCP_PROJECT_ID=entrementes-pi
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
GCP_SUBSCRIPTION_ID=mining-worker
GCP_TOPIC_RESULT=profile-classified
```

---

## Regras do projeto

- **NUNCA** commitar `.env` com dados reais
- **NUNCA** commitar `gcp-credentials.json` (está no `.gitignore`)
- **NUNCA** retornar `passwordHash` em resposta da API
- **NUNCA** fazer diagnóstico psicológico — sempre usar disclaimer
- Disclaimer obrigatório: *"Este resultado não substitui acompanhamento profissional de saúde mental"*
- Commits em português, descritivos
- Ambos os integrantes devem ter commits em todos os módulos
- **NUNCA** commitar — o usuário sempre faz commit manualmente

---

## Estrutura de pastas

```
EntreMentes/
├── backend/
│   ├── src/
│   │   ├── routes/         auth.js, mood.js, users.js, analytics.js
│   │   ├── controllers/
│   │   ├── services/       auth.service.js, mood.service.js (pubsub.service.js — pendente)
│   │   ├── middlewares/    auth.middleware.js
│   │   └── lib/            prisma.js (singleton)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── server.js
│   └── .env
│
├── web/
│   └── src/
│       ├── pages/          LoginPage, RegisterPage, DashboardPage, RegistroDiarioPage, HistoricoPage
│       ├── components/     Input, Button, Sidebar
│       ├── context/        AuthContext.jsx
│       ├── services/       api.js
│       ├── assets/         Circulo amarelo.png, Gradiente.jpg, EmailIcon.jsx, CadeadoIcon.jsx
│       └── App.jsx / App.css / index.css
│
├── mobile/
│   └── src/
│       ├── screens/        LoginScreen, RegisterScreen, DashboardScreen,
│       │                   RegistroDiarioScreen, HistoricoScreen
│       ├── navigation/     AuthStack.js, AppTabs.js
│       ├── components/     Input.js, Button.js
│       ├── context/        AuthContext.js
│       ├── services/       api.js
│       ├── theme/          colors.js, fonts.js
│       └── assets/         CadeadoIcon.js
│
├── data-analysis/
│   ├── preprocessing.py    pipeline completo de pré-processamento
│   ├── kmeans_clustering.py treinamento e validação do K-Means
│   ├── data.csv            dataset bruto (Kaggle)
│   ├── dados_tratados.json 1.800 registros formato Prisma
│   ├── features_kmeans.csv 6 features normalizadas
│   ├── modelo_kmeans.pkl   modelo serializado (8.4 KB)
│   ├── graficos/           01–09 PNGs (EDA, normalização, clusters)
│   └── README.md           documentação completa com gráficos
│
├── mining-service/         (a criar na Sprint 3)
│   ├── app.py
│   ├── classifier.py
│   ├── pubsub_consumer.py
│   └── requirements.txt
│
├── Documentação/
│   ├── EntreMentes Documentação.pdf
│   ├── EntreMentes_Sprint2_Doc.md
│   ├── BD - Conceitual.jpeg
│   ├── BD - Logico.jpeg
│   └── Fluxo-do-Sistema.png
│
└── README.md
```
