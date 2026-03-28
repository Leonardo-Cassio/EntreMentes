import pandas as pd
import uuid
from datetime import datetime

# =========================
# 1. Ler o CSV
# =========================
df = pd.read_csv('data.csv')

# =========================
# 2. Funções de conversão
# =========================

# Humor (1 a 5)
def map_mood(x):
    return 5 if x == 1 else 2

# Estresse (ENUM do Prisma: Baixo, Medio, Alto)
def map_stress(x):
    if x <= 3:
        return "Baixo"
    elif x <= 6:
        return "Medio"  # sem acento
    else:
        return "Alto"

# Desempenho acadêmico
def map_performance(x):
    if x > 7:
        return "Melhorou"
    elif x >= 5:
        return "Mesmo"
    else:
        return "Piorou"

# =========================
# 3. Transformar dados
# =========================

df['nivelHumor'] = df['MentalHealthStatus'].apply(map_mood)
df['nota'] = "Importado do dataset"
df['tempoTela'] = df['ScreenTime']
df['duracaoSono'] = df['SleepHours']
df['atividadeFisica'] = df['ExerciseFreq']
df['nivelEstresse'] = df['AcademicStress'].apply(map_stress)
df['ansiedadeAntesProva'] = df['AcademicStress'] > 6
df['desempenhoAcademico'] = df['GPA'].apply(map_performance)

# =========================
# 4. Criar userId fake (necessário pro banco)
# =========================

df['userId'] = [str(uuid.uuid4()) for _ in range(len(df))]

# =========================
# 5. Selecionar campos finais
# =========================

final = df[[
    'userId',
    'nivelHumor',
    'nota',
    'tempoTela',
    'duracaoSono',
    'atividadeFisica',
    'nivelEstresse',
    'ansiedadeAntesProva',
    'desempenhoAcademico'
]]

# =========================
# 6. Exportar JSON pronto pro backend
# =========================

final.to_json('dados_tratados.json', orient='records', force_ascii=False, indent=2)

# =========================
# 7. Exibir preview
# =========================

print("Dados tratados com sucesso! Exemplo:")
print(final.head())