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

> **Última atualização:** 2026-06-04 (sessão dark mode web + deploy Vercel — Leonardo)
> **Sprint 2 apresentada com sucesso — sem objeções dos professores ✅**
> **Sprint 3 em andamento — todo o Bloco C frontend concluído ✅**
> **Mensageria implementada com BullMQ + Redis no Railway ✅ — Bull Board ativo em /admin/queues**
> **Mobile sincronizado com web (Perfil, Estatísticas, modais, gráficos) ✅**
> **Deploy Railway concluído — backend + PostgreSQL + mining-service + Redis online ✅**
> **Deploy Vercel concluído — frontend web acessível em https://entre-mentes.vercel.app ✅**
> **Dark mode implementado no web com persistência via localStorage ✅**
> **Páginas "Meu Perfil" e "Estatísticas" adicionadas ao web e mobile ✅**
> **Relatório Final do PI criado e exportado como PDF ✅**
> **Roteiro do vídeo de demonstração criado ✅**
> **Redesign visual Dashboard e Estatísticas concluído ✅**

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
- [x] **Mensageria BullMQ + Redis** ✅ implementada e funcionando em produção (sessão 03/06)
  - `backend/src/queues/classifyQueue.js` — cria fila com graceful degradation sem Redis
  - `backend/src/workers/classifyWorker.js` — worker que processa os jobs de classificação
  - `moodController.js` — usa fila se Redis disponível, fallback para classifyService direto
  - `server.js` — inicia worker + Bull Board em `/admin/queues`
  - Redis adicionado no Railway; variável `REDIS_URL` configurada no serviço backend
  - Bull Board acessível em `https://entrementes-production.up.railway.app/admin/queues`
  - Job testado e confirmado: COMPLETO em 148ms com dados reais
- [x] Endpoint `GET /analytics/profile` no backend
- [x] Integração direta backend → mining-service via `classifyService.js` (fallback quando Redis indisponível)
- [x] `DefinicaoCluster` populada automaticamente na primeira classificação; script `seedClusters.js` para pré-popular
- [x] `POST /mood` enfileira job no Redis (BullMQ) ou fallback fire-and-forget

**Frontend — Bloco C**
- [x] **C1** Dashboard mobile: nome e iniciais do avatar via `useAuth()` (removido hardcoded "João Silva")
- [x] **C2** Dashboard web e mobile: gráficos e métricas conectados ao `GET /mood` real — humor médio, dias registrados, sequência atual, evolução por dia e por dia da semana
- [x] **C2+** Card "Última Avaliação de Bem-Estar": data dinâmica do último registro (web e mobile), botão adaptativo
- [x] **C3** Modal "Seu Perfil" web: conectado ao `GET /analytics/profile` real — 3 estados (loading spinner, sem perfil, perfil completo com emoji, risco, médias, insights, recomendações)
- [x] **C4** Tela Humor mobile: `HumorScreen.js` criada — header LinearGradient, pills de médias, insights, recomendações, pull-to-refresh, 3 estados (loading, sem perfil, perfil completo)

**Data Analysis**
- [x] Comentários de `preprocessing.py` aprimorados para apresentação (cada etapa explica o "porquê" técnico)
- [x] Comentários de `kmeans_clustering.py` aprimorados (cotovelo, silhouette, k-means++, rotulagem, radar chart)
- [x] **Entrega "Extração de Padrões"** (entregue 19/05, prazo 21/05) — `extracao_padroes.ipynb` executado com outputs + `relatorio_extracao_padroes.md`
  - Algoritmos: K-Means K=4 k-means++ (principal) + Decision Tree max_depth=3 (extração de regras IF-THEN)
  - Novo gráfico: `graficos/10_arvore_decisao.png`

**Documentação**
- [x] **A3** Swagger UI — spec OpenAPI 3.0 em `backend/src/docs/swagger.js`, comentários JSDoc em todas as rotas, Swagger UI montado em `/docs` via `swagger-ui-express`

**Deploy**
- [x] **D1** Deploy Railway — backend + PostgreSQL online em produção ✅
  - **URL pública:** `https://entrementes-production.up.railway.app`
  - **Swagger UI em produção:** `https://entrementes-production.up.railway.app/docs`
  - Conta Railway: Leonardo (projeto criado do zero na sessão 17/05)
  - Serviços no Railway: EntreMentes (Node.js) + Postgres (banco gerenciado)
  - Root Directory configurado para `backend/` nas Settings do serviço
  - `DATABASE_URL` configurada via Variable Reference: `${{Postgres.DATABASE_URL}}`
  - `web/src/services/api.js` e `mobile/src/services/api.js` apontando para URL de produção
- [x] **D2** Deploy mining-service no Railway ✅ (sessão 21/05)
  - **URL pública:** `https://zestful-adventure-production-4e44.up.railway.app`
  - Variável `MINING_SERVICE_URL` no backend atualizada para essa URL
  - Porta ajustada para usar `PORT` env var injetado pelo Railway
  - `scikit-learn` fixado em 1.6.1 no `requirements.txt` (model treinado em 1.4.2, 1.8.0 causava `InconsistentVersionWarning`)
  - A partir dessa sessão: classificação de perfil funciona em produção sem Docker local

**Web — Novas páginas**
- [x] Botão "Excluir conta" na Sidebar (acima do "Sair") com modal de confirmação ✅
- [x] Página **Meu Perfil** (`/perfil`) — edição de nome/e-mail e troca de senha ✅
- [x] Página **Estatísticas** (`/estatisticas`) — 4 cards de resumo + 5 gráficos Recharts ✅

**Mobile — Novas telas (sessão 21/05, Leonardo)**
- [x] `EstatisticasScreen.js` — equivalente à web: cards de resumo + gráficos
- [x] `PerfilScreen.js` — edição de perfil + troca de senha + excluir conta
- [x] `DashboardScreen.js` — refatorado com dados reais
- [x] `AppTabs.js` — navegação atualizada para novas telas
- [x] `mobile/src/services/api.js` — `updateMe`, `deleteMe` adicionados; fix URL: quando `expo --web` usa produção

- [ ] Vídeo demonstração (até 5 min, YouTube, todos os membros)
- [x] Relatório final do PI → `Documentação/Relatorio_Final_PI.md` ✅ (criado em 01/06/2026)

---

## Histórico de sessões

### Sessão 04/06/2026 — Dark mode web + deploy Vercel (Leonardo)
```
web/index.html                          ← script inline que aplica data-theme antes do React
                                          (garante persistência do tema em qualquer página)
web/src/index.css                       ← [data-theme="dark"] com variáveis escuras;
                                          --text-on-color (sempre #fff, para botões/gradientes);
                                          --input-bg (branco no light, #2A2A3D no dark);
                                          transition em body para troca suave
web/src/pages/DashboardPage.jsx         ← estado darkMode + useEffect que aplica data-theme
                                          e persiste no localStorage; botão tema no header
web/src/pages/DashboardPage.css         ← estilos .tema-toggle, .tema-label, .tema-emoji-wrap;
                                          .chart-tooltip com fundo branco fixo + texto escuro;
                                          .dashboard-layout usa var(--surface)
web/src/pages/HistoricoPage.css         ← reescrito com variáveis CSS (era 100% hardcoded)
web/src/pages/RegistroDiarioPage.css    ← #F3F1FF → rgba(108,92,231,0.08)
web/src/pages/PerfilPage.css            ← transition adicionada ao .perfil-card
web/src/pages/EstatisticasPage.css      ← transition adicionada ao .est-chart-card
web/src/pages/EstatisticasPage.jsx      ← HUMOR_CORES: rgba transparente → cores sólidas
                                          (evita grid visível através das barras);
                                          CartesianGrid stroke → var(--border)
web/src/components/Sidebar.css          ← .sidebar-nav-item.ativo: #EDE9FF → rgba(108,92,231,0.12)
web/src/components/Input.css            ← usa --input-bg; fix autofill webkit para dark mode
web/src/components/Button.css           ← .btn-primary e .btn-dark: color → var(--text-on-color)
web/src/App.css                         ← textos sobre gradiente: var(--white) → var(--text-on-color)
web/.env                                ← VITE_API_URL=https://entrementes-production.up.railway.app
README.md                               ← link Vercel adicionado na tabela de deploy
```
**Deploy Vercel:**
- URL: `https://entre-mentes.vercel.app`
- Root Directory: `web/`
- Variável `VITE_API_URL` configurada no dashboard do Vercel
- Deploy automático a cada `git push` no main
- Gabriel adicionado como membro do projeto Vercel

**Diferenças web × mobile identificadas (pendentes):**
- Dark mode: implementado no web, **não implementado no mobile**
- Frase motivacional diária: presente no web Dashboard, **não existe no mobile**

---

### Sessão 03/06/2026 — Mensageria BullMQ + Redis + sync mobile (Leonardo)
```
backend/package.json                        ← bullmq, ioredis, @bull-board/api, @bull-board/express instalados
backend/src/queues/classifyQueue.js         ← NOVO: cria Queue + conexão IORedis; graceful degradation sem REDIS_URL
backend/src/workers/classifyWorker.js       ← NOVO: Worker que processa jobs — chama mining-service, upsert perfil
backend/src/controllers/moodController.js   ← usa classifyQueue.add() se Redis disponível; fallback classifyService
backend/src/server.js                       ← inicia worker + Bull Board montado em /admin/queues

web/.env                                    ← NOVO: VITE_API_URL=https://entrementes-production.up.railway.app
                                              (corrige ERR_CONNECTION_REFUSED no web local sem backend rodando)

mobile/src/context/AuthContext.js           ← updateUser() adicionado (atualiza state + AsyncStorage)
mobile/src/services/api.js                  ← updateMe(), deleteMe() adicionados
mobile/src/screens/PerfilScreen.js          ← NOVO: edição nome/e-mail, troca de senha, excluir conta com modal
mobile/src/screens/EstatisticasScreen.js    ← NOVO: cards de resumo + gráficos de barras horizontais (View puro)
mobile/src/navigation/AppTabs.js            ← "Humor" substituído por "Estatísticas"; PerfilScreen real importado

mobile/src/screens/DashboardScreen.js       ← onLayout para CHART_WIDTH real (fix overflow no web);
                                              barras com valor=0 renderizam com altura mínima (fix SVG inválido);
                                              modal perfil comportamental em View absoluta (respeita container 430px);
                                              modal confirmação humor movido para fora do ScrollView (idem);
                                              Dimensions removido dos imports

mobile/App.js                               ← wrapper web: Platform.OS==='web' centraliza em 430×932px
                                              com fundo escuro — resolve responsividade no browser
```
**Railway — configurações adicionadas:**
- Serviço Redis adicionado ao projeto (New → Database → Redis)
- Variável `REDIS_URL` adicionada ao serviço backend (referência automática do Redis)
- Bull Board confirmado em funcionamento: job testado e concluído em 148ms
- Gabriel adicionado como membro do projeto Railway

**Sessão incluiu também (sem alterações em código):**
- Explicação completa de mensageria, Redis, BullMQ, filas, GCP Pub/Sub vs BullMQ
- Roteiro para apresentação da parte de mineração de dados
- Explicação do K-Means (sem taxa de acerto) e Árvore de Decisão (complementar, max_depth=3)
- Relatório da sessão de mensageria para repasse ao colega Gabriel

---

### Sessão 02/06/2026 — Redesign visual web + mobile Railway fix (Gabriel)
```
mobile/src/services/api.js          ← SIMPLIFICADO: removida lógica de detecção de ambiente
                                       (Constants, Platform, __DEV__); agora aponta sempre para
                                       Railway: 'https://entrementes-production.up.railway.app'

web/src/pages/EstatisticasPage.jsx  ← REDESENHADO: emojis dos cards → ícones SVG (lua, monitor,
                                       atividade, alerta); paleta harmonizada com roxo primário;
                                       gráficos com escala de opacidade do roxo (humor),
                                       variações do roxo (estresse, desempenho);
                                       linhas tela e atividade agora em #A29BFE e #5A4BD1

web/src/pages/EstatisticasPage.css  ← REDESENHADO: ícone como container colorido (rgba primário),
                                       removidos os 4 temas de cor dos cards de resumo,
                                       todos os valores em var(--primary)

web/src/pages/DashboardPage.jsx     ← REDESENHADO:
                                       - Cards de métricas: emoji → ícones SVG (smile, calendário,
                                         trending-up, user); valores 24px font-weight 800;
                                         "Ver detalhes" virou pill button com seta SVG
                                       - Emojis de humor: menores (22px, opacity 0.85),
                                         fundo neutro branco em todos os cards,
                                         hover/ativo unificado em roxo primário
                                       - AreaChart com gradiente translúcido (era LineChart)
                                       - Eixo X mostra datas reais ("01 jun", "05 jun")
                                       - Cards de gráfico clicáveis: hover scale(1.018) +
                                         sombra; click abre modal com gráfico expandido
                                       - Modal de gráfico: AreaChart 360px com dots visíveis
                                         (evolução) ou BarChart 360px com labels nos valores
                                         (dia da semana)

web/src/pages/DashboardPage.css     ← REDESENHADO: fundo #F1F3F5, cards border-radius 20px,
                                       box-shadow suave, .chart-card-interativo com hover,
                                       .grafico-modal com header/corpo/fechar
```
Tentativa de triângulos geométricos como ícones de humor (descartada pelo usuário — voltou para emojis menores e mais sutis).
Próxima sessão: continuar melhorias visuais no web.

### Sessão 02/06/2026 — Análise BullMQ + Redis e consulta ao professor (Gabriel)
```
Nenhum arquivo criado ou modificado nesta sessão.
Sessão de análise e decisão arquitetural.
```
- Professor liberou Computação em Nuvem II para escolha livre (exige Pub/Sub + nuvem)
- Analisou solução proposta pelo Leonardo: BullMQ + Redis no Railway
- Conclusão: tecnicamente sólida, implementa o mesmo padrão Pub/Sub, sem dependências externas
- Risco identificado: se professor exigir especificamente GCP Pub/Sub, perder pontos
- Ação tomada: mensagem enviada ao professor para confirmar se BullMQ + Redis é aceito
- Implementação aguarda resposta. Plano completo de implementação documentado nas pendências acima.

### Sessão 01/06/2026 — Relatório Final + PDF + Roteiro Vídeo (Gabriel)
```
Documentação/Relatorio_Final_PI.md  ← NOVO: relatório final completo do PI (~10 páginas, PT-BR)
                                       Cobre as 3 disciplinas do 6º semestre:
                                       - Lab Dev Multiplataforma: arquitetura, backend (todos endpoints),
                                         web (7 telas), mobile (8 telas), mining service
                                       - Computação em Nuvem II: Railway (3 serviços), nixpacks,
                                         alta disponibilidade, HTTPS, variáveis de ambiente, Pub/Sub planejado
                                       - Mineração de Dados: pipeline EDA→pré-proc→K-Means K=4→Decision Tree,
                                         4 perfis com centroides, integração em produção
                                       10 seções: Resumo, Introdução, Escopo/RFs, Arquitetura, Dev Multiplataforma,
                                       Nuvem, Mineração, Sprint History, Resultados, Referências

Documentação/Relatorio_Final_PI.pdf ← NOVO: PDF gerado via xhtml2pdf + markdown
                                       Estilo acadêmico: tipografia Arial, tabelas com header roxo (#7B2FBE),
                                       código com borda lateral, rodapé automático em todas as páginas
                                       Tamanho: 70.6 KB

Documentação/Roteiro_Video_PI.md    ← NOVO: roteiro completo do vídeo de demonstração (~4:50 min)
                                       Divisão: Leonardo fala (narração), Gabriel mostra (tela)
                                       7 blocos: abertura → contexto → demo web → demo mobile →
                                       nuvem/swagger → mineração → encerramento
                                       Inclui falas exatas, ações de tela, checklist pré e pós-gravação,
                                       título/descrição do YouTube e link do formulário de entrega
```
Manual lido: MANUAL PI - DSM - v03 - 2025.pdf (24 páginas).
Critérios de avaliação das 3 disciplinas do 6º semestre extraídos.
Entrega final do PI: formulário https://forms.office.com/r/nknRMxzwzN (link GitHub + link YouTube)

### Sessão 21/05/2026 — Revisão alterações Leonardo + resolução conflito merge (Gabriel)
```
web/src/services/api.js   ← conflito resolvido: mantida versão com VITE_API_URL env var
                             (Leonardo tinha hardcoded URL de produção; env var é a correta
                             pois funciona em dev e prod sem quebrar ninguém)
```
Revisão de todos os commits do Leonardo (57635a2 → 4448356). Sem alterações de código além do merge.

### Sessão 21/05/2026 — Deploy mining-service + novas páginas web (Leonardo)
```
mining-service/app.py                 ← porta ajustada para usar PORT env var do Railway
mining-service/classifier.py          ← MODEL_PATH padrão → "./modelo_kmeans.pkl"
mining-service/requirements.txt       ← scikit-learn fixado em 1.6.1 (compat. com modelo)
mining-service/modelo_kmeans.pkl      ← copiado de data-analysis/ para dentro do serviço
mining-service/railway.toml           ← NOVO: builder nixpacks, startCommand = "python app.py"

backend/src/services/userService.js   ← NOVO: changePassword() — verifica senha atual (bcrypt),
                                         salva nova hash
backend/src/controllers/userController.js ← updateMe() agora aceita currentPassword + newPassword
                                             para troca de senha; chama changePassword() se fornecidos

web/src/context/AuthContext.jsx        ← NOVO: updateUser() — atualiza user no state + localStorage
web/src/services/api.js                ← NOVO: updateMe() — PUT /users/me com token
web/src/components/Sidebar.jsx         ← Botão "Excluir conta" + modal de confirmação;
                                          ícones IconePerfil e IconeEstatisticas;
                                          itens de nav "/perfil" e "/estatisticas" adicionados
web/src/components/Sidebar.css         ← estilos .sidebar-excluir, .sidebar-modal-* adicionados
web/src/pages/PerfilPage.jsx           ← NOVO: avatar com iniciais, form nome/e-mail, form senha
web/src/pages/PerfilPage.css           ← NOVO
web/src/pages/EstatisticasPage.jsx     ← NOVO: 4 cards de resumo (sono, tela, atividade, ansiedade)
                                          + 5 gráficos: dist. humor, estresse, desempenho acadêmico,
                                          sono vs tela (linha), atividade física (linha)
web/src/pages/EstatisticasPage.css     ← NOVO
web/src/App.jsx                        ← rotas /perfil e /estatisticas adicionadas
```
**Variável Railway atualizada:**
- `MINING_SERVICE_URL` = `https://zestful-adventure-production-4e44.up.railway.app` (serviço mining no Railway)

**A partir desta sessão:** não é mais necessário Docker Desktop nem terminal do backend. Basta `npm run dev` no diretório `web/` para usar o projeto completo (backend + banco + mining-service todos no Railway).

---

### Sessão 19/05/2026 — Entrega "Extração de Padrões" (Gabriel)
```
data-analysis/extracao_padroes.ipynb         ← NOVO: notebook executado com outputs inline
data-analysis/relatorio_extracao_padroes.md  ← NOVO: relatório da etapa para entrega no Teams
data-analysis/graficos/10_arvore_decisao.png ← NOVO: árvore de decisão (regras dos clusters)
```
Entrega da atividade de Mineração de Dados — prazo 21/05. Dois algoritmos: K-Means K=4 (clustering
não supervisionado) + Decision Tree max_depth=3 (extração de regras IF-THEN interpretáveis).
Jupyter instalado via pip; notebook executado com `nbconvert --execute --inplace`. Entregue no Teams.

### Sessão 17/05/2026 — Deploy Railway D1 (Leonardo)
```
backend/package.json                  ← script start: migrate deploy via node direto;
                                         postinstall: prisma generate via node direto;
                                         bcrypt → bcryptjs (binário nativo incompatível com Linux)
backend/railway.toml                  ← buildCommand removido; startCommand = "npm start"
backend/Dockerfile                    ← DELETADO (conflitava com nixpacks; nixpacks preferido)
backend/prisma/migrations/            ← 2 migrations antigas deletadas (schema desatualizado);
                                         nova migration 0_init criada via prisma migrate diff
                                         (schema completo: 3 enums + 6 tabelas + índices + FK)
backend/src/services/authService.js   ← require('bcrypt') → require('bcryptjs')
web/src/services/api.js               ← API_URL → https://entrementes-production.up.railway.app
mobile/src/services/api.js            ← URL produção → https://entrementes-production.up.railway.app
```
**Erros resolvidos durante o deploy (em ordem):**
1. Root Directory não configurado → Settings do serviço → `backend`
2. `prisma: Permission denied` no build → movido para `postinstall` via `node node_modules/prisma/build/index.js`
3. `prisma: Permission denied` no start → `startCommand` virou `npm start`; script start usa `node node_modules/prisma/build/index.js migrate deploy`
4. `bcrypt: invalid ELF header` → binário C++ compilado no Windows não roda em Linux → substituído por `bcryptjs` (puro JS)
5. `DATABASE_URL` apontando para localhost → variável configurada no Railway como `${{Postgres.DATABASE_URL}}`

**Variáveis configuradas no Railway (serviço EntreMentes):**
- `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (Variable Reference)
- `PORT` = `3000`
- `NODE_ENV` = `production`
- `JWT_SECRET` = (string secreta)
- `JWT_EXPIRES_IN` = `7d`
- `MINING_SERVICE_URL` = `http://localhost:5000` (classify falha silenciosamente em produção — aceitável por ora)

### Sessão 15-17/05/2026 — noite (A3 + D1 parcial)
```
backend/src/docs/swagger.js           ← NOVO: spec OpenAPI 3.0, schemas reutilizáveis
backend/src/routes/authRoutes.js      ← comentários @swagger adicionados (register, login)
backend/src/routes/userRoutes.js      ← comentários @swagger adicionados (GET/PUT/DELETE /me)
backend/src/routes/moodRoutes.js      ← comentários @swagger adicionados (5 endpoints)
backend/src/routes/analyticsRoutes.js ← comentários @swagger adicionados (GET /profile)
backend/src/server.js                 ← Swagger UI montado em /docs
backend/package.json                  ← scripts start e build adicionados
backend/railway.toml                  ← NOVO: builder nixpacks, startCommand com migrate
backend/.gitignore                    ← NOVO
.gitignore                            ← NOVO (raiz do projeto)
Documentação/API.md                   ← NOVO: doc Markdown (complementar ao Swagger)
```
Swagger UI acessível em http://localhost:3000/docs quando backend rodando localmente.

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

## Deploy — URLs e acesso

| Serviço | URL |
|---------|-----|
| Web (frontend) | `https://entre-mentes.vercel.app` — Vercel, deploy automático no push |
| API REST (produção) | `https://entrementes-production.up.railway.app` |
| Mining Service (produção) | `https://zestful-adventure-production-4e44.up.railway.app` |
| Bull Board (fila) | `https://entrementes-production.up.railway.app/admin/queues` |
| Swagger UI (produção) | `https://entrementes-production.up.railway.app/docs` |
| Swagger UI (local) | `http://localhost:3000/docs` |
| Railway dashboard | `https://railway.app` — conta Leonardo |
| Vercel dashboard | `https://vercel.com` — conta Leonardo |

### Observações importantes sobre o deploy
- O **mining-service** está deployado no Railway (`https://zestful-adventure-production-4e44.up.railway.app`). A variável `MINING_SERVICE_URL` no serviço backend aponta para ele. Classificação de perfil funciona em produção.
- O mobile em `__DEV__` (Expo Go) usa `localhost:3000` automaticamente via `Constants.expoConfig.hostUri`. A URL de produção só é usada em builds de produção.
- O banco Railway é um PostgreSQL gerenciado — **não rodar `prisma migrate reset`** em produção.
- Para adicionar migrations futuras: rodar `npx prisma migrate dev --name <nome>` localmente, commitar a nova pasta em `prisma/migrations/`, e o Railway aplica automaticamente no próximo deploy via `prisma migrate deploy` no `npm start`.

---

## Pendências para próxima sessão

1. **Vídeo demonstração** — ⚠️ ÚLTIMA PENDÊNCIA CRÍTICA.
   - Gravar usando o roteiro em `Documentação/Roteiro_Video_PI.md`
   - Leonardo narra, Gabriel mostra a tela (web + mobile)
   - Publicar no YouTube como **Público**
   - Título: `EntreMentes — PI 6º Semestre DSM FATEC Franca 2026`
   - Após publicar:
     a) Adicionar link no `README.md` raiz do repositório
     b) Preencher formulário de entrega: https://forms.office.com/r/nknRMxzwzN

2. ~~**Relatório final do PI**~~ — ✅ CONCLUÍDO em 01/06/2026.
   - Markdown: `Documentação/Relatorio_Final_PI.md`
   - PDF: `Documentação/Relatorio_Final_PI.pdf`

3. ~~**Mensageria — BullMQ + Redis**~~ ✅ CONCLUÍDO em 03/06/2026 — funcionando em produção.
     - Bull Board como painel visual em `/admin/queues` — mostra jobs waiting/active/completed/failed em tempo real
     - Implementa o mesmo padrão Pub/Sub: publisher → fila → worker/consumer
   - **Mensagem enviada ao professor (02/06):**
     > "Professor, para a disciplina de Computação em Nuvem II, planejamos implementar mensageria assíncrona utilizando BullMQ + Redis hospedados no Railway (PaaS), como alternativa ao Google Cloud Pub/Sub. O padrão é o mesmo: publisher deposita a mensagem na fila, o broker (Redis) garante a entrega, e um worker consome e processa de forma assíncrona — com painel visual de monitoramento (Bull Board) demonstrando as mensagens em tempo real. Essa abordagem atende aos critérios de nuvem e Pub/Sub da disciplina, ou é necessário utilizar especificamente o Google Cloud Pub/Sub?"
   - **Aguardando aprovação.** Após resposta positiva, implementar BullMQ (estimativa: ~4h em dupla):
     1. Adicionar Redis no Railway (2 cliques)
     2. `npm install bullmq` no backend
     3. `backend/src/queues/classifyQueue.js` — define a fila
     4. `backend/src/workers/classifyWorker.js` — lógica atual do classifyService.js
     5. `backend/src/services/classifyService.js` — vira publisher (adiciona job na fila)
     6. `backend/src/server.js` — Bull Board em `/admin/queues` + inicializa worker
     7. Variável `REDIS_URL` nas envs do Railway
   - **moodController.js não muda** — continua chamando `classifyService.classificarEAtualizar()` igual hoje

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
| Meu Perfil | `/perfil` | ✅ | Edição de nome/e-mail, troca de senha com validação |
| Estatísticas | `/estatisticas` | ✅ | 4 cards de resumo + 5 gráficos Recharts (humor, estresse, desempenho, sono vs tela, atividade) |

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
| PUT | `/users/me` | JWT | Atualizar perfil (name, email, troca de senha via currentPassword+newPassword) |
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
│       ├── pages/          LoginPage, RegisterPage, DashboardPage, RegistroDiarioPage,
│       │                   HistoricoPage, PerfilPage, EstatisticasPage
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
