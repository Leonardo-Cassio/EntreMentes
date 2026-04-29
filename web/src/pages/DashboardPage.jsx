import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import circuloAmarelo from '../assets/Circulo amarelo.png';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import Sidebar from '../components/Sidebar';
import './DashboardPage.css';

// ── Perfil comportamental (mock — substituir por GET /analytics/profile) ──
const PERFIL = {
  nome: 'Moderado',
  emoji: '🟡',
  risco: 'Moderado',
  corRisco: '#E17055',
  bgRisco: '#FFF3EE',
  justificativa:
    'Seu padrão indica equilíbrio parcial. Você mantém uma rotina de sono razoável, ' +
    'mas o tempo de tela acima da média e o estresse moderado apontam para pontos de melhora. ' +
    'Com pequenos ajustes de rotina é possível migrar para o perfil Equilibrado.',
  dados: [
    { label: 'Sono médio',      valor: '6.2h',     ref: 'ideal: 7–9h'  },
    { label: 'Tempo de tela',   valor: '8.1h/dia', ref: 'ideal: < 6h'  },
    { label: 'Atividade física',valor: '2.4h/sem', ref: 'ideal: > 4h'  },
  ],
  insights: [
    'Tempo de tela acima do recomendado',
    'Sono ligeiramente abaixo do ideal',
    'Nível de estresse moderado persistente',
  ],
  recomendacoes: [
    'Reduza o tempo de tela 1h antes de dormir',
    'Adicione 30 min de caminhada ao dia',
    'Pratique respiração diafragmática em momentos de tensão',
  ],
};

// ── Dados estáticos (mock) ─────────────────────────────────────────────────
const METRICAS = [
  { label: 'Humor Médio',      valor: '3.8',      icone: '😊', cor: 'verde'   },
  { label: 'Dias Registrados', valor: '23',        icone: '📅', cor: 'roxo'    },
  { label: 'Sequência Atual',  valor: '7d',        icone: '🔥', cor: 'laranja' },
  { label: 'Seu Perfil',       valor: 'Moderado',  icone: '🧠', cor: 'amarelo' },
];

const DADOS_LINHA = [
  { dia: '01', humor: 3 }, { dia: '02', humor: 4 }, { dia: '03', humor: 3 },
  { dia: '04', humor: 2 }, { dia: '05', humor: 3 }, { dia: '06', humor: 4 },
  { dia: '07', humor: 5 }, { dia: '08', humor: 4 }, { dia: '09', humor: 3 },
  { dia: '10', humor: 3 }, { dia: '11', humor: 2 }, { dia: '12', humor: 3 },
  { dia: '13', humor: 4 }, { dia: '14', humor: 4 }, { dia: '15', humor: 5 },
  { dia: '16', humor: 4 }, { dia: '17', humor: 3 }, { dia: '18', humor: 2 },
  { dia: '19', humor: 3 }, { dia: '20', humor: 4 }, { dia: '21', humor: 5 },
  { dia: '22', humor: 4 }, { dia: '23', humor: 3 }, { dia: '24', humor: 4 },
  { dia: '25', humor: 5 }, { dia: '26', humor: 4 }, { dia: '27', humor: 3 },
  { dia: '28', humor: 4 }, { dia: '29', humor: 5 }, { dia: '30', humor: 4 },
];

const DADOS_BARRA = [
  { dia: 'Seg', humor: 3.2 }, { dia: 'Ter', humor: 3.8 },
  { dia: 'Qua', humor: 2.9 }, { dia: 'Qui', humor: 4.1 },
  { dia: 'Sex', humor: 4.5 }, { dia: 'Sáb', humor: 4.8 },
  { dia: 'Dom', humor: 3.6 },
];

const EMOJIS = [
  { nivel: 1, emoji: '😢', label: 'Muito Ruim' },
  { nivel: 2, emoji: '😟', label: 'Ruim'       },
  { nivel: 3, emoji: '😐', label: 'Neutro'     },
  { nivel: 4, emoji: '🙂', label: 'Bom'        },
  { nivel: 5, emoji: '😄', label: 'Ótimo'      },
];

function TooltipHumor({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      <p className="chart-tooltip-value">{payload[0].value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [humorSelecionado, setHumorSelecionado] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalPerfil, setModalPerfil] = useState(false);

  const humorAtual = EMOJIS.find(e => e.nivel === humorSelecionado);

  const handleSelecionarHumor = (nivel) => {
    setHumorSelecionado(nivel);
    setModalVisivel(true);
  };

  const handleConfirmar = () => {
    setModalVisivel(false);
    navigate('/registro', { state: { nivelHumorInicial: humorSelecionado } });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">

        {/* Saudação */}
        <section className="dashboard-header">
          <div>
            <h1 className="dashboard-saudacao">Olá! 👋</h1>
            <p className="dashboard-subtitulo">Como você está se sentindo hoje?</p>
          </div>
        </section>

        {/* Seletor de humor rápido */}
        <section className="emoji-section">
          {EMOJIS.map((e) => (
            <button
              key={e.nivel}
              className={`emoji-card ${humorSelecionado === e.nivel ? 'ativo' : ''}`}
              onClick={() => handleSelecionarHumor(e.nivel)}
            >
              <span className="emoji-icon">{e.emoji}</span>
              <span className="emoji-label">{e.label}</span>
            </button>
          ))}
        </section>

        {/* Modal de confirmação */}
        {modalVisivel && (
          <div className="modal-overlay" onClick={() => setModalVisivel(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <span className="modal-emoji">{humorAtual?.emoji}</span>
              <h3 className="modal-titulo">Registrar como "{humorAtual?.label}"?</h3>
              <p className="modal-sub">
                Quer completar o registro de humor de hoje com mais detalhes?
              </p>
              <button className="modal-btn-primario" onClick={handleConfirmar}>
                Sim, completar registro
              </button>
              <button className="modal-btn-secundario" onClick={() => setModalVisivel(false)}>
                Agora não
              </button>
            </div>
          </div>
        )}

        {/* Cards de métricas */}
        <section className="metricas-grid">
          {METRICAS.map((m) => {
            const isPerfil = m.label === 'Seu Perfil';
            return (
              <div
                key={m.label}
                className={`metrica-card metrica-${m.cor}${isPerfil ? ' metrica-clicavel' : ''}`}
                onClick={isPerfil ? () => setModalPerfil(true) : undefined}
              >
                <div className="metrica-icone">{m.icone}</div>
                <div className="metrica-info">
                  <p className="metrica-label">{m.label}</p>
                  <p className="metrica-valor">{m.valor}</p>
                  {isPerfil && <p className="metrica-ver-mais">Ver detalhes →</p>}
                </div>
              </div>
            );
          })}
        </section>

        {/* Modal de perfil comportamental */}
        {modalPerfil && (
          <div className="modal-overlay" onClick={() => setModalPerfil(false)}>
            <div className="perfil-modal" onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="perfil-modal-header">
                <button className="perfil-modal-fechar" onClick={() => setModalPerfil(false)}>✕</button>
                <img src={circuloAmarelo} alt="Perfil" className="perfil-modal-emoji" />
                <h2 className="perfil-modal-nome">{PERFIL.nome}</h2>
                <span
                  className="perfil-modal-badge"
                  style={{ color: PERFIL.corRisco, background: PERFIL.bgRisco }}
                >
                  Risco {PERFIL.risco}
                </span>
              </div>

              {/* Corpo rolável */}
              <div className="perfil-modal-corpo">

                {/* Justificativa */}
                <p className="perfil-modal-justificativa">{PERFIL.justificativa}</p>

                {/* Dados do usuário */}
                <div className="perfil-modal-dados">
                  {PERFIL.dados.map(d => (
                    <div key={d.label} className="perfil-dado-pill">
                      <span className="perfil-dado-valor">{d.valor}</span>
                      <span className="perfil-dado-label">{d.label}</span>
                      <span className="perfil-dado-ref">{d.ref}</span>
                    </div>
                  ))}
                </div>

                <hr className="perfil-modal-divisor" />

                {/* Insights */}
                <div className="perfil-modal-secao">
                  <h3 className="perfil-modal-secao-titulo">⚠️ Pontos de atenção</h3>
                  <ul className="perfil-lista">
                    {PERFIL.insights.map((item, i) => (
                      <li key={i} className="perfil-lista-item perfil-lista-insight">{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Recomendações */}
                <div className="perfil-modal-secao">
                  <h3 className="perfil-modal-secao-titulo">💡 Recomendações</h3>
                  <ul className="perfil-lista">
                    {PERFIL.recomendacoes.map((item, i) => (
                      <li key={i} className="perfil-lista-item perfil-lista-rec">{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Disclaimer */}
                <p className="perfil-modal-disclaimer">
                  Este resultado é baseado em padrões estatísticos e não substitui acompanhamento profissional de saúde mental.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Gráficos */}
        <section className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-titulo">Evolução do Humor</h2>
              <span className="chart-periodo">Últimos 30 dias</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={DADOS_LINHA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} interval={4} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                <Tooltip content={<TooltipHumor />} />
                <Line type="monotone" dataKey="humor" stroke="#6C5CE7" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#6C5CE7', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-titulo">Humor por Dia da Semana</h2>
              <span className="chart-periodo">Média semanal</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={DADOS_BARRA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                <Tooltip content={<TooltipHumor />} />
                <Bar dataKey="humor" fill="#6C5CE7" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Última avaliação — navega para /registro ao clicar */}
        <section className="avaliacao-card">
          <div className="avaliacao-info">
            <h2 className="avaliacao-titulo">Última Avaliação de Bem-Estar</h2>
            <p className="avaliacao-data">Respondido em 15 de março de 2026</p>
          </div>
          <button className="avaliacao-btn" onClick={() => navigate('/registro')}>
            Responder novamente
          </button>
        </section>

      </main>
    </div>
  );
}
