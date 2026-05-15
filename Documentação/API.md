# EntreMentes — Documentação da API REST

**Versão:** 1.0  
**Base URL (local):** `http://localhost:3000`  
**Protocolo:** HTTP/REST  
**Formato:** JSON (`Content-Type: application/json`)

---

## Padrão de resposta

Todos os endpoints retornam o mesmo envelope:

```json
{
  "success": true,
  "data": { },
  "message": "Mensagem opcional"
}
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `success` | boolean | `true` em caso de sucesso, `false` em caso de erro |
| `data` | object \| array \| null | Payload da resposta (null em erros) |
| `message` | string \| null | Mensagem descritiva (null quando não necessário) |

---

## Autenticação

Endpoints protegidos exigem o token JWT no header:

```
Authorization: Bearer <token>
```

O token é obtido no endpoint `POST /auth/login` e expira em 7 dias.

---

## Endpoints

### Auth

#### `POST /auth/register`

Cria uma nova conta de usuário.

**Autenticação:** Não requerida

**Request body:**

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | string | Sim | Nome completo do usuário |
| `email` | string | Sim | E-mail único |
| `password` | string | Sim | Senha (armazenada com bcrypt) |

**Resposta 201 — Criado com sucesso:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@email.com",
    "createdAt": "2026-05-15T20:00:00.000Z"
  },
  "message": "Usuário criado com sucesso"
}
```

**Erros:**

| Status | Situação |
|--------|----------|
| 409 | E-mail já cadastrado |
| 400 | Campos ausentes ou inválidos |

---

#### `POST /auth/login`

Autentica o usuário e retorna um token JWT.

**Autenticação:** Não requerida

**Request body:**

```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta 200:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "João Silva",
      "email": "joao@email.com"
    }
  },
  "message": "Login realizado com sucesso"
}
```

**Erros:**

| Status | Situação |
|--------|----------|
| 401 | Credenciais inválidas |

---

### Usuário

#### `GET /users/me`

Retorna os dados do usuário autenticado.

**Autenticação:** Requerida

**Resposta 200:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@email.com",
    "createdAt": "2026-05-15T20:00:00.000Z",
    "updatedAt": "2026-05-15T20:00:00.000Z"
  },
  "message": null
}
```

**Erros:**

| Status | Situação |
|--------|----------|
| 401 | Token ausente ou inválido |
| 404 | Usuário não encontrado |

---

#### `PUT /users/me`

Atualiza nome e/ou e-mail do usuário autenticado. Apenas os campos enviados são alterados.

**Autenticação:** Requerida

**Request body (todos opcionais):**

```json
{
  "name": "João Atualizado",
  "email": "novo@email.com"
}
```

**Resposta 200:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Atualizado",
    "email": "novo@email.com",
    "updatedAt": "2026-05-15T21:00:00.000Z"
  },
  "message": "Perfil atualizado com sucesso"
}
```

**Erros:**

| Status | Situação |
|--------|----------|
| 401 | Token ausente ou inválido |
| 400 | E-mail já em uso por outro usuário |

---

#### `DELETE /users/me`

Remove permanentemente a conta e todos os registros do usuário autenticado.

**Autenticação:** Requerida

**Resposta 200:**

```json
{
  "success": true,
  "data": null,
  "message": "Conta removida com sucesso"
}
```

---

### Registros de Humor (`/mood`)

#### `POST /mood`

Cria um novo registro de bem-estar. Após salvar, dispara automaticamente a classificação comportamental em segundo plano.

**Autenticação:** Requerida

**Request body:**

```json
{
  "nivelHumor": 4,
  "tempoTela": 6.5,
  "duracaoSono": 7.0,
  "atividadeFisica": 3.0,
  "nivelEstresse": "Medio",
  "ansiedadeAntesProva": false,
  "desempenhoAcademico": "Mesmo",
  "nota": "Me senti bem hoje."
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `nivelHumor` | integer | Sim | Escala de 1 (muito ruim) a 5 (excelente) |
| `tempoTela` | float | Sim | Horas de tela por dia |
| `duracaoSono` | float | Sim | Horas de sono por noite |
| `atividadeFisica` | float | Sim | Horas de atividade física por semana |
| `nivelEstresse` | string | Sim | `"Baixo"`, `"Medio"` ou `"Alto"` |
| `ansiedadeAntesProva` | boolean | Sim | Se sentiu ansiedade antes de provas |
| `desempenhoAcademico` | string | Sim | `"Melhorou"`, `"Mesmo"` ou `"Piorou"` |
| `nota` | string | Não | Anotação livre do usuário |

**Resposta 201:**

```json
{
  "success": true,
  "data": {
    "id": "7f3e9c2a-...",
    "userId": "550e8400-...",
    "nivelHumor": 4,
    "tempoTela": 6.5,
    "duracaoSono": 7.0,
    "atividadeFisica": 3.0,
    "nivelEstresse": "Medio",
    "ansiedadeAntesProva": false,
    "desempenhoAcademico": "Mesmo",
    "nota": "Me senti bem hoje.",
    "createdAt": "2026-05-15T20:30:00.000Z"
  },
  "message": "Registro de humor criado com sucesso"
}
```

**Erros:**

| Status | Situação |
|--------|----------|
| 401 | Token ausente ou inválido |
| 400 | Campos obrigatórios ausentes |

---

#### `GET /mood`

Lista todos os registros do usuário autenticado em ordem cronológica decrescente.

**Autenticação:** Requerida

**Query params (todos opcionais):**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `from` | string (ISO 8601) | Data inicial do filtro (ex: `2026-05-01`) |
| `to` | string (ISO 8601) | Data final do filtro (ex: `2026-05-15`) |
| `limit` | integer | Número máximo de registros retornados |

**Exemplo:** `GET /mood?from=2026-05-01&limit=10`

**Resposta 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "7f3e9c2a-...",
      "userId": "550e8400-...",
      "nivelHumor": 4,
      "tempoTela": 6.5,
      "duracaoSono": 7.0,
      "atividadeFisica": 3.0,
      "nivelEstresse": "Medio",
      "ansiedadeAntesProva": false,
      "desempenhoAcademico": "Mesmo",
      "nota": "Me senti bem hoje.",
      "createdAt": "2026-05-15T20:30:00.000Z"
    }
  ],
  "message": null
}
```

---

#### `GET /mood/:id`

Retorna um registro específico do usuário autenticado.

**Autenticação:** Requerida

**Path params:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID do registro |

**Resposta 200:** mesmo shape de um item do array acima.

**Erros:**

| Status | Situação |
|--------|----------|
| 404 | Registro não encontrado ou pertence a outro usuário |

---

#### `PUT /mood/:id`

Atualiza um registro existente. Apenas os campos enviados são alterados.

**Autenticação:** Requerida

**Request body (todos opcionais):**

```json
{
  "nivelHumor": 3,
  "nota": "Dia mais difícil que o esperado."
}
```

**Resposta 200:**

```json
{
  "success": true,
  "data": { /* registro atualizado */ },
  "message": "Registro atualizado com sucesso"
}
```

**Erros:**

| Status | Situação |
|--------|----------|
| 404 | Registro não encontrado ou pertence a outro usuário |
| 400 | Dados inválidos |

---

#### `DELETE /mood/:id`

Remove um registro do usuário autenticado.

**Autenticação:** Requerida

**Resposta 200:**

```json
{
  "success": true,
  "data": null,
  "message": "Registro removido com sucesso"
}
```

---

### Análise Comportamental

#### `GET /analytics/profile`

Retorna o perfil comportamental do usuário gerado pelo modelo K-Means, junto com médias dos últimos 30 registros, insights e recomendações personalizadas.

O perfil é atualizado automaticamente cada vez que o usuário cria um novo registro de humor (`POST /mood`).

**Autenticação:** Requerida

**Resposta 200:**

```json
{
  "success": true,
  "data": {
    "nomePerfil": "Rotina Saudável",
    "clusterId": 2,
    "nivelRisco": "Baixo",
    "emoji": "🟡",
    "corRisco": "#FDCB6E",
    "bgRisco": "#FFFBEE",
    "justificativa": "Seu padrão indica estabilidade geral. O sono está adequado e o estresse controlado, mas adicionar mais atividade física pode elevar ainda mais seu bem-estar.",
    "medias": {
      "duracaoSono": 6.8,
      "tempoTela": 7.2,
      "atividadeFisica": 2.1
    },
    "insights": [
      "Tempo de tela acima do recomendado (ideal: até 6h/dia)",
      "Atividade física abaixo do ideal (recomendado: 3h+/semana)"
    ],
    "recomendacoes": [
      "Reduza o tempo de tela 1h antes de dormir",
      "Inclua pelo menos 30 minutos de caminhada diária"
    ],
    "geradoEm": "2026-05-15T20:30:05.000Z"
  },
  "message": null
}
```

**Campos da resposta:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nomePerfil` | string | Nome do perfil: `"Equilibrado"`, `"Rotina Saudável"`, `"Sob Pressão"` ou `"Em Alerta"` |
| `clusterId` | integer | ID do cluster K-Means (0–3) |
| `nivelRisco` | string | Nível de risco: `"Baixo"`, `"Moderado"` ou `"Alto"` |
| `emoji` | string | Emoji visual associado ao perfil |
| `corRisco` | string | Cor hex para destaque visual |
| `bgRisco` | string | Cor hex de fundo para cards |
| `justificativa` | string | Texto explicativo do perfil |
| `medias.duracaoSono` | float | Média de horas de sono (últimos 30 registros) |
| `medias.tempoTela` | float | Média de horas de tela (últimos 30 registros) |
| `medias.atividadeFisica` | float | Média de horas de atividade física (últimos 30 registros) |
| `insights` | string[] | Pontos de atenção identificados pelo modelo |
| `recomendacoes` | string[] | Sugestões de melhoria personalizadas |
| `geradoEm` | string (ISO 8601) | Data/hora da última classificação |

**Erros:**

| Status | Situação |
|--------|----------|
| 401 | Token ausente ou inválido |
| 404 | Perfil ainda não gerado (usuário não possui registros classificados) |

> **Nota:** O perfil 404 é esperado para usuários recém-cadastrados. Basta criar ao menos um registro via `POST /mood` para que a classificação seja disparada automaticamente.

---

## Os 4 perfis comportamentais

| Perfil | Risco | Características |
|--------|-------|-----------------|
| Equilibrado | Baixo | Sono adequado, exercício frequente, estresse controlado |
| Rotina Saudável | Baixo | Sono estável, pouca atividade física, estresse baixo |
| Sob Pressão | Moderado | Sono reduzido, alto tempo de tela, estresse elevado |
| Em Alerta | Alto | Estresse acadêmico muito elevado, baixa atividade física, sinais de ansiedade |

> **Aviso:** Este sistema não substitui acompanhamento profissional de saúde mental.

---

## Erros comuns

| Status | Significado |
|--------|-------------|
| 400 | Requisição inválida — verifique os campos obrigatórios |
| 401 | Não autenticado — token JWT ausente, expirado ou inválido |
| 404 | Recurso não encontrado |
| 409 | Conflito — e-mail já cadastrado |
| 500 | Erro interno do servidor |

---

## Fluxo típico de uso

```
1. POST /auth/register       → cria conta
2. POST /auth/login          → obtém token JWT
3. POST /mood                → registra humor do dia (dispara classificação)
4. GET  /analytics/profile   → consulta perfil comportamental gerado
5. GET  /mood                → consulta histórico de registros
```
