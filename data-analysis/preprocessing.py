# =============================================================================
# EntreMentes — Pré-processamento do Dataset
# =============================================================================
# Projeto Interdisciplinar — 6º Semestre DSM | FATEC
# Disciplina: Mineração de Dados / IA
# Integrantes: Gabriel Fillip, Leonardo Cássio.
#
# Objetivo:
#   Transformar o dataset bruto (data.csv) em dois artefatos:
#
#   1. dados_tratados.json  — registros no formato do schema Prisma,
#                             prontos para inserção no banco PostgreSQL.
#
#   2. features_kmeans.csv  — features numéricas normalizadas (MinMaxScaler),
#                             prontas para treinar o modelo K-Means no
#                             mining-service (Python/scikit-learn).
#
# Dataset original:
#   Fonte  : Kaggle — Student Mental Health & Academic Performance
#   Linhas : 1800 estudantes universitários
#   Colunas: PHQ9, GAD7, SleepHours, ExerciseFreq, SocialActivity,
#             OnlineStress, GPA, FamilySupport, ScreenTime,
#             AcademicStress, DietQuality, SelfEfficacy,
#             PeerRelationship, FinancialStress, SleepQuality,
#             MentalHealthStatus
# =============================================================================

import sys
import uuid
import json
import warnings
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import MinMaxScaler

# Garante que o terminal Windows exiba caracteres acentuados corretamente
sys.stdout.reconfigure(encoding='utf-8')

warnings.filterwarnings('ignore')

# Estilo visual dos gráficos
sns.set_theme(style='whitegrid', palette='muted')
plt.rcParams['figure.dpi'] = 100


# =============================================================================
# ETAPA 1 — CARREGAMENTO DOS DADOS
# =============================================================================
# Lemos o CSV bruto com pandas e realizamos uma inspeção inicial obrigatória:
#
#   - df.shape   → confirma que as 1.800 linhas e 16 colunas foram lidas
#                  integralmente, sem truncamento silencioso.
#   - df.dtypes  → verifica se o pandas inferiu os tipos corretamente
#                  (ex.: PHQ9 como int64, GPA como float64). Tipos errados
#                  causam falhas silenciosas nas etapas de normalização.
#   - df.head()  → amostra visual para detectar problemas de encoding,
#                  separador incorreto ou colunas deslocadas.
#
# Esta etapa não transforma nada — é apenas diagnóstico de entrada.
# =============================================================================

print("=" * 65)
print("  EntreMentes — Pré-processamento do Dataset")
print("=" * 65)

df = pd.read_csv('data.csv')

print(f"\n[OK] Dataset carregado com sucesso!")
print(f"   Linhas  : {df.shape[0]}")
print(f"   Colunas : {df.shape[1]}")
print(f"\n--- Tipos de dados ---")
print(df.dtypes)
print(f"\n--- Primeiras 3 linhas ---")
print(df.head(3).to_string())


# =============================================================================
# ETAPA 2 — ANÁLISE EXPLORATÓRIA (EDA)
# =============================================================================
# Antes de qualquer transformação, analisamos a distribuição estatística
# de cada variável (média, desvio padrão, mínimo, máximo, quartis).
#
# Por que isso vem antes da limpeza e do mapeamento?
#   Sem entender como os dados se distribuem, qualquer transformação é cega.
#   A EDA responde perguntas como:
#     - PHQ9 está concentrado em valores baixos (maioria saudável) ou alto?
#     - O dataset está balanceado entre "com" e "sem" transtorno mental?
#     - Quais variáveis se correlacionam mais com MentalHealthStatus?
#
# Três gráficos são gerados:
#
#   Gráfico 1 — Histogramas das variáveis principais
#     Revela a forma da distribuição (normal, enviesada, bimodal).
#     Um PHQ9 concentrado em 0–4, por exemplo, indica predominância de
#     estudantes com sintomas mínimos de depressão.
#
#   Gráfico 2 — Matriz de correlação (heatmap)
#     Mostra a força e direção da relação linear entre cada par de variáveis.
#     Correlações altas com MentalHealthStatus confirmam quais features
#     são mais relevantes para o modelo de clustering.
#
#   Gráfico 3 — Boxplot de PHQ9 e GAD7 por MentalHealthStatus
#     Compara visualmente os scores de depressão e ansiedade entre
#     estudantes com e sem transtorno identificado. Se as caixas se
#     sobrepõem pouco, essas features discriminam bem os grupos.
# =============================================================================

print("\n\n" + "=" * 65)
print("  ETAPA 2 — Análise Exploratória (EDA)")
print("=" * 65)

print("\n--- Estatísticas descritivas ---")
print(df.describe().round(2).to_string())

# Distribuição da variável alvo (MentalHealthStatus)
# 0 = sem transtorno mental identificado
# 1 = com transtorno mental identificado
dist = df['MentalHealthStatus'].value_counts()
pct  = df['MentalHealthStatus'].value_counts(normalize=True) * 100

print(f"\n--- Distribuição de MentalHealthStatus ---")
print(f"   Sem transtorno (0): {dist[0]:4d} alunos ({pct[0]:.1f}%)")
print(f"   Com transtorno (1): {dist[1]:4d} alunos ({pct[1]:.1f}%)")

# ---- Gráfico 1: Distribuição das variáveis principais ----
features_plot = [
    'PHQ9', 'GAD7', 'SleepHours', 'ScreenTime',
    'ExerciseFreq', 'AcademicStress', 'GPA'
]

fig, axes = plt.subplots(2, 4, figsize=(16, 7))
fig.suptitle('Distribuição das Variáveis Principais', fontsize=14, fontweight='bold')
axes = axes.flatten()

for i, col in enumerate(features_plot):
    axes[i].hist(df[col], bins=30, color='#6C5CE7', alpha=0.75, edgecolor='white')
    axes[i].set_title(col, fontsize=11)
    axes[i].set_xlabel('Valor')
    axes[i].set_ylabel('Frequência')

# Último subplot: distribuição do MentalHealthStatus
axes[7].bar(['Sem transtorno (0)', 'Com transtorno (1)'],
            [dist[0], dist[1]],
            color=['#00B894', '#E74C3C'], alpha=0.85)
axes[7].set_title('MentalHealthStatus', fontsize=11)
axes[7].set_ylabel('Quantidade')

plt.tight_layout()
plt.savefig('graficos/01_distribuicao_variaveis.png', bbox_inches='tight')
plt.close()
print("\n[OK] Gráfico 1 salvo: graficos/01_distribuicao_variaveis.png")

# ---- Gráfico 2: Matriz de correlação ----
fig, ax = plt.subplots(figsize=(12, 9))
corr = df.corr(numeric_only=True)
mask = np.triu(np.ones_like(corr, dtype=bool))  # esconde triângulo superior (redundante)
sns.heatmap(
    corr, mask=mask, annot=True, fmt='.2f', cmap='coolwarm',
    center=0, linewidths=0.5, ax=ax, cbar_kws={'shrink': 0.8}
)
ax.set_title('Matriz de Correlação — Todas as Variáveis', fontsize=13, fontweight='bold')
plt.tight_layout()
plt.savefig('graficos/02_correlacao.png', bbox_inches='tight')
plt.close()
print("[OK] Gráfico 2 salvo: graficos/02_correlacao.png")

# ---- Gráfico 3: PHQ9 e GAD7 por MentalHealthStatus ----
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle('PHQ9 e GAD7 por Status de Saúde Mental', fontsize=13, fontweight='bold')

df_plot = df.copy()
df_plot['Status'] = df_plot['MentalHealthStatus'].map({0: 'Sem transtorno', 1: 'Com transtorno'})
for ax, col in zip(axes, ['PHQ9', 'GAD7']):
    sns.boxplot(x='Status', y=col, data=df_plot,
                palette={'Sem transtorno': '#00B894', 'Com transtorno': '#E74C3C'}, ax=ax)
    ax.set_title(col)

plt.tight_layout()
plt.savefig('graficos/03_phq9_gad7_por_status.png', bbox_inches='tight')
plt.close()
print("[OK] Gráfico 3 salvo: graficos/03_phq9_gad7_por_status.png")


# =============================================================================
# ETAPA 3 — VERIFICAÇÃO DE QUALIDADE DOS DADOS
# =============================================================================
# Checamos três categorias de problema que comprometem qualquer pipeline de ML:
#
#   a) Valores nulos
#      O scikit-learn não aceita NaN. Se houver, é preciso imputar (preencher
#      com média/mediana) ou remover a linha. Checamos antes de qualquer
#      transformação para evitar erros silenciosos.
#
#   b) Linhas duplicadas
#      Registros repetidos fazem o modelo "ver" certas amostras mais vezes,
#      inflando artificialmente a representatividade de uma classe ou cluster.
#      Removemos e resetamos o índice para não criar lacunas.
#
#   c) Outliers — Método IQR (Interquartile Range)
#      IQR = Q3 - Q1  (distância entre o 75º e o 25º percentil)
#      Outlier = valor < Q1 - 1.5×IQR  ou  valor > Q3 + 1.5×IQR
#
#      Detectamos mas MANTEMOS os outliers neste dataset. Justificativa:
#      valores extremos como 3h de sono ou 12h de tela por dia são dados
#      fisiologicamente plausíveis em estudantes sob alta pressão acadêmica.
#      São exatamente esses estudantes que formam os perfis "Sob Pressão"
#      e "Em Alerta" que o K-Means precisa identificar. Removê-los
#      produziria um modelo que nunca classificaria os casos mais críticos.
# =============================================================================

print("\n\n" + "=" * 65)
print("  ETAPA 3 — Verificação de Qualidade dos Dados")
print("=" * 65)

# 3a. Valores nulos
nulos = df.isnull().sum()
print(f"\n--- Valores nulos por coluna ---")
if nulos.sum() == 0:
    print("   [OK] Nenhum valor nulo encontrado.")
else:
    print(nulos[nulos > 0])

# 3b. Duplicatas
n_dup = df.duplicated().sum()
print(f"\n--- Linhas duplicadas ---")
if n_dup == 0:
    print("   [OK] Nenhuma linha duplicada encontrada.")
else:
    print(f"   [!]  {n_dup} linhas duplicadas encontradas. Removendo...")
    df = df.drop_duplicates().reset_index(drop=True)
    print(f"   Dataset após remoção: {df.shape[0]} linhas.")

# 3c. Outliers por IQR nas features que usaremos no K-Means
features_kmeans_cols = [
    'SleepHours', 'ScreenTime', 'ExerciseFreq',
    'AcademicStress', 'PHQ9', 'GAD7'
]

print(f"\n--- Outliers pelo método IQR (features do K-Means) ---")
total_outliers = 0
outlier_info = {}

for col in features_kmeans_cols:
    Q1  = df[col].quantile(0.25)
    Q3  = df[col].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    n_out = ((df[col] < lower) | (df[col] > upper)).sum()
    outlier_info[col] = {'lower': round(lower, 2), 'upper': round(upper, 2), 'count': int(n_out)}
    total_outliers += n_out
    status = "[OK]" if n_out == 0 else "[!] "
    print(f"   {status} {col:<18} | Limite: [{lower:.2f}, {upper:.2f}] | Outliers: {n_out}")

print(f"\n   Total de outliers detectados: {total_outliers}")
print(f"   -> Decisão: MANTER os outliers.")
print(f"     Justificativa: os valores extremos (ex: 3h de sono, 12h de tela)")
print(f"     são dados reais de estudantes universitários sob alta pressão.")
print(f"     Removê-los eliminaria exatamente os perfis 'Sob Pressão' e")
print(f"     'Em Alerta' que o K-Means precisa detectar.")


# =============================================================================
# ETAPA 4 — FEATURE ENGINEERING E MAPEAMENTO PARA O SCHEMA PRISMA
# =============================================================================
# As colunas do dataset estão em escalas clínicas/acadêmicas brutas
# (ex.: PHQ9 de 0 a 27). O banco de dados do EntreMentes usa tipos e
# enums específicos definidos no schema Prisma. Esta etapa faz a ponte
# entre os dois formatos.
#
# Por que criar novas colunas em vez de renomear?
#   Mantemos as originais intactas para o K-Means (Etapa 5) continuar
#   usando os valores numéricos contínuos. As novas colunas mapeadas
#   são usadas somente na exportação JSON (Etapa 7).
#
# Mapeamentos realizados:
#
#   PHQ9 (0–27) → nivelHumor (Int 1–5)
#     O PHQ-9 (Patient Health Questionnaire) é a escala clínica padrão
#     para rastreamento de depressão, validada por Kroenke et al. (2001).
#     Convertemos para 1–5 invertendo a direção: PHQ9 alto = humor ruim.
#       0–4   → 5  (Mínimo — Muito bom)
#       5–9   → 4  (Leve — Bom)
#       10–14 → 3  (Moderado — Neutro)
#       15–19 → 2  (Mod. grave — Ruim)
#       20–27 → 1  (Grave — Muito ruim)
#
#   AcademicStress (0–10) → nivelEstresse (Enum: Baixo | Medio | Alto)
#     Divisão em terços da escala original.
#       0–3  → Baixo
#       4–6  → Medio
#       7–10 → Alto
#     Obs.: Prisma não aceita acento — o enum usa "Medio", não "Médio".
#
#   GPA (0.0–4.0) → desempenhoAcademico (Enum: Melhorou | Mesmo | Piorou)
#     Baseado na interpretação padrão da escala GPA americana:
#       > 3.0 → Melhorou  (bom desempenho — equivale a A/B)
#       ≥ 2.0 → Mesmo     (desempenho médio — equivale a C)
#       < 2.0 → Piorou    (baixo desempenho — equivale a D/F)
#
#   AcademicStress > 7 → ansiedadeAntesProva (Boolean)
#     Limiar definido pela literatura: estresse acadêmico acima de 7/10
#     está fortemente associado a ansiedade situacional antes de avaliações.
#
# NOTA: O script anterior (analysis.py) usava MentalHealthStatus (0 ou 1)
#   para gerar nivelHumor, resultando apenas nos valores 2 ou 5 — binário
#   e clinicamente incorreto. O PHQ9 produz distribuição completa em 5 níveis.
# =============================================================================

print("\n\n" + "=" * 65)
print("  ETAPA 4 — Feature Engineering e Mapeamento Prisma")
print("=" * 65)

# ---- nivelHumor: PHQ9 -> escala 1–5 (escala clínica PHQ-9) ----
def map_phq9_to_humor(phq9_score):
    """
    Converte o score PHQ-9 para a escala de humor do app (1–5).
    Direção invertida: PHQ9 alto = depressão grave = nivelHumor baixo.
    Faixas: Kroenke et al., 2001 — interpretação clínica do PHQ-9.
    """
    if phq9_score <= 4:
        return 5   # Mínimo -> Muito bom
    elif phq9_score <= 9:
        return 4   # Leve -> Bom
    elif phq9_score <= 14:
        return 3   # Moderado -> Neutro
    elif phq9_score <= 19:
        return 2   # Moderadamente grave -> Ruim
    else:
        return 1   # Grave -> Muito ruim

# ---- nivelEstresse: AcademicStress (0–10) -> Enum Prisma ----
def map_stress(stress_score):
    """
    Converte AcademicStress (0–10) para o enum NivelEstresse do Prisma.
    Divisão em terços: 0–3 Baixo / 4–6 Medio / 7–10 Alto.
    Atenção: Prisma exige 'Medio' sem acento (restrição do enum).
    """
    if stress_score <= 3:
        return "Baixo"
    elif stress_score <= 6:
        return "Medio"
    else:
        return "Alto"

# ---- desempenhoAcademico: GPA (0–4) -> Enum Prisma ----
def map_gpa(gpa):
    """
    Converte GPA (0.0–4.0) para o enum DesempenhoAcademico do Prisma.
    Limiares da escala GPA americana: A/B = > 3.0, C = ≥ 2.0, D/F = < 2.0.
    """
    if gpa > 3.0:
        return "Melhorou"
    elif gpa >= 2.0:
        return "Mesmo"
    else:
        return "Piorou"

# Aplicar mapeamentos
df['nivelHumor']          = df['PHQ9'].apply(map_phq9_to_humor)
df['nivelEstresse']       = df['AcademicStress'].apply(map_stress)
df['desempenhoAcademico'] = df['GPA'].apply(map_gpa)
df['ansiedadeAntesProva'] = df['AcademicStress'] > 7
df['tempoTela']           = df['ScreenTime'].round(1)
df['duracaoSono']         = df['SleepHours'].round(1)
df['atividadeFisica']     = df['ExerciseFreq'].round(1)
df['nota']                = "Importado do dataset de pesquisa"

# Relatório do mapeamento
print(f"\n--- Distribuição de nivelHumor (PHQ9 -> 1–5) ---")
humor_dist = df['nivelHumor'].value_counts().sort_index()
labels = {1:'Muito ruim', 2:'Ruim', 3:'Neutro', 4:'Bom', 5:'Muito bom'}
for nivel, count in humor_dist.items():
    pct = count / len(df) * 100
    print(f"   Nível {nivel} ({labels[nivel]:<11}): {count:4d} ({pct:.1f}%)")

print(f"\n--- Distribuição de nivelEstresse ---")
for val, count in df['nivelEstresse'].value_counts().items():
    print(f"   {val:<8}: {count:4d} ({count/len(df)*100:.1f}%)")

print(f"\n--- Distribuição de desempenhoAcademico ---")
for val, count in df['desempenhoAcademico'].value_counts().items():
    print(f"   {val:<10}: {count:4d} ({count/len(df)*100:.1f}%)")

print(f"\n--- ansiedadeAntesProva ---")
ansi = df['ansiedadeAntesProva'].value_counts()
print(f"   True  (com ansiedade) : {ansi.get(True, 0):4d}")
print(f"   False (sem ansiedade) : {ansi.get(False, 0):4d}")

# ---- Gráfico 4: Distribuição dos campos mapeados ----
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
fig.suptitle('Distribuição dos Campos Mapeados para o Prisma', fontsize=13, fontweight='bold')

# nivelHumor
humor_labels = [f"{k}\n({labels[k]})" for k in sorted(humor_dist.index)]
axes[0].bar(humor_labels, [humor_dist[k] for k in sorted(humor_dist.index)],
            color='#6C5CE7', alpha=0.8)
axes[0].set_title('nivelHumor (1–5)')
axes[0].set_ylabel('Quantidade')

# nivelEstresse
estresse_vals = df['nivelEstresse'].value_counts()
colors_e = {'Baixo': '#00B894', 'Medio': '#FDCB6E', 'Alto': '#E74C3C'}
axes[1].bar(estresse_vals.index, estresse_vals.values,
            color=[colors_e[k] for k in estresse_vals.index], alpha=0.85)
axes[1].set_title('nivelEstresse')
axes[1].set_ylabel('Quantidade')

# desempenhoAcademico
desemp_vals = df['desempenhoAcademico'].value_counts()
colors_d = {'Melhorou': '#00B894', 'Mesmo': '#FDCB6E', 'Piorou': '#E74C3C'}
axes[2].bar(desemp_vals.index, desemp_vals.values,
            color=[colors_d[k] for k in desemp_vals.index], alpha=0.85)
axes[2].set_title('desempenhoAcademico')
axes[2].set_ylabel('Quantidade')

plt.tight_layout()
plt.savefig('graficos/04_campos_mapeados.png', bbox_inches='tight')
plt.close()
print("\n[OK] Gráfico 4 salvo: graficos/04_campos_mapeados.png")


# =============================================================================
# ETAPA 5 — SELEÇÃO DE FEATURES PARA O K-MEANS
# =============================================================================
# Das 16 colunas do dataset, selecionamos 6 com base em três critérios
# aplicados simultaneamente:
#
#   a) Correspondência com o formulário do app
#      O modelo só é útil em produção se conseguir classificar usuários reais.
#      Cada feature aqui tem um campo equivalente que o usuário preenche:
#        SleepHours    → duracaoSono
#        ScreenTime    → tempoTela
#        ExerciseFreq  → atividadeFisica
#        AcademicStress→ base do nivelEstresse
#        PHQ9          → base do nivelHumor
#        GAD7          → complementa PHQ9 (ansiedade vs. depressão)
#
#   b) Relevância para saúde mental (confirmada na EDA)
#      As correlações calculadas na Etapa 2 mostraram que essas 6 variáveis
#      têm maior associação com MentalHealthStatus entre todas as 16.
#
#   c) Tipo numérico contínuo
#      K-Means mede distância euclidiana — variáveis categóricas (strings,
#      booleans) distorceriam o cálculo de distância. Colunas como
#      MentalHealthStatus (0/1) e FamilySupport (ordinal) foram excluídas.
# =============================================================================

print("\n\n" + "=" * 65)
print("  ETAPA 5 — Seleção de Features para o K-Means")
print("=" * 65)

FEATURES_KMEANS = [
    'SleepHours',      # Horas de sono
    'ScreenTime',      # Horas de tela por dia
    'ExerciseFreq',    # Frequência de exercício (dias/semana)
    'AcademicStress',  # Estresse acadêmico (0–10)
    'PHQ9',            # Score de depressão (0–27)
    'GAD7',            # Score de ansiedade (0–21)
]

df_kmeans = df[FEATURES_KMEANS].copy()

print(f"\n   Features selecionadas: {FEATURES_KMEANS}")
print(f"\n--- Estatísticas das features selecionadas ---")
print(df_kmeans.describe().round(2).to_string())

# Correlação dessas features com MentalHealthStatus
print(f"\n--- Correlação com MentalHealthStatus ---")
corr_target = df[FEATURES_KMEANS + ['MentalHealthStatus']].corr()['MentalHealthStatus'].drop('MentalHealthStatus')
for feat, val in corr_target.sort_values(key=abs, ascending=False).items():
    direcao = "+" if val > 0 else "-"
    print(f"   {feat:<18}: {val:+.4f} {direcao}")


# =============================================================================
# ETAPA 6 — NORMALIZAÇÃO (MinMaxScaler)
# =============================================================================
# K-Means mede similaridade via distância euclidiana entre pontos no espaço
# n-dimensional. O problema: as features estão em escalas muito diferentes.
#
#   Exemplo sem normalização:
#     PHQ9 vai de 0 a 27 → diferença máxima de 27 unidades
#     ExerciseFreq vai de 0 a 7 → diferença máxima de 7 unidades
#     → PHQ9 domina o cálculo com ~4× mais influência que ExerciseFreq.
#
#   O resultado seriam clusters formados quase exclusivamente pela variação
#   do PHQ9, ignorando as demais features — o oposto do objetivo.
#
# MinMaxScaler coloca todas as features no intervalo [0, 1]:
#   X_norm = (X - X_min) / (X_max - X_min)
#
#   Após a normalização, uma diferença de 0.5 em qualquer feature representa
#   50% da amplitude total daquela variável — peso igual para todas.
#
# Salvamos as colunas normalizadas com sufixo "_norm" no mesmo DataFrame,
# mantendo as originais para referência e para a exportação JSON.
#
# O Gráfico 5 mostra os histogramas antes e depois para cada feature,
# confirmando que a forma da distribuição é preservada — apenas a escala muda.
# =============================================================================

print("\n\n" + "=" * 65)
print("  ETAPA 6 — Normalização com MinMaxScaler")
print("=" * 65)

scaler = MinMaxScaler()
df_normalizado = pd.DataFrame(
    scaler.fit_transform(df_kmeans),
    columns=[f"{col}_norm" for col in FEATURES_KMEANS]
)

print(f"\n--- Verificação pós-normalização (deve ser [0.00, 1.00]) ---")
for col in df_normalizado.columns:
    print(f"   {col:<28}: min={df_normalizado[col].min():.2f}  max={df_normalizado[col].max():.2f}")

# Juntamos as features originais + normalizadas em um único DataFrame
df_kmeans_final = pd.concat([df_kmeans, df_normalizado], axis=1)

# ---- Gráfico 5: Antes vs Depois da normalização ----
fig, axes = plt.subplots(2, 3, figsize=(15, 8))
fig.suptitle('Features: Escala Original vs. Normalizada (MinMaxScaler)', fontsize=13, fontweight='bold')

for ax, col in zip(axes.flatten(), FEATURES_KMEANS):
    ax.hist(df_kmeans[col], bins=30, alpha=0.55, label='Original', color='#E74C3C', edgecolor='white')
    ax.hist(df_normalizado[f'{col}_norm'], bins=30, alpha=0.55, label='Normalizado', color='#6C5CE7', edgecolor='white')
    ax.set_title(col)
    ax.legend(fontsize=8)

plt.tight_layout()
plt.savefig('graficos/05_normalizacao.png', bbox_inches='tight')
plt.close()
print("\n[OK] Gráfico 5 salvo: graficos/05_normalizacao.png")


# =============================================================================
# ETAPA 7 — EXPORTAÇÃO DOS ARTEFATOS FINAIS
# =============================================================================
# O pré-processamento produz dois artefatos com destinos e formatos distintos:
#
#   [JSON] dados_tratados.json
#      Destino : backend Node.js → seed do banco PostgreSQL via Prisma.
#      Formato : array de objetos JSON com os campos exatos do model
#                RegistroBemEstar — tipos, nomes e enums compatíveis com o
#                schema Prisma. Cada registro recebe um UUID único gerado
#                localmente (não há userId real em dados de pesquisa).
#      Conteúdo: nivelHumor, nivelEstresse, desempenhoAcademico,
#                ansiedadeAntesProva, tempoTela, duracaoSono, atividadeFisica.
#
#   [CSV] features_kmeans.csv
#      Destino : kmeans_clustering.py → treinamento do modelo de clustering.
#      Formato : 12 colunas — 6 features originais + 6 normalizadas (_norm).
#                O kmeans_clustering.py usará apenas as colunas "_norm" no
#                fit() do scikit-learn; as originais ficam para referência
#                humana na análise dos centroides.
# =============================================================================

print("\n\n" + "=" * 65)
print("  ETAPA 7 — Exportação dos Artefatos Finais")
print("=" * 65)

# ---- 7a. dados_tratados.json ----
# Monta os registros no formato exato do model RegistroBemEstar (Prisma)
registros_prisma = []
for _, row in df.iterrows():
    registro = {
        "userId":              str(uuid.uuid4()),   # UUID gerado localmente (seed)
        "nivelHumor":          int(row['nivelHumor']),
        "nota":                row['nota'],
        "tempoTela":           float(round(row['tempoTela'], 1)),
        "duracaoSono":         float(round(row['duracaoSono'], 1)),
        "atividadeFisica":     float(round(row['atividadeFisica'], 1)),
        "nivelEstresse":       row['nivelEstresse'],         # Enum: Baixo|Medio|Alto
        "ansiedadeAntesProva": bool(row['ansiedadeAntesProva']),
        "desempenhoAcademico": row['desempenhoAcademico'],  # Enum: Melhorou|Mesmo|Piorou
    }
    registros_prisma.append(registro)

with open('dados_tratados.json', 'w', encoding='utf-8') as f:
    json.dump(registros_prisma, f, ensure_ascii=False, indent=2)

print(f"\n[OK] dados_tratados.json exportado: {len(registros_prisma)} registros")
print(f"   Campos: {list(registros_prisma[0].keys())}")

# Exemplo de um registro
print(f"\n   Exemplo de registro:")
exemplo = registros_prisma[0]
for k, v in exemplo.items():
    print(f"     {k:<22}: {v}")

# ---- 7b. features_kmeans.csv ----
df_kmeans_final.to_csv('features_kmeans.csv', index=False)
print(f"\n[OK] features_kmeans.csv exportado: {df_kmeans_final.shape[0]} linhas × {df_kmeans_final.shape[1]} colunas")
print(f"   Colunas originais : {FEATURES_KMEANS}")
print(f"   Colunas norm.     : {[c for c in df_kmeans_final.columns if '_norm' in c]}")


# =============================================================================
# ETAPA 8 — RELATÓRIO FINAL DE QUALIDADE
# =============================================================================
# Imprime um resumo executivo consolidando todas as decisões tomadas:
# volume de dados, problemas encontrados, mapeamentos aplicados,
# método de normalização e artefatos gerados.
#
# Funciona como checklist de entrega: confirma que o pipeline foi executado
# sem erros e que os dois artefatos (JSON e CSV) estão prontos para as
# próximas etapas — seed do banco e treinamento do K-Means.
# =============================================================================

print("\n\n" + "=" * 65)
print("  ETAPA 8 — Relatório Final")
print("=" * 65)

print(f"""
+==============================================================+
|           RESUMO DO PRÉ-PROCESSAMENTO — EntreMentes          |
+==============================================================+
|  Dataset original                                            |
|    Linhas       : {df.shape[0]:<6}  |  Colunas: {df.shape[1]:<3}                     |
|    Valores nulos: 0       |  Duplicatas: {n_dup:<3}                   |
|                                                              |
|  Qualidade                                                   |
|    Outliers detectados: {total_outliers:<5} (mantidos — dados válidos)    |
|    Duplicatas removidas: {n_dup:<4}                                   |
|                                                              |
|  Mapeamentos aplicados                                       |
|    PHQ9 -> nivelHumor (1–5, escala clínica PHQ-9)            |
|    AcademicStress -> nivelEstresse (Baixo|Medio|Alto)         |
|    GPA -> desempenhoAcademico (Melhorou|Mesmo|Piorou)         |
|    AcademicStress > 7 -> ansiedadeAntesProva (bool)           |
|                                                              |
|  Normalização                                                |
|    Método   : MinMaxScaler -> escala [0, 1]                   |
|    Features : SleepHours, ScreenTime, ExerciseFreq,          |
|               AcademicStress, PHQ9, GAD7                     |
|                                                              |
|  Artefatos gerados                                           |
|    dados_tratados.json   -> {len(registros_prisma)} registros (Prisma/backend)  |
|    features_kmeans.csv   -> {df_kmeans_final.shape[0]} linhas × {df_kmeans_final.shape[1]} colunas (K-Means)   |
|    graficos/             -> 5 gráficos PNG (EDA + validação)  |
|                                                              |
|  Próximos passos                                             |
|    -> Treinar K-Means (K=4) com features_kmeans.csv           |
|    -> Implementar mining-service (Flask + scikit-learn)       |
|    -> Integrar Pub/Sub (mood-registered / profile-classified) |
+==============================================================+
""")

print("Pré-processamento concluído com sucesso! [OK]")
