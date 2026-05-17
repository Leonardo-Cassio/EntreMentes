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

> **Última atualização:** 2026-05-13 (sessão completa)
> **Sprint 2 apresentada com sucesso — sem objeções dos professores ✅**
> **Sprint 3 em andamento — todo o Bloco C frontend concluído ✅**
> **Integração mining-service ↔ backend sem Pub/Sub implementada ✅**
> **Comentários data-analysis aprimorados para apresentação ✅**

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

**Backend**
- [x] Mining Service Python (Flask) — `POST /classify` + `GET /health` funcionando e testados
- [ ] ~~Pub/Sub~~ — **EM QUARENTENA** (aguardando professor liberar GCP + instruções)
- [x] Endpoint `GET /analytics/profile` no backend
- [x] Integração direta backend → mining-service via `classifyService.js` (substitui Pub/Sub enquanto GCP não é liberado)
- [x] `DefinicaoCluster` populada automaticamente na primeira classificação; script `seedClusters.js` para pré-popular
- [x] `POST /mood` agora dispara classificação assíncrona (fire-and-forget) após salvar o registro

**Frontend — Bloco C**
- [x] **C1** Dashboard mobile: nome e iniciais do avatar via `useAuth()` (removido hardcoded "João Silva")
- [x] **C2** Dashboard web e mobile: gráficos e métricas conectados ao `GET /mood` real — humor médio, dias registrados, sequência atual, evolução por dia e por dia da semana
- [x] **C2+** Card "Última Avaliação de Bem-Estar": data dinâmica do último registro (web e mobile), botão adaptativo
- [x] **C3** Modal "Seu Perfil" web: conectado ao `GET /analytics/profile` real — 3 estados (loading spinner, sem perfil, perfil completo com emoji, risco, médias, insights, recomendações)
- [x] **C4** Tela Humor mobile: `HumorScreen.js` criada — header LinearGradient, pills de médias, insights, recomendações, pull-to-refresh, 3 estados (loading, sem perfil, perfil completo)

**Data Analysis**
- [x] Comentários de `preprocessing.py` aprimorados para apresentação (cada etapa explica o "porquê" técnico)
- [x] Comentários de `kmeans_clustering.py` aprimorados (cotovelo, silhouette, k-means++, rotulagem, radar chart)

**Documentação**
- [x] **A3** Swagger UI — spec OpenAPI 3.0 em `backend/src/docs/swagger.js`, comentários JSDoc em todas as rotas, Swagger UI montado em `/docs` via `swagger-ui-express`

**Deploy**
- [ ] **D1** Deploy Railway — **passado para o Leonardo** (repo está na conta dele, mais fácil subir via GitHub direto no Railway dashboard)
  - backend/Dockerfile corrigido: `CMD sh -c "npx prisma migrate deploy && node src/server.js"`
  - backend/railway.toml criado: build = nixpacks, startCommand inclui migrate deploy
  - backend/package.json: scripts `start` e `build` adicionados
  - backend/.gitignore criado
  - .gitignore raiz criado
  - Projeto criado no Railway (ID: d38ee39c-62e8-4f91-a9b0-c6a285b2b95f) na conta Gabriel
  - PostgreSQL adicionado ao projeto Railway
  - Variáveis configuradas: PORT=3000, NODE_ENV=production, JWT_SECRET, JWT_EXPIRES_IN=7d
  - **Blocker:** DATABASE_URL do Postgres não estava sendo injetada automaticamente — Leonardo deve usar Variable Reference no dashboard ao subir pelo GitHub

- [ ] Vídeo demonstração (até 5 min, YouTube, todos os membros)
- [ ] Relatório final do PI

---

## Histórico de sessões

### Sessão 15-17/05/2026 — noite (A3 + D1 parcial)
```
backend/src/docs/swagger.js           ← NOVO: spec OpenAPI 3.0, schemas reutilizáveis
backend/src/routes/authRoutes.js      ← comentários @swagger adicionados (register, login)
backend/src/routes/userRoutes.js      ← comentários @swagger adicionados (GET/PUT/DELETE /me)
backend/src/routes/moodRoutes.js      ← comentários @swagger adicionados (5 endpoints)
backend/src/routes/analyticsRoutes.js ← comentários @swagger adicionados (GET /profile)
backend/src/server.js                 ← Swagger UI montado em /docs
backend/package.json                  ← scripts start e build adicionados
backend/Dockerfile                    ← CMD corrigido: migrate deploy + node server.js
backend/railway.toml                  ← NOVO: builder nixpacks, startCommand com migrate
backend/.gitignore                    ← NOVO
.gitignore                            ← NOVO (raiz do projeto)
Documentação/API.md                   ← NOVO: doc Markdown (complementar ao Swagger)
```
Swagger UI acessível em http://localhost:3000/docs quando backend rodando localmente.
Deploy Railway iniciado mas não concluído — passado para Leonardo (repo na conta dele).

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

### Sessão 13/05/2026 — tarde 2 (integração classify sem Pub/Sub)
```
backend/src/services/classifyService.js     ← NOVO: chama POST /classify do mining-service após
                                               cada registro de humor e faz upsert em
                                               PerfilComportamental (alternativa ao Pub/Sub)
backend/src/controllers/moodController.js   ← create() dispara classificarEAtualizar() de forma
                                               assíncrona (fire-and-forget, não bloqueia resposta)
backend/prisma/seedClusters.js              ← NOVO: popula DefinicaoCluster com os 4 perfis K-Means
backend/.env                                ← MINING_SERVICE_URL=http://localhost:5000 adicionado
```
Fluxo sem GCP: POST /mood → salva no banco → responde 200 → (async) chama mining-service →
upsert DefinicaoCluster se necessário → upsert PerfilComportamental.
Requisito: mining-service deve estar rodando em localhost:5000 (python app.py).

### Sessão 13/05/2026 — tarde (Bloco C frontend)
```
web/src/services/api.js                     ← getProfile() adicionado
mobile/src/services/api.js                  ← getProfile() adicionado
mobile/src/screens/DashboardScreen.js       ← C1: nome real do AuthContext (iniciais dinâmicas)
                                               C2: fetch GET /mood, helpers de transformação,
                                               métricas reais, gráficos com loading state
web/src/pages/DashboardPage.jsx             ← C2: gráficos/métricas conectados ao GET /mood real
                                               C3: modal perfil conectado ao GET /analytics/profile
                                               (3 estados: loading spinner, sem perfil, perfil completo)
                                               saudação usa nome real do AuthContext
web/src/pages/DashboardPage.css             ← estilos de loading (spinner, chart-loading)
mobile/src/screens/HumorScreen.js          ← C4: NOVA TELA — perfil comportamental completo
                                               (header LinearGradient, pills de médias, insights,
                                               recomendações, pull-to-refresh, 3 estados)
mobile/src/navigation/AppTabs.js           ← C4: importa HumorScreen real (remove placeholder)
.github/copilot-instructions.md            ← atualizado com todas as tarefas C concluídas
```

### Sessão 12/05/2026 — noite 3 (analytics A1 + A2)
```
backend/src/services/analyticsService.js    ← NOVO: getProfile() — query PerfilComportamental
                                               + DefinicaoCluster, médias dos últimos 30
                                               registros, metadados visuais por nomePerfil
backend/src/controllers/analyticsController.js ← NOVO: GET /analytics/profile
backend/src/routes/analyticsRoutes.js       ← NOVO: router.get('/profile', auth, ...)
backend/src/server.js                       ← rota /analytics registrada; /humor removida (A2)
```
Shape de resposta: { nomePerfil, clusterId, nivelRisco, emoji, corRisco, bgRisco,
justificativa, medias{duracaoSono,tempoTela,atividadeFisica}, insights[], recomendacoes[], geradoEm }
Campo insights no DB armazena { insights:[...], recomendacoes:[...] } como Json único.
404 retornado quando PerfilComportamental ainda não existe para o usuário.

### Sessão 12/05/2026 — noite 2 (mining-service B1)
```
mining-service/app.py          ← NOVO: Flask, POST /classify, GET /health, validação de input
mining-service/classifier.py   ← NOVO: carrega modelo_kmeans.pkl, mapeamento inverso app→model,
                                        normalização manual MinMaxScaler, estimativa GAD7,
                                        insights e recomendações por perfil
mining-service/requirements.txt← NOVO: flask, flask-cors, scikit-learn, joblib, numpy, pandas
mining-service/.env.example    ← NOVO: FLASK_PORT, FLASK_DEBUG, MODEL_PATH
```
Testado e validado: POST /classify retorna perfil correto ("Em Alerta" para dados de risco,
"Equilibrado" para dados saudáveis). Validação de campos obrigatórios e enums funcionando.

### Sessão 12/05/2026 — noite (redesign auth)
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

1. **GCP / Pub/Sub** — EM QUARENTENA. Aguardando professor fornecer instruções e acesso ao GCP Console.

2. **Deploy Railway** — backend + PostgreSQL em produção.

3. **Documentação da API REST** — exigida na Sprint 3 (OpenAPI/Swagger ou equivalente).

4. **Vídeo demonstração** — até 5 min, YouTube, com presença dos dois integrantes.

5. **Relatório final do PI**.

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
- Header com o emoji do perfil (campo `perfil.emoji` retornado pela API), nome do perfil e badge de risco com cor dinâmica
- Conectado ao `GET /analytics/profile` via `useState` + `useEffect` em `DashboardPage.jsx`
- 3 estados de renderização: loading spinner | sem perfil (botão → /registro) | perfil completo
- Shape da resposta: `{ nomePerfil, emoji, nivelRisco, corRisco, bgRisco, justificativa, medias{duracaoSono,tempoTela,atividadeFisica}, insights[], recomendacoes[], geradoEm }`
- `buildDadosPerfil(medias)` transforma as médias em pills com valor + referência ideal (sono: 7–9h, tela: < 6h, exercício: > 4h)

### Mining Service — mapeamento inverso app → modelo

O modelo K-Means foi treinado com features do dataset bruto (PHQ9, GAD7, SleepHours, etc.), mas o app armazena campos mapeados (nivelHumor 1-5, nivelEstresse Baixo/Medio/Alto). O `classifier.py` faz o mapeamento inverso:

- `nivelHumor` → PHQ9: `{5:2, 4:7, 3:12, 2:17, 1:23}` (midpoints das faixas PHQ-9)
- `nivelEstresse` → AcademicStress: `{Baixo:1.5, Medio:5.0, Alto:8.5}` (midpoints 0-3/4-6/7-10)
- GAD7 estimado via `phq9 * (21/27)` + bônus de 4 se `ansiedadeAntesProva=True`
- Normalização MinMaxScaler manual com ranges do domínio (PHQ9: 0-27, GAD7: 0-21, etc.)
- `duracaoSono`, `tempoTela`, `atividadeFisica` são usados diretamente (mesmo campo, mesma escala)

O MinMaxScaler original **não foi salvo** no pkl — só o KMeans. Por isso a normalização manual.

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
| Dashboard | `/dashboard` | ✅ | Métricas e gráficos reais (GET /mood), seletor humor com modal, card perfil clicável com modal conectado ao GET /analytics/profile (3 estados), data dinâmica da última avaliação |
| Registro Diário | `/registro` | ✅ | Sliders, seleções, barra progresso, POST /mood. Recebe nivelHumorInicial via Router state. |
| Histórico | `/historico` | ✅ | Cards expansíveis, GET /mood integrado |

### Mobile

| Tela | Aba | Status | Detalhes |
|------|-----|--------|----------|
| Login | — | ✅ | LinearGradient fundo, card branco centralizado, typewriter 2s, slide-up ao montar |
| Cadastro | — | ✅ | Mesmo estilo login, typewriter 3s, 4 campos |
| Dashboard | Dashboard | ✅ | Métricas e gráficos reais (GET /mood), nome real do AuthContext, seletor humor com Modal nativo, data dinâmica da última avaliação, navega para Diário com param |
| Registro Diário | Diário | ✅ | Sliders, emojis, progresso, POST /mood. Recebe nivelHumorInicial via route.params. |
| Histórico | Histórico | ✅ | FlatList, cards expansíveis, GET /mood integrado |
| Perfil | Perfil | ✅ | Nome, email, botão logout |
| Humor | Humor | ✅ | Perfil comportamental completo: header LinearGradient, pills de médias, insights, recomendações, pull-to-refresh, 3 estados (loading, sem perfil, perfil completo) |

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
Dados: GET /analytics/profile (real, Sprint 3)
Requisito: mining-service rodando + ao menos 1 registro de humor salvo (dispara classificação via classifyService.js)
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
├── mining-service/         ✅ criado na Sprint 3
│   ├── app.py              Flask: POST /classify, GET /health
│   ├── classifier.py       lógica K-Means + mapeamento inverso + normalização
│   ├── requirements.txt
│   └── .env.example        (pubsub_consumer.py pendente — aguardando GCP)
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
