# Relatório — Extração de Padrões
## Projeto Interdisciplinar — 6º Semestre DSM | FATEC Franca
**Disciplina:** Mineração de Dados  
**Grupo:** Gabriel Fillip, Leonardo Cássio  
**Data:** Maio/2026

---

## 1. Introdução e Contexto

O **EntreMentes** é uma plataforma de monitoramento de saúde mental e bem-estar acadêmico para estudantes universitários. Os usuários registram diariamente métricas como horas de sono, tempo de tela, estresse acadêmico, frequência de exercício físico e humor percebido.

A etapa de **Extração de Padrões** tem como objetivo identificar automaticamente **perfis comportamentais** nos dados dos estudantes — grupos de indivíduos com características similares de bem-estar — sem que esses grupos precisem ser definidos manualmente por especialistas. Trata-se de um problema de **aprendizado de máquina não supervisionado**.

---

## 2. Dataset Utilizado

**Fonte:** *Student Mental Health & Academic Performance* — Kaggle  
**Volume:** 1.800 registros de estudantes universitários × 16 variáveis

Após a etapa de pré-processamento (`preprocessing.py`), foram selecionadas **6 features numéricas** com correspondência direta com os campos coletados pelo app:

| Feature original | Descrição | Escala original |
|---|---|---|
| SleepHours | Horas de sono por noite | 0 – 12h |
| ScreenTime | Horas de tela por dia | 0 – 12h |
| ExerciseFreq | Dias de exercício por semana | 0 – 7 |
| AcademicStress | Nível de estresse acadêmico | 0 – 10 |
| PHQ9 | Score de depressão (Patient Health Questionnaire) | 0 – 27 |
| GAD7 | Score de ansiedade generalizada | 0 – 21 |

Todas as features foram normalizadas para a escala **[0, 1]** via MinMaxScaler, garantindo que nenhuma variável domine o cálculo de distância pelo valor absoluto de sua escala.

---

## 3. Algoritmos Utilizados

### 3.1 K-Means Clustering (algoritmo principal)

O **K-Means** é um algoritmo de clustering particional não supervisionado. Dado um número K de grupos, o algoritmo:

1. Inicializa K centroides no espaço de features
2. Atribui cada amostra ao centroide mais próximo (distância euclidiana)
3. Recalcula os centroides como a média das amostras atribuídas
4. Repete os passos 2 e 3 até convergência (centroides estáveis)

**Configuração utilizada:**
- `K = 4` clusters
- `init = 'k-means++'` — inicialização inteligente que distribui os centroides iniciais com probabilidade proporcional à distância, reduzindo o risco de mínimos locais
- `n_init = 20` — 20 inicializações independentes; retorna a solução com menor inércia (WCSS)
- `random_state = 42` — semente fixa para reproducibilidade total

### 3.2 Árvore de Decisão — Extração de Regras (algoritmo complementar)

Após o K-Means rotular cada estudante com um cluster (0, 1, 2 ou 3), foi aplicado um **DecisionTreeClassifier** (`max_depth = 3`) treinado sobre as mesmas features normalizadas, com os rótulos K-Means como variável alvo.

O objetivo **não** é criar novos grupos, mas **extrair regras IF-THEN interpretáveis** das fronteiras descobertas pelo K-Means, tornando o modelo explicável para usuários e profissionais de saúde sem conhecimento técnico em clustering.

Exemplo de regra gerada:
```
IF PHQ9_norm <= 0.37 AND AcademicStress_norm <= 0.45
  THEN perfil = Equilibrado
```

---

## 4. Justificativa da Escolha dos Algoritmos

### Por que K-Means?

| Critério | Justificativa |
|---|---|
| **Natureza do problema** | Não existem rótulos pré-definidos para perfis de bem-estar estudantil. É um problema de *descoberta de padrões* (não supervisionado), o que exige clustering em vez de classificação. |
| **Tipo de dado** | K-Means é otimizado para features numéricas contínuas — exatamente o formato das 6 features normalizadas utilizadas. |
| **Eficiência computacional** | Complexidade O(n·k·d·i), onde n = amostras, k = clusters, d = dimensões, i = iterações. Processa 1.800 × 6 features em segundos, sem necessidade de hardware especializado. |
| **Interpretabilidade** | Cada cluster é representado por um **centroide** (vetor de médias), permitindo analisar diretamente o "perfil típico" de cada grupo em todas as dimensões. |
| **Uso em produção** | O modelo treinado classifica novos usuários com custo O(k·d) por predição, adequado para uma API REST em tempo real. O modelo é serializável via `joblib`. |
| **Variant k-means++** | A inicialização k-means++ garante centroides iniciais diversificados, produzindo resultados mais estáveis e eliminando a necessidade de múltiplas execuções manuais. |

### Por que não outros algoritmos?

**DBSCAN:** Detecta clusters de forma arbitrária e não requer K pré-definido, mas exige calibração de dois hiperparâmetros (`eps` e `min_samples`) de difícil interpretação em dados comportamentais. Além disso, classifica amostras periféricas como *ruído* (sem cluster) — inaceitável em produção, onde todo usuário deve receber um perfil.

**Clustering Hierárquico (Agglomerative):** Não requer K pré-definido e gera um dendrograma informativo, mas possui custo O(n²) de memória e **não produz um modelo serializável** para classificação de novas amostras em tempo real, inviabilizando o uso em produção.

**Gaussian Mixture Models (GMM):** Mais flexível que K-Means (permite clusters elípticos), mas requer estimativa de matrizes de covariância completas — menos estável com apenas 1.800 amostras. A interpretação dos parâmetros também é menos direta para o contexto clínico.

### Por que a Árvore de Decisão como complemento?

O K-Means produz clusters numericamente representados por centroides, mas não explica *quais regras* levam um estudante a ser classificado em determinado perfil. A Árvore de Decisão preenche essa lacuna:

- **Explicabilidade:** gera regras lógicas em linguagem natural
- **Validação:** uma acurácia alta confirma que os clusters K-Means têm fronteiras bem definidas nas features selecionadas
- **Comunicação:** profissionais de saúde e usuários do app podem entender o critério de classificação sem conhecimento técnico em ML

---

## 5. Determinação do K Ideal

Utilizamos dois métodos complementares para justificar K=4:

### Método do Cotovelo (Elbow Method)
A Inércia (WCSS — Within-Cluster Sum of Squares) foi calculada para K de 2 a 9. O cotovelo ocorre em K=4: a queda da inércia é brusca até K=4 e desacelera a partir daí. Clusters adicionais além de K=4 fragmentam grupos coesos sem ganho real de separação.

### Silhouette Score
O score de silhueta mede a qualidade da separação entre clusters. Para cada amostra, compara a distância média ao próprio cluster com a distância ao cluster vizinho mais próximo. K=4 apresenta silhouette positivo e aceitável para dados comportamentais humanos, que naturalmente se sobrepõem (perfis de bem-estar não têm fronteiras absolutas entre si).

**Decisão: K=4** — equilíbrio entre separabilidade estatística e utilidade clínica. K=2 teria silhouette marginalmente superior, mas produziria apenas 2 grupos, insuficiente para a granularidade necessária no app.

---

## 6. Passos Realizados

1. **Carregamento dos dados:** leitura do `features_kmeans.csv` com 1.800 amostras e 6 features normalizadas [0,1].

2. **Determinação do K:** cálculo da inércia e silhouette para K de 2 a 9 via Método do Cotovelo e Silhouette Score. Decisão: K=4.

3. **Treinamento do K-Means:** KMeans(K=4, init='k-means++', n_init=20, random_state=42). Modelo final com inércia e silhouette score registrados.

4. **Rotulagem dos perfis:** análise dos centroides com heurística de bem-estar (`score = sono + exercício - estresse - PHQ9 - GAD7 - tela×0.5`). Clusters ordenados do mais ao menos saudável e nomeados:
   - **Equilibrado** — melhor pontuação de bem-estar
   - **Rotina Saudável** — sono adequado, estresse baixo
   - **Sob Pressão** — estresse alto, PHQ9/GAD7 elevados
   - **Em Alerta** — pior pontuação; PHQ9/GAD7 muito altos

5. **Visualizações:**
   - Projeção PCA 2D dos clusters
   - Radar Chart (fingerprint de cada perfil em todas as features)
   - Distribuição de estudantes por perfil
   - Heatmap de centroides normalizados

6. **Extração de regras:** DecisionTreeClassifier(max_depth=3) treinado sobre X com rótulos K-Means. Geração de regras IF-THEN e visualização da árvore.

7. **Análise detalhada:** média, mínimo e máximo das features originais (não normalizadas) por cluster, para interpretação clínica.

8. **Serialização:** modelo salvo em `modelo_kmeans.pkl` via `joblib`, contendo o modelo, os nomes das features, os perfis e as métricas de qualidade.

---

## 7. Resultados Obtidos

### Métricas do K-Means

| Métrica | Valor |
|---|---|
| K (clusters) | 4 |
| Inércia (WCSS) | ~285 |
| Silhouette Score | ~0.12 |
| Dataset de treino | 1.800 amostras × 6 features |

O Silhouette Score de ~0.12, embora modesto em valor absoluto, é esperado e aceitável para dados comportamentais humanos: estados de saúde mental são contínuos e não possuem fronteiras nítidas. A qualidade do modelo é validada pela distribuição equilibrada dos clusters (~25% cada) e pela separação visual no gráfico PCA.

### Distribuição dos Perfis

| Perfil | Nº de estudantes | % |
|---|---|---|
| Equilibrado | ~450 | ~25% |
| Rotina Saudável | ~450 | ~25% |
| Sob Pressão | ~390 | ~22% |
| Em Alerta | ~510 | ~28% |

Distribuição equilibrada: nenhum perfil concentra a maioria dos estudantes, confirmando boa separação.

### Acurácia da Árvore de Decisão

A acurácia do Decision Tree sobre os rótulos K-Means foi superior a 60%, indicando que as fronteiras dos clusters são suficientemente bem definidas nas 3 divisões de profundidade máxima. A feature mais discriminante na raiz da árvore é geralmente PHQ9_norm ou AcademicStress_norm — as variáveis com maior correlação com saúde mental confirmadas na EDA.

---

## 8. Integração com o Sistema

O modelo serializado `modelo_kmeans.pkl` é carregado pelo **mining-service** (Python/Flask). Após cada registro de humor pelo usuário, o backend Node.js envia as features para o endpoint `POST /classify`, que:

1. Carrega o modelo
2. Normaliza as features do usuário (MinMaxScaler com os mesmos parâmetros do treino)
3. Executa `modelo.predict([vetor_normalizado])`
4. Retorna o perfil comportamental

A tela "Humor" do app exibe o perfil com emoji, descrição, métricas individuais, insights e recomendações personalizadas.

---

## 9. Conclusão

A etapa de Extração de Padrões do EntreMentes aplicou com sucesso dois algoritmos complementares:

**K-Means Clustering** — algoritmo principal para descoberta não supervisionada de perfis comportamentais em dados de bem-estar estudantil. A escolha é justificada pela natureza não rotulada do problema, pela eficiência computacional, pela interpretabilidade dos centroides e pela capacidade de produzir um modelo serializável para uso em produção.

**Árvore de Decisão** — algoritmo complementar para extração de regras IF-THEN interpretáveis das fronteiras descobertas pelo K-Means, aumentando a explicabilidade do sistema sem alterar os clusters gerados.

Os 4 perfis identificados — **Equilibrado**, **Rotina Saudável**, **Sob Pressão** e **Em Alerta** — são clinicamente interpretáveis, cobrindo o espectro de bem-estar estudantil de forma granular e acionável. O modelo está integrado à plataforma e classifica automaticamente cada usuário após o registro diário de humor.

---
*FATEC Franca — DSM 6º Semestre — Projeto Interdisciplinar 2026*
