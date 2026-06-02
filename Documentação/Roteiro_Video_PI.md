# Roteiro — Vídeo Demonstração PI 6º Semestre
## EntreMentes | FATEC Franca — DSM 2026
**Duração total: ~4:50 min | Prazo máximo: 5 min**

---

## Divisão de papéis

| Quem | Papel |
|------|-------|
| **Leonardo** | Fala — apresentação, contexto, nuvem, mineração, encerramento |
| **Gabriel** | Mostra — demonstra o app web e mobile na tela |

> **Como gravar:** Leonardo fala olhando pra câmera (ou narrando enquanto a tela aparece).
> Gabriel compartilha a tela e navega pelo sistema sem precisar falar — ou fala só o essencial
> nos momentos indicados. OBS Studio resolve tudo: grava tela + câmera ao mesmo tempo.

---

---

## BLOCO 1 — Abertura com câmera (~0:30)
> **[Câmera ligada. Ambos aparecem. Leonardo fala.]**

**Leonardo:**
> "Olá! Somos Gabriel Fillip e Leonardo Cássio, alunos do 6º semestre de
> Desenvolvimento de Software Multiplataforma da FATEC Franca.
> Esse é o vídeo de demonstração do nosso Projeto Interdisciplinar: o **EntreMentes**."
---

## BLOCO 2 — Contexto e problema (~0:35)

**Leonardo:**
> "A saúde mental de estudantes universitários é um tema sério e muitas vezes ignorado.
> Muitos passam o semestre inteiro sem perceber que estão dormindo mal, acumulando
> estresse e abandonando hábitos saudáveis — fatores diretamente ligados ao rendimento acadêmico.
>
> O EntreMentes resolve isso de forma simples: o estudante registra seu humor e hábitos
> diariamente pelo celular ou pelo navegador, e o sistema usa **Mineração de Dados** para
> identificar automaticamente o perfil comportamental desse estudante e devolver insights
> personalizados.
>
> O Gabriel vai mostrar o sistema agora."

---

## BLOCO 3 — Demo Web (~1:40)
> **[Gabriel assume a tela. Navegador aberto em `https://entrementes-production.up.railway.app/login`.]**

---

### 3.1 — Login (~0:12)

> **[Gabriel: digitar e-mail e senha → clicar em Entrar]**

**Gabriel:**
> "Aqui está a tela de login em produção. A autenticação é feita com JWT —
> o sistema gera um token seguro e redireciona pro Dashboard."

---

### 3.2 — Dashboard (~0:28)

> **[Gabriel: tela do Dashboard carregada. Apontar o mouse para os cards de métricas, depois para os gráficos.]**

**Gabriel:**
> "Esse é o Dashboard. O estudante vê de imediato o humor médio dos últimos 30 dias,
> quantos dias registrou e a sequência atual. Os gráficos mostram a evolução do humor
> ao longo do tempo e a distribuição por dia da semana — tudo com dados reais da API."

> **[Gabriel: clicar no card 'Seu Perfil']**

**Gabriel:**
> "Ao clicar no card de perfil, abre o resultado da Mineração de Dados: o perfil
> comportamental do usuário, o nível de risco, as médias de sono, tempo de tela e exercício,
> e os insights e recomendações personalizadas — gerados automaticamente pelo K-Means."

> **[Gabriel: mostrar o modal por 5 segundos → fechar]**

---

### 3.3 — Registro Diário (~0:22)

> **[Gabriel: clicar em 'Registro Diário' na sidebar → preencher rapidamente os campos → clicar em Salvar]**

**Gabriel:**
> "No Registro Diário, o estudante seleciona o humor com emoji e ajusta sliders de
> sono, tempo de tela, atividade física, estresse e desempenho acadêmico.
> Ao salvar, o sistema dispara em background a classificação no Serviço de Mineração
> para atualizar o perfil do usuário automaticamente."

---

### 3.4 — Histórico (~0:12)

> **[Gabriel: clicar em Histórico na sidebar → expandir um card]**

**Gabriel:**
> "O Histórico lista todos os registros em ordem cronológica.
> Clicando no card, o estudante vê todos os detalhes daquele dia."

---

### 3.5 — Estatísticas (~0:14)

> **[Gabriel: clicar em Estatísticas → mostrar cards de resumo e gráficos]**

**Gabriel:**
> "A página de Estatísticas traz uma análise agregada: médias de sono, tela e atividade,
> e cinco gráficos — distribuição de humor, estresse, desempenho acadêmico,
> sono versus tempo de tela, e evolução da atividade física."

---

### 3.6 — Perfil e encerramento web (~0:12)

> **[Gabriel: clicar em 'Meu Perfil' → mostrar os campos de edição rapidamente]**

**Gabriel:**
> "O estudante também pode editar o nome, e-mail e senha diretamente pelo perfil.
> Isso encerra a demo web — agora o mesmo sistema no celular."

---

## BLOCO 4 — Demo Mobile (~1:05)
> **[Gabriel muda a tela para o celular — gravação de tela do Android/iOS via cabo ou espelhamento.]**

---

### 4.1 — Login e Dashboard mobile (~0:20)

> **[Gabriel: mostrar tela de Login → fazer login → Dashboard mobile]**

**Gabriel:**
> "O app mobile foi desenvolvido com React Native e Expo SDK 54 — funciona em Android e iOS.
> Mesma experiência de login, com animação de entrada e gradiente.
> O Dashboard mobile traz as mesmas métricas do web."

---

### 4.2 — Fluxo humor → Registro (~0:20)

> **[Gabriel: clicar num emoji no Dashboard → modal aparece → clicar 'Sim, completar registro' → tela de Registro Diário com slider]**

**Gabriel:**
> "O estudante seleciona o humor direto pelos emojis no Dashboard.
> O sistema pergunta se quer completar o registro — e já abre a tela de Registro Diário
> com o humor pré-selecionado. Os sliders funcionam de forma nativa."

> **[Gabriel: salvar o registro]**

---

### 4.3 — Tela Humor / Perfil (~0:18)

> **[Gabriel: navegar para a aba 'Humor' → fazer scroll lento pela tela]**

**Gabriel:**
> "A tela de Humor é exclusiva do mobile: exibe o perfil comportamental completo —
> nome do perfil, nível de risco com cor dinâmica, médias em cards,
> e a lista de insights e recomendações personalizadas."

---

### 4.4 — Histórico e Estatísticas mobile (~0:07)

> **[Gabriel: navegar rapidamente por Histórico → Estatísticas, 3 segundos cada]**

**Gabriel:**
> "Histórico e Estatísticas também disponíveis no app."

---

## BLOCO 5 — Nuvem e API (~0:38)
> **[Gabriel abre o navegador. Leonardo narra.]**

---

### 5.1 — Railway (~0:15)

> **[Gabriel: abrir o dashboard do Railway e mostrar os 3 serviços — ou, se não tiver acesso fácil, abrir a URL do backend `https://entrementes-production.up.railway.app` e mostrar que está respondendo]**

**Gabriel:**
> "Toda a infraestrutura está implantada no Railway, uma plataforma em nuvem.
> São três serviços independentes: a API REST em Node.js, o banco de dados
> PostgreSQL gerenciado, e o Serviço de Mineração em Python e Flask.
> Toda comunicação é via HTTPS. Variáveis sensíveis como o JWT Secret
> e a connection string do banco ficam nas variáveis de ambiente — nunca no código."

---

### 5.2 — Swagger UI (~0:23)

> **[Gabriel: abrir `https://entrementes-production.up.railway.app/docs` → expandir o endpoint `POST /mood`]**

**Gabriel:**
> "A API tem documentação interativa via Swagger UI — padrão OpenAPI 3.0.
> Aqui estão todos os endpoints documentados: autenticação, registros de humor,
> gerenciamento de usuário e analytics de perfil.
> Qualquer desenvolvedor pode visualizar e testar os endpoints diretamente no navegador."

---

## BLOCO 6 — Mineração de Dados (~0:28)
> **[Gabriel: abrir VS Code na pasta `data-analysis/graficos/` e mostrar os PNGs — especialmente `07_clusters_pca.png` e `08_perfis_radar.png`. Ou mostrar o modal de perfil aberto no site como ilustração.]**

**Leonardo:**
> "Na Mineração de Dados, utilizamos um dataset público do Kaggle com 1.800 registros
> de estudantes universitários. Após o pré-processamento, aplicamos o algoritmo
> K-Means com K igual a 4, validado pelo Método do Cotovelo e pelo Silhouette Score.
>
> O modelo identificou 4 perfis comportamentais: Equilibrado, Rotina Saudável,
> Sob Pressão e Em Alerta. Além disso, aplicamos uma Árvore de Decisão para extrair
> regras interpretáveis dos clusters — tornando o modelo explicável para o usuário.
>
> O modelo está serializado e servido via Flask em produção, classificando cada
> estudante em tempo real após o registro diário."

---

## BLOCO 7 — Encerramento (~0:22)
> **[Câmera ligada. Ambos aparecem. Leonardo fala, Gabriel aparece ao lado.]**

**Leonardo:**
> "O EntreMentes está completamente funcional em produção: web, mobile,
> API documentada, banco de dados na nuvem e Mineração de Dados integrada.
> O código completo está disponível no GitHub."


**Leonardo:**
> "Lembrando que o sistema é informativo e não substitui acompanhamento
> profissional de saúde mental. 

---

---

## Checklist antes de gravar

- [ ] Fazer login em `https://entrementes-production.up.railway.app` e confirmar que carrega
- [ ] Ter uma conta com pelo menos **5 registros salvos** para o perfil K-Means aparecer preenchido
- [ ] App mobile rodando no celular (Expo Go) ou emulador com espelhamento de tela ligado
- [ ] Swagger UI carregando: `https://entrementes-production.up.railway.app/docs`
- [ ] Gráficos abertos no VS Code como backup: `data-analysis/graficos/`
- [ ] OBS configurado: cena com "Captura de Tela" + "Câmera" (pip no canto)
- [ ] Testar microfone — ambiente silencioso
- [ ] Cronômetro visível para controlar os 5 minutos

## Checklist pós-gravação

- [ ] Editar: cortar silêncios, ajustar volume
- [ ] Publicar no YouTube como **Público**
- [ ] **Título:** `EntreMentes — PI 6º Semestre DSM FATEC Franca 2026`
- [ ] **Descrição:**
  ```
  Demonstração do Projeto Interdisciplinar do 6º semestre — DSM FATEC Franca.

  EntreMentes: plataforma de monitoramento de saúde mental e bem-estar acadêmico.
  Tecnologias: React, React Native, Expo SDK 54, Node.js, Express, Prisma,
  PostgreSQL, Python, Flask, scikit-learn, Railway.

  Grupo: Gabriel Fillip e Leonardo Cássio
  Repositório: https://github.com/Leonardo-Cassio/EntreMentes

  ⚠️ Este sistema é informativo e não substitui acompanhamento profissional de saúde mental.
  ```
- [ ] Copiar o link do YouTube
- [ ] Colar o link no `README.md` do repositório (seção de vídeo)
- [ ] Preencher formulário de entrega: https://forms.office.com/r/nknRMxzwzN

---

*EntreMentes — PI 6º Semestre | FATEC Franca | DSM 2026*
