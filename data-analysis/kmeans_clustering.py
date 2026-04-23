# =============================================================================
# EntreMentes — Clustering K-Means (K=4)
# =============================================================================
# Projeto Interdisciplinar — 6º Semestre DSM | FATEC
# Disciplina: Mineração de Dados / IA
# Integrantes: Gabriel Fillip, Leonardo Cássio
#
# Objetivo:
#   Aplicar K-Means (K=4) sobre as features normalizadas geradas pelo
#   preprocessing.py, identificar os 4 perfis comportamentais de estudantes
#   e salvar o modelo treinado em modelo_kmeans.pkl para uso no back-end.
#
# Entrada : features_kmeans.csv  (gerado pelo preprocessing.py)
# Saídas  : modelo_kmeans.pkl    — modelo K-Means serializado (joblib)
#           graficos/06_elbow_silhouette.png
#           graficos/07_clusters_pca.png
#           graficos/08_perfis_radar.png
#           graficos/09_distribuicao_clusters.png
# =============================================================================

import sys
import warnings
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.cm as cm
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score, silhouette_samples
import joblib
import os

sys.stdout.reconfigure(encoding='utf-8')
warnings.filterwarnings('ignore')

plt.rcParams['figure.dpi'] = 110
plt.rcParams['font.family'] = 'DejaVu Sans'

# Paleta de cores dos 4 clusters (identidade visual do EntreMentes)
CORES_CLUSTER = ['#6C5CE7', '#00B894', '#FDCB6E', '#E74C3C']

# =============================================================================
# ETAPA 1 — CARREGAMENTO DAS FEATURES
# =============================================================================

print("=" * 65)
print("  EntreMentes — K-Means Clustering (K=4)")
print("=" * 65)

df = pd.read_csv('features_kmeans.csv')

# Colunas normalizadas (sufixo _norm) — únicas usadas no K-Means
COLS_NORM = [c for c in df.columns if c.endswith('_norm')]
COLS_ORIG = [c.replace('_norm', '') for c in COLS_NORM]

X = df[COLS_NORM].values

print(f"\n[OK] features_kmeans.csv carregado.")
print(f"     Amostras  : {X.shape[0]}")
print(f"     Features  : {X.shape[1]} → {COLS_ORIG}")

os.makedirs('graficos', exist_ok=True)

# =============================================================================
# ETAPA 2 — MÉTODO DO COTOVELO + SILHOUETTE (validação de K)
# =============================================================================
# O Método do Cotovelo plota a inércia (WCSS) para cada K.
# O "cotovelo" indica o K ótimo — a partir daí, adicionar clusters
# traz ganho marginal de explicação.
#
# A Silhouette Score mede quão coeso é cada cluster em relação aos
# vizinhos (-1 a +1; quanto mais próximo de 1, melhor).
# =============================================================================

print("\n\n" + "=" * 65)
print("  ETAPA 2 — Validação do K (Cotovelo + Silhouette)")
print("=" * 65)

K_RANGE = range(2, 10)
inercias   = []
silhouettes = []

print("\n   K    WCSS (inércia)    Silhouette Score")
print("   " + "-" * 42)

for k in K_RANGE:
    km = KMeans(n_clusters=k, init='k-means++', n_init=10, random_state=42)
    labels = km.fit_predict(X)
    inercia = km.inertia_
    sil     = silhouette_score(X, labels)
    inercias.append(inercia)
    silhouettes.append(sil)
    destaque = " ← escolhido" if k == 4 else ""
    print(f"   K={k}  {inercia:>14.1f}    {sil:.4f}{destaque}")

# ── Gráfico 6: Cotovelo + Silhouette ──────────────────────────────────────
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
fig.suptitle('Validação do Número de Clusters (K)', fontsize=14, fontweight='bold')

k_list = list(K_RANGE)

# Cotovelo
ax1.plot(k_list, inercias, 'o-', color='#6C5CE7', linewidth=2.5, markersize=8)
ax1.axvline(x=4, color='#E74C3C', linestyle='--', linewidth=1.5, alpha=0.7, label='K=4 escolhido')
ax1.fill_between(k_list, inercias, alpha=0.08, color='#6C5CE7')
ax1.set_xlabel('Número de Clusters (K)', fontsize=12)
ax1.set_ylabel('Inércia (WCSS)', fontsize=12)
ax1.set_title('Método do Cotovelo', fontsize=12)
ax1.legend()
ax1.set_xticks(k_list)
ax1.grid(True, alpha=0.3)

# Silhouette
bar_colors = ['#E74C3C' if k == 4 else '#A29BFE' for k in k_list]
bars = ax2.bar(k_list, silhouettes, color=bar_colors, alpha=0.85, width=0.6)
ax2.set_xlabel('Número de Clusters (K)', fontsize=12)
ax2.set_ylabel('Silhouette Score', fontsize=12)
ax2.set_title('Silhouette Score por K', fontsize=12)
ax2.set_xticks(k_list)
ax2.grid(True, alpha=0.3, axis='y')
for bar, val in zip(bars, silhouettes):
    ax2.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.002,
             f'{val:.3f}', ha='center', va='bottom', fontsize=9)

plt.tight_layout()
plt.savefig('graficos/06_elbow_silhouette.png', bbox_inches='tight')
plt.close()
print("\n[OK] Gráfico 6 salvo: graficos/06_elbow_silhouette.png")

# =============================================================================
# ETAPA 3 — TREINAMENTO FINAL COM K=4
# =============================================================================
# Usamos k-means++ para inicialização inteligente dos centroides,
# reduzindo a sensibilidade ao ponto de partida aleatório.
# n_init=20 roda 20 inicializações independentes, retornando a melhor.
# =============================================================================

print("\n\n" + "=" * 65)
print("  ETAPA 3 — Treinamento K-Means (K=4, k-means++)")
print("=" * 65)

kmeans_final = KMeans(n_clusters=4, init='k-means++', n_init=20, random_state=42)
clusters = kmeans_final.fit_predict(X)

df['cluster'] = clusters

inercia_final = kmeans_final.inertia_
sil_final     = silhouette_score(X, clusters)

print(f"\n   Inércia final (WCSS) : {inercia_final:.2f}")
print(f"   Silhouette Score     : {sil_final:.4f}")
print(f"\n--- Distribuição dos clusters ---")
contagem = pd.Series(clusters).value_counts().sort_index()
for c, n in contagem.items():
    pct = n / len(clusters) * 100
    print(f"   Cluster {c}: {n:4d} estudantes ({pct:.1f}%)")

# =============================================================================
# ETAPA 4 — ROTULAGEM DOS PERFIS COMPORTAMENTAIS
# =============================================================================
# Analisamos os centroides para nomear cada cluster com um perfil
# clínico-educacional. A lógica:
#
#   - Humor / bem-estar  → determinado por PHQ9_norm e GAD7_norm (quanto
#     MAIOR a normalização, PIOR o estado — PHQ9 e GAD7 medem sintomas)
#   - Sono               → SleepHours_norm (quanto MAIOR, melhor)
#   - Exercício          → ExerciseFreq_norm (quanto MAIOR, melhor)
#   - Estresse           → AcademicStress_norm (quanto MAIOR, pior)
#   - Tela               → ScreenTime_norm (quanto MAIOR, pior)
#
# Perfis esperados (baseados na literatura de saúde mental estudantil):
#   "Equilibrado"          — bom sono, baixo estresse, baixo PHQ9/GAD7
#   "Sob Pressão"          — alto estresse, PHQ9/GAD7 elevados, pouco exercício
#   "Em Alerta"            — PHQ9/GAD7 muito altos, sono irregular
#   "Rotina Saudável"      — exercício regular, sono adequado, tela controlada
# =============================================================================

print("\n\n" + "=" * 65)
print("  ETAPA 4 — Análise dos Centroides e Rotulagem")
print("=" * 65)

centroides_norm = pd.DataFrame(
    kmeans_final.cluster_centers_,
    columns=COLS_NORM
)

# Renomeia para legibilidade
centroides_norm.columns = COLS_ORIG

print("\n--- Centroides normalizados [0–1] ---")
print(centroides_norm.round(3).to_string())

# Pontuação de "bem-estar" para cada cluster:
# score = sono + exercício - estresse - PHQ9 - GAD7 - (tela/2)
# (heurística para ordenar do mais saudável ao menos saudável)
centroides_norm['score_bem_estar'] = (
    centroides_norm['SleepHours']
    + centroides_norm['ExerciseFreq']
    - centroides_norm['AcademicStress']
    - centroides_norm['PHQ9']
    - centroides_norm['GAD7']
    - centroides_norm['ScreenTime'] * 0.5
)

ranking = centroides_norm['score_bem_estar'].sort_values(ascending=False)

NOMES_PERFIL = {
    ranking.index[0]: ('Equilibrado',          '🟢', '#00B894'),
    ranking.index[1]: ('Rotina Saudável',       '🟡', '#FDCB6E'),
    ranking.index[2]: ('Sob Pressão',           '🟠', '#E17055'),
    ranking.index[3]: ('Em Alerta',             '🔴', '#E74C3C'),
}

print("\n--- Perfis atribuídos por pontuação de bem-estar ---")
print(f"   {'Cluster':<10} {'Score':<10} {'Perfil':<22}")
print("   " + "-" * 42)
for idx, score in ranking.items():
    nome, emoji, _ = NOMES_PERFIL[idx]
    print(f"   Cluster {idx:<4} {score:+.4f}    {emoji} {nome}")

df['perfil'] = df['cluster'].map(lambda c: NOMES_PERFIL[c][0])

# =============================================================================
# ETAPA 5 — VISUALIZAÇÕES
# =============================================================================

print("\n\n" + "=" * 65)
print("  ETAPA 5 — Geração dos Gráficos")
print("=" * 65)

cores_por_cluster = {c: NOMES_PERFIL[c][2] for c in range(4)}

# ── Gráfico 7: Scatter PCA 2D ─────────────────────────────────────────────
pca = PCA(n_components=2, random_state=42)
X_pca = pca.fit_transform(X)
var_exp = pca.explained_variance_ratio_

fig, ax = plt.subplots(figsize=(10, 7))
fig.suptitle('Clusters K-Means — Projeção PCA 2D', fontsize=14, fontweight='bold')

for c in range(4):
    mask = clusters == c
    nome, emoji, cor = NOMES_PERFIL[c]
    ax.scatter(
        X_pca[mask, 0], X_pca[mask, 1],
        c=cor, label=f'Cluster {c} — {nome}',
        alpha=0.55, s=25, edgecolors='none'
    )

# Centroides no espaço PCA
centroides_pca = pca.transform(kmeans_final.cluster_centers_)
for c in range(4):
    nome, emoji, cor = NOMES_PERFIL[c]
    ax.scatter(
        centroides_pca[c, 0], centroides_pca[c, 1],
        c=cor, marker='*', s=300, edgecolors='white', linewidths=1.2, zorder=5
    )
    ax.annotate(
        f' {nome}', xy=(centroides_pca[c, 0], centroides_pca[c, 1]),
        fontsize=9, fontweight='bold', color=cor,
        bbox=dict(boxstyle='round,pad=0.2', fc='white', ec=cor, alpha=0.85)
    )

ax.set_xlabel(f'PC1 ({var_exp[0]:.1%} variância explicada)', fontsize=11)
ax.set_ylabel(f'PC2 ({var_exp[1]:.1%} variância explicada)', fontsize=11)
ax.legend(fontsize=10, loc='upper right')
ax.grid(True, alpha=0.2)
plt.tight_layout()
plt.savefig('graficos/07_clusters_pca.png', bbox_inches='tight')
plt.close()
print("[OK] Gráfico 7 salvo: graficos/07_clusters_pca.png")

# ── Gráfico 8: Radar dos perfis ──────────────────────────────────────────
LABELS_RADAR = ['Sono', 'Exercício', 'Estresse\n(inv)', 'Tela\n(inv)', 'Humor\n(PHQ9 inv)', 'Ansiedade\n(GAD7 inv)']
N = len(LABELS_RADAR)
angulos = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
angulos += angulos[:1]

fig, axes = plt.subplots(2, 2, figsize=(12, 10), subplot_kw=dict(polar=True))
fig.suptitle('Perfil de Cada Cluster — Radar Chart', fontsize=14, fontweight='bold')

for idx_plot, c in enumerate(range(4)):
    ax = axes[idx_plot // 2][idx_plot % 2]
    nome, emoji, cor = NOMES_PERFIL[c]
    centro = kmeans_final.cluster_centers_[c]

    # Para "bem-estar positivo": inverte estresse, tela, PHQ9, GAD7
    # (normalizados: 1 = muito → invertemos para 1 = ruim vire 0 no radar)
    vals = [
        centro[0],          # SleepHours_norm (quanto maior, melhor → mantém)
        centro[2],          # ExerciseFreq_norm (maior = melhor → mantém)
        1 - centro[3],      # AcademicStress_norm invertido (1=sem estresse)
        1 - centro[1],      # ScreenTime_norm invertido (1=pouca tela)
        1 - centro[4],      # PHQ9_norm invertido (1=humor ótimo)
        1 - centro[5],      # GAD7_norm invertido (1=sem ansiedade)
    ]
    vals += vals[:1]

    ax.plot(angulos, vals, 'o-', linewidth=2, color=cor)
    ax.fill(angulos, vals, alpha=0.25, color=cor)
    ax.set_xticks(angulos[:-1])
    ax.set_xticklabels(LABELS_RADAR, fontsize=9)
    ax.set_ylim(0, 1)
    ax.set_yticks([0.25, 0.5, 0.75])
    ax.set_yticklabels(['0.25', '0.50', '0.75'], fontsize=7, color='gray')
    ax.set_title(f'{emoji} Cluster {c} — {nome}', fontsize=11, fontweight='bold',
                 color=cor, pad=15)
    ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('graficos/08_perfis_radar.png', bbox_inches='tight')
plt.close()
print("[OK] Gráfico 8 salvo: graficos/08_perfis_radar.png")

# ── Gráfico 9: Distribuição + heatmap de centroides ──────────────────────
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
fig.suptitle('Distribuição e Características dos Clusters', fontsize=14, fontweight='bold')

# Distribuição
nomes_ordenados = [NOMES_PERFIL[c][0] for c in range(4)]
cores_ordenadas = [NOMES_PERFIL[c][2] for c in range(4)]
contagens = [contagem.get(c, 0) for c in range(4)]

bars = ax1.bar(nomes_ordenados, contagens, color=cores_ordenadas, alpha=0.85, width=0.6)
ax1.set_xlabel('Perfil Comportamental', fontsize=11)
ax1.set_ylabel('Número de Estudantes', fontsize=11)
ax1.set_title('Distribuição dos Estudantes por Perfil', fontsize=12)
ax1.grid(True, alpha=0.3, axis='y')

for bar, n in zip(bars, contagens):
    pct = n / len(clusters) * 100
    ax1.text(bar.get_x() + bar.get_width() / 2,
             bar.get_height() + 10,
             f'{n}\n({pct:.1f}%)', ha='center', va='bottom', fontsize=9, fontweight='bold')

# Heatmap de centroides
centroide_df = pd.DataFrame(
    kmeans_final.cluster_centers_,
    columns=COLS_ORIG,
    index=[f'C{c} {NOMES_PERFIL[c][0]}' for c in range(4)]
)

im = ax2.imshow(centroide_df.values, cmap='RdYlGn_r', aspect='auto', vmin=0, vmax=1)
ax2.set_xticks(range(len(COLS_ORIG)))
ax2.set_xticklabels(COLS_ORIG, rotation=30, ha='right', fontsize=10)
ax2.set_yticks(range(4))
ax2.set_yticklabels(centroide_df.index, fontsize=10)
ax2.set_title('Centroides Normalizados [0–1]\n(vermelho = alto · verde = baixo)', fontsize=11)

for i in range(4):
    for j in range(len(COLS_ORIG)):
        val = centroide_df.iloc[i, j]
        cor_texto = 'white' if (val > 0.65 or val < 0.25) else 'black'
        ax2.text(j, i, f'{val:.2f}', ha='center', va='center',
                 fontsize=9, fontweight='bold', color=cor_texto)

plt.colorbar(im, ax=ax2, shrink=0.8, label='Valor normalizado')
plt.tight_layout()
plt.savefig('graficos/09_distribuicao_clusters.png', bbox_inches='tight')
plt.close()
print("[OK] Gráfico 9 salvo: graficos/09_distribuicao_clusters.png")

# =============================================================================
# ETAPA 6 — ANÁLISE DETALHADA DOS PERFIS
# =============================================================================

print("\n\n" + "=" * 65)
print("  ETAPA 6 — Análise Detalhada dos Perfis")
print("=" * 65)

for c in range(4):
    nome, emoji, _ = NOMES_PERFIL[c]
    subset = df[df['cluster'] == c]
    n = len(subset)
    print(f"\n  {emoji} Cluster {c} — {nome} ({n} estudantes, {n/len(df)*100:.1f}%)")
    print(f"  {'Feature':<20} {'Média':>8}  {'Mín':>6}  {'Máx':>6}")
    print("  " + "-" * 44)
    for col in COLS_ORIG:
        media = subset[col].mean()
        minv  = subset[col].min()
        maxv  = subset[col].max()
        print(f"  {col:<20} {media:>8.2f}  {minv:>6.1f}  {maxv:>6.1f}")

# =============================================================================
# ETAPA 7 — SALVAR MODELO
# =============================================================================
# Salvamos um dicionário com o modelo K-Means treinado + metadados dos perfis.
# O mining-service Flask pode carregar esse arquivo com joblib.load()
# e classificar novos estudantes em tempo real.
# =============================================================================

print("\n\n" + "=" * 65)
print("  ETAPA 7 — Salvando modelo_kmeans.pkl")
print("=" * 65)

artefato = {
    'modelo':        kmeans_final,
    'features':      COLS_ORIG,
    'cols_norm':     COLS_NORM,
    'perfis': {
        c: {'nome': NOMES_PERFIL[c][0], 'cor': NOMES_PERFIL[c][2]}
        for c in range(4)
    },
    'k':             4,
    'silhouette':    round(sil_final, 4),
    'inercia':       round(inercia_final, 2),
    'n_amostras':    len(df),
}

joblib.dump(artefato, 'modelo_kmeans.pkl')
tamanho_kb = os.path.getsize('modelo_kmeans.pkl') / 1024
print(f"\n[OK] modelo_kmeans.pkl salvo ({tamanho_kb:.1f} KB)")
print(f"     Conteúdo do artefato:")
print(f"       modelo        : KMeans(k=4, init='k-means++', n_init=20)")
print(f"       features      : {COLS_ORIG}")
print(f"       perfis        : {[NOMES_PERFIL[c][0] for c in range(4)]}")
print(f"       silhouette    : {sil_final:.4f}")
print(f"       inércia       : {inercia_final:.2f}")
print(f"       n_amostras    : {len(df)}")

# =============================================================================
# RELATÓRIO FINAL
# =============================================================================

print(f"""

{'=' * 65}
  RESUMO — K-Means Clustering EntreMentes
{'=' * 65}

  Algoritmo   : K-Means (k-means++, K=4, n_init=20)
  Dataset     : {len(df)} estudantes × {len(COLS_NORM)} features normalizadas
  Silhouette  : {sil_final:.4f}   (meta: > 0.30 = agrupamento aceitável)
  Inércia     : {inercia_final:.2f}

  Perfis identificados:
""")

for c in range(4):
    nome, emoji, _ = NOMES_PERFIL[c]
    n = contagem.get(c, 0)
    print(f"    {emoji} Cluster {c} — {nome:<22} {n:4d} estudantes ({n/len(df)*100:.1f}%)")

print(f"""
  Arquivos gerados:
    modelo_kmeans.pkl                       ← modelo serializado
    graficos/06_elbow_silhouette.png        ← validação K
    graficos/07_clusters_pca.png            ← scatter PCA 2D
    graficos/08_perfis_radar.png            ← radar por cluster
    graficos/09_distribuicao_clusters.png   ← distribuição + heatmap

  Próximo passo:
    → Integrar modelo_kmeans.pkl ao mining-service Flask
    → Endpoint POST /classify recebe RegistroBemEstar, retorna perfil
{'=' * 65}
""")
