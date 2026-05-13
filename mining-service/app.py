"""
EntreMentes — Mining Service
Flask API para classificação de perfil comportamental via K-Means.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Importa após load_dotenv para que MODEL_PATH já esteja definido
from classifier import classificar

CAMPOS_OBRIGATORIOS = [
    "duracaoSono",
    "tempoTela",
    "atividadeFisica",
    "nivelEstresse",
    "nivelHumor",
    "ansiedadeAntesProva",
]

NIVEIS_ESTRESSE_VALIDOS = {"Baixo", "Medio", "Alto"}


def _validar(dados: dict):
    faltando = [c for c in CAMPOS_OBRIGATORIOS if c not in dados]
    if faltando:
        return f"Campos obrigatórios ausentes: {', '.join(faltando)}"

    if dados["nivelEstresse"] not in NIVEIS_ESTRESSE_VALIDOS:
        return "nivelEstresse deve ser 'Baixo', 'Medio' ou 'Alto'"

    humor = dados["nivelHumor"]
    if not isinstance(humor, int) or humor not in range(1, 6):
        return "nivelHumor deve ser inteiro entre 1 e 5"

    return None


@app.get("/health")
def health():
    return jsonify({"success": True, "message": "Mining Service OK"})


@app.post("/classify")
def classify():
    dados = request.get_json(silent=True)

    if not dados:
        return jsonify({"success": False, "data": None, "message": "Body JSON inválido"}), 400

    erro = _validar(dados)
    if erro:
        return jsonify({"success": False, "data": None, "message": erro}), 400

    try:
        resultado = classificar(dados)
        return jsonify({"success": True, "data": resultado, "message": None})
    except Exception as e:
        return jsonify({"success": False, "data": None, "message": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
