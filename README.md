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

Todos os serviços se comunicam via HTTP/REST. A classificação de perfil comportamental é processada de forma assíncrona via **BullMQ + Redis** — o backend enfileira o job após salvar o registro e o worker processa em segundo plano.

---

## Deploy (Produção)

| Serviço | URL |
|---------|-----|
| API REST | `https://entrementes-production.up.railway.app` |
| Mining Service | `https://zestful-adventure-production-4e44.up.railway.app` |
| Swagger UI | `https://entrementes-production.up.railway.app/docs` |
| Bull Board (fila) | `https://entrementes-production.up.railway.app/admin/queues` |

Todos os serviços estão hospedados no **Railway**. O banco de dados é um PostgreSQL gerenciado e o Redis é o broker da fila de mensagens, ambos provisionados pelo Railway.

---

## Mensageria — BullMQ + Redis

A classificação de perfil comportamental é processada de forma assíncrona através de uma fila de mensagens. O usuário recebe a resposta imediata ao salvar o registro; a classificação acontece em segundo plano sem bloquear a experiência.

### Ciclo completo de uma mensagem

```
1. Usuário salva registro de humor → POST /mood
           ↓
2. Backend salva no banco PostgreSQL
           ↓
3. Backend responde 200 ao usuário  ← usuário já pode continuar usando o app
           ↓
4. Backend publica job na fila Redis (BullMQ):
   {
     userId, nivelHumor, nivelEstresse, ansiedadeAntesProva,
     duracaoSono, tempoTela, atividadeFisica
   }
           ↓
   ┌─────────────────────────────┐
   │   FILA Redis (BullMQ)       │  ← job guardado na memória
   └─────────────────────────────┘
           ↓
5. Worker (Node.js, segundo plano) pega o job da fila
           ↓
6. Worker chama o mining-service: POST /classify
           ↓
7. Mining-service roda o K-Means → retorna perfil comportamental
           ↓
8. Worker salva/atualiza PerfilComportamental no banco
           ↓
9. Job marcado como COMPLETO na fila
           ↓
10. Usuário abre "Seu Perfil" → dados já atualizados
```

### Garantias da fila

| Situação | Comportamento |
|---|---|
| Mining-service fora do ar | Job permanece na fila e é reprocessado quando voltar |
| Erro durante o processamento | Job volta à fila automaticamente (até 3 tentativas) |
| Muitos registros simultâneos | Fila distribui o processamento sem sobrecarregar |
| Redis indisponível | Fallback automático para chamada HTTP direta (classifyService) |

### Painel visual — Bull Board

Acesse **`https://entrementes-production.up.railway.app/admin/queues`** para visualizar em tempo real:

- **Ativo** — job sendo processado agora
- **Em Espera** — jobs aguardando na fila
- **Completo** — jobs processados com sucesso (com JSON dos dados)
- **Erro** — jobs que falharam com detalhes do erro

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
| Auth         | JWT (jsonwebtoken), bcryptjs                                            |
| Mineração    | Python 3.11, Flask 3, scikit-learn 1.6, pandas 2, numpy 1.26            |
| Mensageria   | BullMQ + Redis (Railway gerenciado)                                     |
| Deploy       | Railway (backend + mining-service + PostgreSQL + Redis)                 |
| Docs API     | swagger-jsdoc + swagger-ui-express                                      |

---

## Telas implementadas

### Mobile (React Native)
| Tela            | Status | Descrição                                                                          |
|-----------------|--------|------------------------------------------------------------------------------------|
| Login           | ✅     | Fundo com gradiente, card branco centralizado, typewriter "Olá!" em 2s            |
| Cadastro        | ✅     | Mesmo estilo do login, typewriter "Seja bem-vindo!" em 3s                         |
| Dashboard       | ✅     | Métricas e gráficos reais, seletor de humor, modal de perfil comportamental        |
| Registro Diário | ✅     | Sliders, seleções, barra de progresso, integrado ao `POST /mood`                  |
| Histórico       | ✅     | FlatList com cards expansíveis, integrado ao `GET /mood`                          |
| Estatísticas    | ✅     | Cards de resumo + gráficos de barras (humor, estresse, desempenho acadêmico)      |
| Perfil          | ✅     | Edição de nome/e-mail, troca de senha, excluir conta                              |

### Web (React)
| Tela            | Status | Descrição                                                                          |
|-----------------|--------|------------------------------------------------------------------------------------|
| Login           | ✅     | Split-screen: form esquerda / gradiente direita, typewriter em 2s                  |
| Cadastro        | ✅     | Split-screen espelhado: gradiente esquerda / form direita, typewriter 3s           |
| Dashboard       | ✅     | Métricas e gráficos reais, modal de humor, modal de perfil comportamental          |
| Registro Diário | ✅     | Sliders, seleções, barra de progresso, integrado ao `POST /mood`                  |
| Histórico       | ✅     | Cards expansíveis integrados ao `GET /mood`                                       |
| Estatísticas    | ✅     | 4 cards de resumo + 5 gráficos Recharts (humor, estresse, desempenho, sono, tela) |
| Meu Perfil      | ✅     | Edição de nome/e-mail, troca de senha, excluir conta                              |

---

## Perfis Comportamentais (K-Means, K=4)

| Cluster | Perfil          | Risco          | Características                                     |
|---------|-----------------|----------------|-----------------------------------------------------|
| 0       | Sob Pressão     | Moderado-Alto  | Sono baixo, tela alta, exercício moderado           |
| 1       | Equilibrado     | Baixo          | Sono alto, exercício elevado, estresse moderado     |
| 2       | Rotina Saudável | Baixo-Moderado | Sono médio, exercício baixo, estresse baixo         |
| 3       | Em Alerta       | Alto           | Sono médio-alto, exercício mínimo, estresse muito alto |

> Este projeto foca na identificação de padrões estatísticos e **não possui** validade diagnóstica psicológica ou médica.

---

## Como Executar Localmente

> **Atenção:** backend, banco de dados, mining-service e Redis já estão em produção no Railway. Para desenvolvimento do **web** ou **mobile**, basta rodar apenas o serviço correspondente — nenhum terminal extra é necessário.

### Pré-requisitos
- Node.js v24+
- Python 3.11+ *(apenas se quiser rodar o mining-service localmente)*
- Docker e Docker Compose *(apenas se quiser rodar o banco localmente)*

### Web
```bash
cd web
npm install
npm run dev           # http://localhost:5173
```

### Mobile
```bash
cd mobile
npm install
npx expo start        # escaneie o QR com Expo Go (nativo) ou abra no browser (web)
```

> No Expo Web (`expo start --web`), o app conecta automaticamente ao backend em produção.

---

### Rodar com backend local (opcional)

Necessário apenas para desenvolver o backend ou testar migrations.

#### 1. Banco de dados
```bash
docker-compose up -d
```

#### 2. Backend
```bash
cd backend
npm install
# Criar backend/.env com as variáveis abaixo
npx prisma migrate deploy
node prisma/seed.js   # opcional — popula com 1.800 registros de teste
npm run dev           # http://localhost:3000
```

#### 3. Mining Service (opcional)
```bash
cd mining-service
pip install -r requirements.txt
python app.py         # http://localhost:5000
```

> Sem `REDIS_URL` no `.env`, o backend usa automaticamente o fallback direto ao mining-service (sem fila).

---

## Variáveis de Ambiente

### backend/.env
```
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/entrementes"
JWT_SECRET=sua_chave_secreta
JWT_EXPIRES_IN=7d
MINING_SERVICE_URL=http://localhost:5000
REDIS_URL=redis://localhost:6379   # opcional — ativa BullMQ; sem ela usa fallback direto
```

### mining-service/.env
```
FLASK_PORT=5000
MODEL_PATH=./modelo_kmeans.pkl
```

---

## Endpoints da API

Base URL local: `http://localhost:3000`
Base URL produção: `https://entrementes-production.up.railway.app`
Documentação interativa: `/docs` (Swagger UI)

| Método | Rota               | Auth | Descrição                                          |
|--------|--------------------|------|----------------------------------------------------|
| POST   | /auth/register     | —    | Criar conta                                        |
| POST   | /auth/login        | —    | Login, retorna JWT                                 |
| GET    | /users/me          | JWT  | Dados do usuário autenticado                       |
| PUT    | /users/me          | JWT  | Atualizar nome, e-mail ou senha                    |
| DELETE | /users/me          | JWT  | Excluir conta                                      |
| POST   | /mood              | JWT  | Criar registro de humor (enfileira classificação)  |
| GET    | /mood              | JWT  | Listar registros do usuário                        |
| GET    | /mood/:id          | JWT  | Buscar registro por ID                             |
| PUT    | /mood/:id          | JWT  | Atualizar registro                                 |
| GET    | /analytics/profile | JWT  | Retorna perfil comportamental classificado         |

---

## Equipe

Desenvolvido por 2 integrantes — março a junho de 2026.

- **Gabriel** — mobile, web, backend, data-analysis, documentação
- **Leonardo** — mobile, web, backend, deploy Railway, mensageria

---

## Vídeo de Demonstração

[![EntreMentes — PI 6º Semestre DSM FATEC Franca 2026](https://img.youtube.com/vi/p0qlAkJlquc/maxresdefault.jpg)](https://youtu.be/p0qlAkJlquc)

▶️ [https://youtu.be/p0qlAkJlquc](https://youtu.be/p0qlAkJlquc)

---

## Figma

[Acessar protótipo](https://www.figma.com/design/t3bPkPFGW4uXckBCziasEx/EntreMentes?node-id=0-1&p=f&t=cpJM06Qzt1sGj8P5-0)
