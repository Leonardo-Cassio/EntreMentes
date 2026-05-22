"""
EntreMentes — Classificador K-Means
Carrega modelo_kmeans.pkl e classifica novos registros de bem-estar.
"""

import os
import numpy as np
import joblib

MODEL_PATH = os.getenv("MODEL_PATH", "./modelo_kmeans.pkl")

# Carregado uma única vez ao importar o módulo
_artefato = joblib.load(MODEL_PATH)
_modelo   = _artefato["modelo"]
_perfis   = _artefato["perfis"]   # {0: {'nome': ..., 'cor': ...}, ...}

# Ranges do dataset de treinamento para normalização MinMaxScaler manual
_RANGES = {
    "SleepHours":     (3.0,  10.0),
    "ScreenTime":     (1.0,  12.0),
    "ExerciseFreq":   (0.0,   7.0),
    "AcademicStress": (0.0,  10.0),
    "PHQ9":           (0.0,  27.0),
    "GAD7":           (0.0,  21.0),
}

# Insights e recomendações por nome de perfil
_PERFIL_INFO = {
    "Equilibrado": {
        "nivelRisco": "Baixo",
        "insights": [
            "Sono dentro da faixa ideal",
            "Nível de exercício físico elevado",
            "Estresse acadêmico sob controle",
        ],
        "recomendacoes": [
            "Mantenha sua rotina de exercícios",
            "Continue priorizando o sono de qualidade",
            "Compartilhe suas estratégias de bem-estar com colegas",
        ],
    },
    "Rotina Saudável": {
        "nivelRisco": "Moderado",
        "insights": [
            "Sono adequado e estresse controlado",
            "Atividade física abaixo do recomendado",
            "Padrão geral estável, com margem de melhora",
        ],
        "recomendacoes": [
            "Inclua pelo menos 30 min de atividade física ao dia",
            "Mantenha horários regulares de sono",
            "Explore técnicas de mindfulness para manter o equilíbrio",
        ],
    },
    "Sob Pressão": {
        "nivelRisco": "Moderado",
        "insights": [
            "Sono abaixo da média recomendada",
            "Tempo de tela acima do ideal",
            "Nível de estresse acadêmico elevado",
        ],
        "recomendacoes": [
            "Reduza o tempo de tela 1h antes de dormir",
            "Adicione 30 min de caminhada ao dia",
            "Pratique respiração diafragmática em momentos de tensão",
        ],
    },
    "Em Alerta": {
        "nivelRisco": "Alto",
        "insights": [
            "Estresse acadêmico muito elevado",
            "Atividade física mínima ou ausente",
            "Indicadores de ansiedade significativos",
        ],
        "recomendacoes": [
            "Considere buscar apoio psicológico na universidade",
            "Divida tarefas em partes menores para reduzir a sobrecarga",
            "Priorize pelo menos 7h de sono por noite",
            "Inclua atividade física leve (caminhada) na rotina diária",
        ],
    },
}

# Mapeamentos inversos: schema do app → features do modelo
_HUMOR_TO_PHQ9 = {5: 2.0, 4: 7.0, 3: 12.0, 2: 17.0, 1: 23.0}
_ESTRESSE_TO_ACADEMIC = {"Baixo": 1.5, "Medio": 5.0, "Alto": 8.5}


def _normalizar(valor, feature):
    minv, maxv = _RANGES[feature]
    return float(np.clip((valor - minv) / (maxv - minv), 0.0, 1.0))


def _estimar_gad7(phq9: float, ansiedade: bool) -> float:
    """PHQ9 e GAD7 são clinicamente correlacionados (r≈0.72).
    Estimativa: GAD7 ≈ PHQ9 * (21/27), com acréscimo se ansiedadeAntesProva."""
    gad7 = phq9 * (21.0 / 27.0)
    if ansiedade:
        gad7 = min(21.0, gad7 + 4.0)
    return gad7


def classificar(dados: dict) -> dict:
    """
    Classifica um RegistroBemEstar no perfil comportamental K-Means.

    Parâmetros esperados em `dados`:
        duracaoSono       (float) — horas de sono
        tempoTela         (float) — horas de tela por dia
        atividadeFisica   (float) — horas de exercício por semana
        nivelEstresse     (str)   — "Baixo" | "Medio" | "Alto"
        nivelHumor        (int)   — 1 a 5
        ansiedadeAntesProva (bool)

    Retorna dict com: clusterId, nomePerfil, nivelRisco, insights, recomendacoes
    """
    phq9  = _HUMOR_TO_PHQ9.get(int(dados["nivelHumor"]), 12.0)
    acad  = _ESTRESSE_TO_ACADEMIC.get(dados["nivelEstresse"], 5.0)
    gad7  = _estimar_gad7(phq9, bool(dados["ansiedadeAntesProva"]))

    vetor_norm = np.array([[
        _normalizar(float(dados["duracaoSono"]),      "SleepHours"),
        _normalizar(float(dados["tempoTela"]),         "ScreenTime"),
        _normalizar(float(dados["atividadeFisica"]),   "ExerciseFreq"),
        _normalizar(acad,                              "AcademicStress"),
        _normalizar(phq9,                              "PHQ9"),
        _normalizar(gad7,                              "GAD7"),
    ]])

    cluster_id  = int(_modelo.predict(vetor_norm)[0])
    nome_perfil = _perfis[cluster_id]["nome"]
    info        = _PERFIL_INFO.get(nome_perfil, {})

    return {
        "clusterId":      cluster_id,
        "nomePerfil":     nome_perfil,
        "nivelRisco":     info.get("nivelRisco", "Moderado"),
        "insights":       info.get("insights", []),
        "recomendacoes":  info.get("recomendacoes", []),
    }
