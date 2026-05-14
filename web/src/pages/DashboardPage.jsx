import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import circuloAmarelo from '../assets/Circulo amarelo.png';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import Sidebar from '../components/Sidebar';
import './DashboardPage.css';

// ── Helpers para transformar dados da API ─────────────────────────────────

function calcularHumorMedio(registros) {
  if (!registros.length) return '—';
  return (registros.reduce((s, r) => s + r.nivelHumor, 0) / registros.length).toFixed(1);
}

function calcularDiasRegistrados(registros) {
  return new Set(registros.map(r => new Date(r.createdAt).toDateString())).size;
}

function calcularSequencia(registros) {
  if (!registros.length) return 0;
  const dias = [...new Set(
    registros.map(r => {
      const d = new Date(r.createdAt);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }),
  )].sort((a, b) => b - a);
  const hoje = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); })();
  if (dias[0] !== hoje && dias[0] !== hoje - 86400000) return 0;
  let seq = 1;
  for (let i = 1; i < dias.length; i++) {
    if (dias[i] === dias[i - 1] - 86400000) seq++;
    else break;
  }
  return seq;
}

function transformarDadosLinha(registros) {
  return [...registros]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-30)
    .map((r, i) => ({ dia: String(i + 1).padStart(2, '0'), humor: r.nivelHumor }));
}

function transformarDadosBarra(registros) {
  const nomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const soma  = Array(7).fill(0);
  const count = Array(7).fill(0);
  registros.forEach(r => {
    const dow = new Date(r.createdAt).getDay();
    soma[dow] += r.nivelHumor;
    count[dow]++;
  });
  return [1, 2, 3, 4, 5, 6, 0].map(dow => ({
    dia:   nomes[dow],
    humor: count[dow] > 0 ? parseFloat((soma[dow] / count[dow]).toFixed(1)) : 0,
  }));
}

function buildDadosPerfil(medias) {
  return [
    { label: 'Sono médio',       valor: `${medias.duracaoSono.toFixed(1)}h`,        ref: 'ideal: 7–9h' },
    { label: 'Tempo de tela',    valor: `${medias.tempoTela.toFixed(1)}h/dia`,      ref: 'ideal: < 6h' },
    { label: 'Atividade física', valor: `${medias.atividadeFisica.toFixed(1)}h/sem`, ref: 'ideal: > 4h' },
  ];
}

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
  const navigate        = useNavigate();
  const { user, token } = useAuth();

  const [humorSelecionado, setHumorSelecionado] = useState(null);
  const [modalVisivel, setModalVisivel]         = useState(false);
  const [modalPerfil, setModalPerfil]           = useState(false);

  // Dados reais
  const [registros, setRegistros]               = useState([]);
  const [loadingRegistros, setLoadingRegistros] = useState(true);
  const [perfil, setPerfil]                     = useState(null);
  const [loadingPerfil, setLoadingPerfil]       = useState(true);

  useEffect(() => {
    if (!token) { setLoadingRegistros(false); setLoadingPerfil(false); return; }

    api.listRegistros(token)
      .then(res => { if (res.success) setRegistros(res.data ?? []); })
      .catch(() => {})
      .finally(() => setLoadingRegistros(false));

    api.getProfile(token)
      .then(res => { if (res.success) setPerfil(res.data); })
      .catch(() => {})
      .finally(() => setLoadingPerfil(false));
  }, [token]);

  // Métricas derivadas dos registros reais
  const humorMedio      = calcularHumorMedio(registros);
  const diasRegistrados = calcularDiasRegistrados(registros);
  const sequencia       = calcularSequencia(registros);
  const dadosLinha      = transformarDadosLinha(registros);
  const dadosBarra      = transformarDadosBarra(registros);

  const metricas = [
    { label: 'Humor Médio',      valor: loadingRegistros ? '…' : humorMedio,                        icone: '😊', cor: 'verde'   },
    { label: 'Dias Registrados', valor: loadingRegistros ? '…' : String(diasRegistrados),            icone: '📅', cor: 'roxo'    },
    { label: 'Sequência Atual',  valor: loadingRegistros ? '…' : `${sequencia}d`,                   icone: '🔥', cor: 'laranja' },
    { label: 'Seu Perfil',       valor: loadingPerfil ? '…' : (perfil?.nomePerfil ?? '—'),          icone: '🧠', cor: 'amarelo' },
  ];

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
            <h1 className="dashboard-saudacao">Olá, {user?.name?.split(' ')[0]}! 👋</h1>
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
          {metricas.map((m) => {
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

              {loadingPerfil ? (
                /* Estado: carregando */
                <div className="perfil-modal-loading">
                  <div className="perfil-modal-loading-spinner" />
                  <p>Carregando perfil…</p>
                </div>
              ) : !perfil ? (
                /* Estado: sem perfil ainda */
                <>
                  <div className="perfil-modal-header">
                    <button className="perfil-modal-fechar" onClick={() => setModalPerfil(false)}>✕</button>
                    <span style={{ fontSize: 64 }}>🧠</span>
                    <h2 className="perfil-modal-nome">Perfil não disponível</h2>
                  </div>
                  <div className="perfil-modal-corpo">
                    <p className="perfil-modal-justificativa">
                      Seu perfil comportamental ainda não foi gerado. Complete pelo menos um registro diário e aguarde a classificação.
                    </p>
                    <button
                      className="modal-btn-primario"
                      style={{ marginTop: 8 }}
                      onClick={() => { setModalPerfil(false); navigate('/registro'); }}
                    >
                      Fazer primeiro registro
                    </button>
                  </div>
                </>
              ) : (
                /* Estado: perfil disponível */
                <>
                  {/* Header */}
                  <div className="perfil-modal-header">
                    <button className="perfil-modal-fechar" onClick={() => setModalPerfil(false)}>✕</button>
                    <span style={{ fontSize: 64, lineHeight: 1 }}>{perfil.emoji}</span>
                    <h2 className="perfil-modal-nome">{perfil.nomePerfil}</h2>
                    <span
                      className="perfil-modal-badge"
                      style={{ color: perfil.corRisco, background: perfil.bgRisco }}
                    >
                      Risco {perfil.nivelRisco}
                    </span>
                  </div>

                  {/* Corpo rolável */}
                  <div className="perfil-modal-corpo">

                    <p className="perfil-modal-justificativa">{perfil.justificativa}</p>

                    {/* Dados médios */}
                    <div className="perfil-modal-dados">
                      {buildDadosPerfil(perfil.medias).map(d => (
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
                        {perfil.insights.map((item, i) => (
                          <li key={i} className="perfil-lista-item perfil-lista-insight">{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Recomendações */}
                    <div className="perfil-modal-secao">
                      <h3 className="perfil-modal-secao-titulo">💡 Recomendações</h3>
                      <ul className="perfil-lista">
                        {perfil.recomendacoes.map((item, i) => (
                          <li key={i} className="perfil-lista-item perfil-lista-rec">{item}</li>
                        ))}
                      </ul>
                    </div>

                    <p className="perfil-modal-disclaimer">
                      Este resultado é baseado em padrões estatísticos e não substitui acompanhamento profissional de saúde mental.
                    </p>
                  </div>
                </>
              )}

            </div>
          </div>
        )}

        {/* Gráficos */}
        <section className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-titulo">Evolução do Humor</h2>
              <span className="chart-periodo">Últimos {dadosLinha.length || 30} dias</span>
            </div>
            {loadingRegistros ? (
              <div className="chart-loading">Carregando…</div>
            ) : dadosLinha.length === 0 ? (
              <div className="chart-loading">Adicione registros para ver a evolução</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dadosLinha} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<TooltipHumor />} />
                  <Line type="monotone" dataKey="humor" stroke="#6C5CE7" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#6C5CE7', stroke: '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-titulo">Humor por Dia da Semana</h2>
              <span className="chart-periodo">Média semanal</span>
            </div>
            {loadingRegistros ? (
              <div className="chart-loading">Carregando…</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dadosBarra} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<TooltipHumor />} />
                  <Bar dataKey="humor" fill="#6C5CE7" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Última avaliação — navega para /registro ao clicar */}
        <section className="avaliacao-card">
          <div className="avaliacao-info">
            <h2 className="avaliacao-titulo">Última Avaliação de Bem-Estar</h2>
            <p className="avaliacao-data">
              {loadingRegistros
                ? 'Carregando…'
                : registros.length > 0
                  ? `Respondido em ${new Date(registros[0].createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                  : 'Nenhum registro ainda'}
            </p>
          </div>
          <button className="avaliacao-btn" onClick={() => navigate('/registro')}>
            {registros.length > 0 ? 'Responder novamente' : 'Fazer primeiro registro'}
          </button>
        </section>

      </main>
    </div>
  );
}
