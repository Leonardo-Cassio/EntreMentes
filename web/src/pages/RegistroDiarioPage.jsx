import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './RegistroDiarioPage.css';

// ── Constantes ────────────────────────────────────────────────────────────
const EMOJIS_HUMOR = [
  { nivel: 1, emoji: '😢', label: 'Muito mal'  },
  { nivel: 2, emoji: '😟', label: 'Mal'        },
  { nivel: 3, emoji: '😐', label: 'Neutro'     },
  { nivel: 4, emoji: '🙂', label: 'Bem'        },
  { nivel: 5, emoji: '😄', label: 'Muito bem'  },
];

const OPCOES_ESTRESSE = [
  { valor: 'Baixo', emoji: '😊', label: 'Baixo' },
  { valor: 'Medio', emoji: '😤', label: 'Médio' },
  { valor: 'Alto',  emoji: '😫', label: 'Alto'  },
];

const OPCOES_DESEMPENHO = [
  { valor: 'Melhorou', icone: '↗', label: 'Melhorou' },
  { valor: 'Mesmo',    icone: '→', label: 'Mesmo'    },
  { valor: 'Piorou',   icone: '↘', label: 'Piorou'   },
];

const DATA_HOJE = new Date().toLocaleDateString('pt-BR', {
  day: 'numeric', month: 'long', year: 'numeric',
});

// Retorna o estilo de fill dinâmico do slider
function sliderStyle(valor, min, max) {
  const pct = ((valor - min) / (max - min)) * 100;
  return {
    background: `linear-gradient(to right, #6C5CE7 ${pct}%, #DFE6E9 ${pct}%)`,
  };
}

// ── Ícones de seção ───────────────────────────────────────────────────────
const IcoTela   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="#6C5CE7" strokeWidth="2"/><path d="M8 21h8M12 17v4" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round"/></svg>;
const IcoSono   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round"/></svg>;
const IcoAtiv   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoEstres = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#6C5CE7" strokeWidth="2"/><path d="M8 15s1-2 4-2 4 2 4 2" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="9" x2="9.01" y2="9" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round"/><line x1="15" y1="9" x2="15.01" y2="9" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round"/></svg>;
const IcoAnsi   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round"/><polyline points="14 2 14 8 20 8" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round"/></svg>;
const IcoDesemp = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 6 23 6 23 12" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

// ── Componente principal ──────────────────────────────────────────────────
export default function RegistroDiarioPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [humor,      setHumor]      = useState(null);
  const [nota,       setNota]       = useState('');
  const [tempoTela,  setTempoTela]  = useState(7);
  const [sono,       setSono]       = useState(6);
  const [atividade,  setAtividade]  = useState(2);
  const [estresse,   setEstresse]   = useState(null);
  const [ansiedade,  setAnsiedade]  = useState(null);
  const [desempenho, setDesempenho] = useState(null);
  const [salvando,   setSalvando]   = useState(false);
  const [sucesso,    setSucesso]    = useState(false);

  // Progresso: 3 sliders sempre preenchidos + 4 seleções do usuário = 7 total
  const preenchidos = 3
    + (humor      !== null ? 1 : 0)
    + (estresse   !== null ? 1 : 0)
    + (ansiedade  !== null ? 1 : 0)
    + (desempenho !== null ? 1 : 0);
  const progresso = Math.round((preenchidos / 7) * 100);
  const completo  = preenchidos === 7;

  const handleSalvar = async () => {
    if (!completo) return;
    setSalvando(true);
    try {
      const res = await api.createRegistro(token, {
        nivelHumor:          humor,
        nota:                nota || undefined,
        tempoTela:           tempoTela,
        duracaoSono:         sono,
        atividadeFisica:     atividade,
        nivelEstresse:       estresse,
        ansiedadeAntesProva: ansiedade,
        desempenhoAcademico: desempenho,
      });
      if (!res.success) throw new Error(res.message || 'Erro ao salvar');
      setSucesso(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      alert(`Não foi possível salvar o registro: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  };

  if (sucesso) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="registro-main">
          <div className="registro-sucesso">
            <span className="sucesso-icone">✅</span>
            <h2>Registro salvo com sucesso!</h2>
            <p>Redirecionando para o Dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="registro-main">
        <div className="registro-container">

          {/* Header */}
          <div className="registro-header">
            <div>
              <h1 className="registro-titulo">Registro Diário</h1>
              <p className="registro-subtitulo">
                Como você está hoje? Registre seu humor e responda algumas perguntas rápidas
              </p>
            </div>
            <div className="registro-data">
              <span>📅</span>
              <span>{DATA_HOJE}</span>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="progresso-wrapper">
            <div className="progresso-barra">
              <div className="progresso-fill" style={{ width: `${progresso}%` }} />
            </div>
            <span className="progresso-label">{progresso}% completo</span>
          </div>

          {/* ── Seu Humor Hoje ── */}
          <div className="form-card">
            <h2 className="form-card-titulo">Seu Humor Hoje</h2>
            <div className="emoji-row">
              {EMOJIS_HUMOR.map(e => (
                <button
                  key={e.nivel}
                  className={`emoji-opcao ${humor === e.nivel ? 'ativo' : ''}`}
                  onClick={() => setHumor(e.nivel)}
                >
                  <span className="emoji-opcao-icon">{e.emoji}</span>
                  <span className="emoji-opcao-label">{e.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Nota opcional ── */}
          <div className="form-card">
            <label className="nota-label">
              Deseja adicionar uma nota? <span className="opcional">(opcional)</span>
            </label>
            <textarea
              className="nota-textarea"
              placeholder="Escreva como você está se sentindo..."
              maxLength={280}
              value={nota}
              onChange={e => setNota(e.target.value)}
            />
            <span className="nota-contador">{nota.length}/280</span>
          </div>

          {/* ── Divisor ── */}
          <div className="divisor">
            <span className="divisor-texto">Avaliação de Bem-Estar</span>
          </div>

          {/* ── Tempo de Tela ── */}
          <div className="avaliacao-card">
            <div className="avaliacao-header">
              <IcoTela />
              <div>
                <h3 className="avaliacao-titulo">Tempo de Tela</h3>
                <p className="avaliacao-sub">Quantas horas por dia você fica em frente a telas?</p>
              </div>
            </div>
            <div className="slider-wrapper">
              <input
                type="range" min={0} max={12} step={0.5}
                value={tempoTela}
                style={sliderStyle(tempoTela, 0, 12)}
                onChange={e => setTempoTela(Number(e.target.value))}
              />
              <span className="slider-valor">{tempoTela.toFixed(1)}h</span>
            </div>
          </div>

          {/* ── Duração do Sono ── */}
          <div className="avaliacao-card">
            <div className="avaliacao-header">
              <IcoSono />
              <div>
                <h3 className="avaliacao-titulo">Duração do Sono</h3>
                <p className="avaliacao-sub">Quantas horas por noite você dorme?</p>
              </div>
            </div>
            <div className="slider-wrapper">
              <input
                type="range" min={0} max={12} step={0.5}
                value={sono}
                style={sliderStyle(sono, 0, 12)}
                onChange={e => setSono(Number(e.target.value))}
              />
              <span className="slider-valor">{sono.toFixed(1)}h</span>
            </div>
          </div>

          {/* ── Atividade Física ── */}
          <div className="avaliacao-card">
            <div className="avaliacao-header">
              <IcoAtiv />
              <div>
                <h3 className="avaliacao-titulo">Atividade Física</h3>
                <p className="avaliacao-sub">Quantas horas por semana você pratica exercício?</p>
              </div>
            </div>
            <div className="slider-wrapper">
              <input
                type="range" min={0} max={10} step={0.5}
                value={atividade}
                style={sliderStyle(atividade, 0, 10)}
                onChange={e => setAtividade(Number(e.target.value))}
              />
              <span className="slider-valor">{atividade.toFixed(1)}h</span>
            </div>
          </div>

          {/* ── Nível de Estresse ── */}
          <div className="avaliacao-card">
            <div className="avaliacao-header">
              <IcoEstres />
              <div>
                <h3 className="avaliacao-titulo">Nível de Estresse</h3>
                <p className="avaliacao-sub">Como você avalia seu nível de estresse atual?</p>
              </div>
            </div>
            <div className="opcoes-row">
              {OPCOES_ESTRESSE.map(o => (
                <button
                  key={o.valor}
                  className={`opcao-btn ${estresse === o.valor ? 'ativo' : ''}`}
                  onClick={() => setEstresse(o.valor)}
                >
                  {o.emoji} {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Ansiedade antes de Provas ── */}
          <div className="avaliacao-card">
            <div className="avaliacao-header">
              <IcoAnsi />
              <div>
                <h3 className="avaliacao-titulo">Ansiedade antes de Provas</h3>
                <p className="avaliacao-sub">Você sente ansiedade antes de provas ou avaliações?</p>
              </div>
            </div>
            <div className="opcoes-row">
              <button
                className={`opcao-btn ${ansiedade === true ? 'ativo' : ''}`}
                onClick={() => setAnsiedade(true)}
              >
                Sim
              </button>
              <button
                className={`opcao-btn ${ansiedade === false ? 'ativo' : ''}`}
                onClick={() => setAnsiedade(false)}
              >
                Não
              </button>
            </div>
          </div>

          {/* ── Desempenho Acadêmico ── */}
          <div className="avaliacao-card">
            <div className="avaliacao-header">
              <IcoDesemp />
              <div>
                <h3 className="avaliacao-titulo">Desempenho Acadêmico</h3>
                <p className="avaliacao-sub">Como você percebe seu desempenho acadêmico recente?</p>
              </div>
            </div>
            <div className="opcoes-row">
              {OPCOES_DESEMPENHO.map(o => (
                <button
                  key={o.valor}
                  className={`opcao-btn ${desempenho === o.valor ? 'ativo' : ''}`}
                  onClick={() => setDesempenho(o.valor)}
                >
                  <span className="opcao-icone">{o.icone}</span> {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Botão salvar ── */}
          <button
            className={`salvar-btn ${!completo ? 'desabilitado' : ''}`}
            onClick={handleSalvar}
            disabled={!completo || salvando}
          >
            {salvando ? 'Salvando...' : 'Salvar Registro Completo'}
          </button>
          <p className="salvar-aviso">Você pode atualizar seu registro uma vez por dia</p>

        </div>
      </main>
    </div>
  );
}
