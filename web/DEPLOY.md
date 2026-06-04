# Deploy do Frontend Web — Vercel

> **Para o Leonardo:** siga este guia para subir o frontend web no Vercel pela sua conta do GitHub.
> Cada push na branch `main` vai atualizar o site automaticamente após isso.

---

## Pré-requisitos

- Conta no GitHub (Leonardo-Cassio) ✅
- Acesso ao repositório `Leonardo-Cassio/EntreMentes` ✅

---

## Passo 1 — Criar conta no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Sign Up**
3. Escolha **Continue with GitHub** — use a conta `Leonardo-Cassio`
4. Autorize o Vercel a acessar seus repositórios

---

## Passo 2 — Importar o repositório

1. No dashboard, clique em **Add New Project**
2. Na lista de repositórios, localize **Leonardo-Cassio/EntreMentes**
3. Clique em **Import**

> Se o repositório não aparecer, clique em **Adjust GitHub App Permissions** e conceda acesso ao repo.

---

## Passo 3 — Configurar o projeto

Na tela de configuração, preencha:

### Root Directory
- Clique em **Edit** ao lado de "Root Directory"
- Digite `web`
- Confirme

### Framework
- O Vercel vai detectar automaticamente como **Vite**
- Build Command: `npm run build` *(já preenchido)*
- Output Directory: `dist` *(já preenchido)*

### Environment Variables
Clique em **Environment Variables** e adicione:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://entrementes-production.up.railway.app` |

---

## Passo 4 — Deploy

1. Clique em **Deploy**
2. Aguarde ~1 minuto
3. O Vercel vai exibir a URL de produção (ex: `entrementes.vercel.app`)

---

## Passo 5 — Personalizar a URL (opcional)

1. No painel do projeto, vá em **Settings → Domains**
2. Clique em **Edit** no domínio gerado automaticamente
3. Troque para algo como `entrementes` → fica `entrementes.vercel.app`
4. Salve

---

## Como funciona após o deploy

- Qualquer **push na branch `main`** dispara um novo deploy automaticamente
- O painel de deploys fica em: `vercel.com/dashboard → entrementes → Deployments`
- Logs de build disponíveis em tempo real na aba **Logs**

---

## Estrutura relevante

```
EntreMentes/
└── web/              ← Root Directory configurado no Vercel
    ├── vercel.json   ← redireciona todas as rotas para index.html (React Router)
    ├── vite.config.js
    ├── package.json
    └── src/
        └── services/
            └── api.js  ← usa VITE_API_URL para apontar para o backend Railway
```

---

## Após o deploy

Atualize o `README.md` do projeto com a URL do frontend web:

```markdown
| Frontend Web | https://entrementes.vercel.app |
```

---

*EntreMentes — PI 6º Semestre | FATEC Franca | DSM 2026*
