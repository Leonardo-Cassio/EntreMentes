import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import Sidebar from '../components/Sidebar';
import './DashboardPage.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function calcularMelhorSequencia(registros) {
  if (!registros.length) return 0;
  const dias = [...new Set(
    registros.map(r => {
      const d = new Date(r.createdAt);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }),
  )].sort((a, b) => a - b);
  let melhor = 1, atual = 1;
  for (let i = 1; i < dias.length; i++) {
    if (dias[i] === dias[i - 1] + 86400000) { atual++; melhor = Math.max(melhor, atual); }
    else atual = 1;
  }
  return melhor;
}

function contarRegistrosSemana(registros) {
  const sete = new Date(Date.now() - 7 * 86400000);
  return new Set(
    registros
      .filter(r => new Date(r.createdAt) >= sete)
      .map(r => new Date(r.createdAt).toDateString()),
  ).size;
}

function contarRegistrosMes(registros) {
  const agora = new Date();
  return new Set(
    registros
      .filter(r => {
        const d = new Date(r.createdAt);
        return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
      })
      .map(r => new Date(r.createdAt).toDateString()),
  ).size;
}

function contarPorDiaSemana(registros) {
  const nomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const count = Array(7).fill(0);
  registros.forEach(r => count[new Date(r.createdAt).getDay()]++);
  return [1, 2, 3, 4, 5, 6, 0].map(dow => ({ dia: nomes[dow], count: count[dow] }));
}

function getHumorLabel(valor) {
  if (isNaN(valor)) return '—';
  if (valor >= 4.5) return 'Muito bem 😄';
  if (valor >= 3.5) return 'Bem 🙂';
  if (valor >= 2.5) return 'Neutro 😐';
  if (valor >= 1.5) return 'Mal 😟';
  return 'Muito mal 😢';
}

const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

// ── Frases diárias ─────────────────────────────────────────────────────────────
const FRASES_DIARIAS = [
  { frase: 'Tudo o que um sonho precisa para ser realizado é alguém que acredite que ele possa ser realizado.', autor: 'Roberto Shinyashiki' },
  { frase: 'O sucesso é a soma de pequenos esforços repetidos dia após dia.', autor: 'Robert Collier' },
  { frase: 'Você não precisa ser ótimo para começar, mas precisa começar para ser ótimo.', autor: 'Zig Ziglar' },
  { frase: 'A mente é tudo. Você se torna aquilo que você pensa.', autor: 'Buda' },
  { frase: 'Não existe vento favorável para quem não sabe para onde vai.', autor: 'Sêneca' },
  { frase: 'A jornada de mil milhas começa com um único passo.', autor: 'Lao Tsé' },
  { frase: 'Conhecer a si mesmo é o começo de toda sabedoria.', autor: 'Aristóteles' },
  { frase: 'Respire. É apenas um mau dia, não uma má vida.', autor: 'Anônimo' },
  { frase: 'Você é mais corajoso do que acredita, mais forte do que parece e mais inteligente do que pensa.', autor: 'A.A. Milne' },
  { frase: 'Seja gentil com você mesmo. Você está fazendo o melhor que pode.', autor: 'Anônimo' },
  { frase: 'O fracasso é apenas a oportunidade de recomeçar com mais inteligência.', autor: 'Henry Ford' },
  { frase: 'A educação é a arma mais poderosa que você pode usar para mudar o mundo.', autor: 'Nelson Mandela' },
  { frase: 'A perseverança é o caminho do êxito.', autor: 'Charles Chaplin' },
  { frase: 'Progresso, não perfeição.', autor: 'Anônimo' },
  { frase: 'Nunca é tarde para ser o que você poderia ter sido.', autor: 'George Eliot' },
  { frase: 'A coragem não é a ausência do medo, mas a decisão de que algo é mais importante que o medo.', autor: 'Ambrose Redmoon' },
  { frase: 'O segredo do sucesso é a constância do propósito.', autor: 'Benjamin Disraeli' },
  { frase: 'Quanto mais você aprende, mais percebe o quanto ainda há para aprender.', autor: 'Aristóteles' },
  { frase: 'Cuide de si mesmo tanto quanto cuida dos seus estudos.', autor: 'Anônimo' },
  { frase: 'Cada dia traz uma nova chance de recomeçar.', autor: 'Anônimo' },
  { frase: 'Só há um caminho para a felicidade: parar de se preocupar com as coisas fora de nosso controle.', autor: 'Epicteto' },
  { frase: 'O bem-estar não é um destino, é uma prática diária.', autor: 'Anônimo' },
  { frase: 'Grandes realizações geralmente requerem grandes sacrifícios e não são alcançadas sem esforço.', autor: 'Mahatma Gandhi' },
  { frase: 'Não espere por uma crise para descobrir o que é importante em sua vida.', autor: 'Platão' },
  { frase: 'Seu único limite é você mesmo.', autor: 'Anônimo' },
  { frase: 'Sorrir é a menor distância entre duas pessoas.', autor: 'Victor Borge' },
  { frase: 'A vida é 10% o que acontece com você e 90% como você reage.', autor: 'Charles R. Swindoll' },
  { frase: 'Comece onde você está. Use o que você tem. Faça o que você pode.', autor: 'Arthur Ashe' },
  { frase: 'O mais importante é aproveitar sua vida — ser feliz é tudo que importa.', autor: 'Audrey Hepburn' },
  { frase: 'Pequenos progressos diários levam a grandes resultados.', autor: 'Satya Nadelha' },
];

function getFraseDoDia() {
  const inicio   = new Date(new Date().getFullYear(), 0, 0);
  const diaDaAno = Math.floor((new Date() - inicio) / 86400000);
  return FRASES_DIARIAS[diaDaAno % FRASES_DIARIAS.length];
}

function transformarDadosLinha(registros) {
  return [...registros]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-30)
    .map(r => {
      const d = new Date(r.createdAt);
      return {
        dia:   `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]}`,
        humor: r.nivelHumor,
      };
    });
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
    { label: 'Sono médio',       valor: `${medias.duracaoSono.toFixed(1)}h`,         ref: 'ideal: 7–9h' },
    { label: 'Tempo de tela',    valor: `${medias.tempoTela.toFixed(1)}h/dia`,       ref: 'ideal: < 6h' },
    { label: 'Atividade física', valor: `${medias.atividadeFisica.toFixed(1)}h/sem`, ref: 'ideal: > 4h' },
  ];
}

// ── Ícones SVG para métricas ───────────────────────────────────────────────────

function IconeHumor() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  );
}

function IconeCalendario() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function IconeSequencia() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  );
}

function IconePerfilMetrica() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
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

// ── Card de frase do dia — componente isolado para não re-renderizar o pai ──
function FraseDoDia() {
  const frase = getFraseDoDia();
  const [texto, setTexto] = useState('');

  useEffect(() => {
    let i = 0;
    let intervalId;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        i++;
        setTexto(frase.frase.slice(0, i));
        if (i >= frase.frase.length) clearInterval(intervalId);
      }, Math.floor(5000 / frase.frase.length)); // sempre 5s no total
    }, 800);
    return () => { clearTimeout(timeoutId); clearInterval(intervalId); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="frase-do-dia">
      <span className="frase-aspas">&ldquo;</span>
      <div className="frase-texto-wrapper">
        <p className="frase-texto frase-texto-ghost" aria-hidden="true">{frase.frase}</p>
        <p className="frase-texto frase-texto-animado">{texto}</p>
      </div>
      <span className="frase-autor">{frase.autor}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate        = useNavigate();
  const { user, token } = useAuth();

  const [humorSelecionado, setHumorSelecionado] = useState(null);
  const [modalVisivel, setModalVisivel]         = useState(false);
  const [modalPerfil, setModalPerfil]           = useState(false);
  const [modalGrafico, setModalGrafico]         = useState(null); // 'linha' | 'barra'
  const [modalMetrica, setModalMetrica]         = useState(null); // 'humor' | 'dias' | 'sequencia'

  const [registros, setRegistros]               = useState([]);
  const [loadingRegistros, setLoadingRegistros] = useState(true);
  const [perfil, setPerfil]                     = useState(null);
  const [loadingPerfil, setLoadingPerfil]       = useState(true);
  const [darkMode, setDarkMode]     = useState(
    () => localStorage.getItem('theme') === 'dark',
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // ── Efeito de digitação na saudação ──────────────────────────────────────
  const [saudacaoTexto, setSaudacaoTexto]       = useState('');
  const [saudacaoCompleta, setSaudacaoCompleta] = useState(false);

  useEffect(() => {
    if (!user?.name) return;
    const nome     = user.name.split(' ')[0];
    const completo = `Olá, ${nome}!`;
    let i          = 0;
    setSaudacaoTexto('');
    setSaudacaoCompleta(false);
    const t = setInterval(() => {
      i++;
      setSaudacaoTexto(completo.slice(0, i));
      if (i >= completo.length) {
        clearInterval(t);
        setTimeout(() => setSaudacaoCompleta(true), 1200);
      }
    }, 55);
    return () => clearInterval(t);
  }, [user?.name]);

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

  const humorMedio      = calcularHumorMedio(registros);
  const diasRegistrados = calcularDiasRegistrados(registros);
  const sequencia       = calcularSequencia(registros);
  const melhorSequencia = calcularMelhorSequencia(registros);
  const dadosLinha      = transformarDadosLinha(registros);
  const dadosBarra      = transformarDadosBarra(registros);

  const metricas = [
    { label: 'Humor Médio',      valor: loadingRegistros ? '…' : humorMedio,               icone: <IconeHumor />,         cor: 'verde',   tipo: 'humor'     },
    { label: 'Dias Registrados', valor: loadingRegistros ? '…' : String(diasRegistrados),   icone: <IconeCalendario />,    cor: 'roxo',    tipo: 'dias'      },
    { label: 'Sequência Atual',  valor: loadingRegistros ? '…' : `${sequencia}d`,          icone: <IconeSequencia />,     cor: 'laranja', tipo: 'sequencia' },
    { label: 'Seu Perfil',       valor: loadingPerfil ? '…' : (perfil?.nomePerfil ?? '—'), icone: <IconePerfilMetrica />, cor: 'roxo',    tipo: 'perfil'    },
  ];

  const humorAtual  = EMOJIS.find(e => e.nivel === humorSelecionado);

  const handleSelecionarHumor = (nivel) => {
    setHumorSelecionado(nivel);
    setModalVisivel(true);
  };

  const handleConfirmar = () => {
    setModalVisivel(false);
    navigate('/registro', { state: { nivelHumorInicial: humorSelecionado } });
  };

  // Primeiro registro (ordenado asc)
  const primeiroRegistro = registros.length
    ? [...registros].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]
    : null;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">

        {/* Saudação */}
        <section className="dashboard-header">
          <div>
            <h1 className="dashboard-saudacao">
              {saudacaoTexto}
              {!saudacaoCompleta && <span className="saudacao-cursor" />}
            </h1>
            <p className="dashboard-subtitulo">Como você está se sentindo hoje?</p>
          </div>

          <button className="tema-toggle" onClick={() => setDarkMode(d => !d)} aria-label="Alternar tema">
            <span className={`tema-label ${darkMode ? 'tema-visivel' : 'tema-oculto'}`}>Dark</span>
            <span className={`tema-label ${!darkMode ? 'tema-visivel' : 'tema-oculto'}`}>Light</span>
            <span className="tema-emoji-wrap">
              <span className={`tema-emoji ${darkMode ? 'tema-visivel' : 'tema-oculto'}`}>🌙</span>
              <span className={`tema-emoji ${!darkMode ? 'tema-visivel' : 'tema-oculto'}`}>☀️</span>
            </span>
          </button>

          {/* Frase do Dia — componente isolado para não re-renderizar o pai */}
          <FraseDoDia />
        </section>

        {/* Seletor de humor rápido */}
        <section className="emoji-section">
          {EMOJIS.map((e) => (
            <button
              key={e.nivel}
              className={`emoji-card emoji-nivel-${e.nivel} ${humorSelecionado === e.nivel ? 'ativo' : ''}`}
              onClick={() => handleSelecionarHumor(e.nivel)}
            >
              <span className="emoji-icon">{e.emoji}</span>
              <span className="emoji-label">{e.label}</span>
            </button>
          ))}
        </section>

        {/* Modal de confirmação de humor */}
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

        {/* Cards de métricas — todos clicáveis */}
        <section className="metricas-grid">
          {metricas.map((m) => (
            <div
              key={m.label}
              className={`metrica-card metrica-${m.cor} metrica-clicavel`}
              onClick={() => m.tipo === 'perfil' ? setModalPerfil(true) : setModalMetrica(m.tipo)}
            >
              <div className="metrica-icone">{m.icone}</div>
              <div className="metrica-info">
                <p className="metrica-label">{m.label}</p>
                <p className="metrica-valor">{m.valor}</p>
                <span className="metrica-ver-mais">
                  Ver detalhes
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* ── Modal de métricas (humor / dias / sequencia) ── */}
        {modalMetrica && (
          <div className="modal-overlay" onClick={() => setModalMetrica(null)}>
            <div className="metrica-modal" onClick={e => e.stopPropagation()}>

              {/* Cabeçalho gradiente */}
              <div className={`metrica-modal-header metrica-modal-header-${
                modalMetrica === 'humor' ? 'verde' :
                modalMetrica === 'dias'  ? 'roxo'  : 'laranja'
              }`}>
                <button className="metrica-modal-fechar" onClick={() => setModalMetrica(null)}>✕</button>
                <div className="metrica-modal-icone-wrap">
                  {modalMetrica === 'humor'    && <IconeHumor />}
                  {modalMetrica === 'dias'     && <IconeCalendario />}
                  {modalMetrica === 'sequencia'&& <IconeSequencia />}
                </div>
                <h2 className="metrica-modal-titulo-header">
                  {modalMetrica === 'humor'    ? 'Humor Médio'       :
                   modalMetrica === 'dias'     ? 'Dias Registrados'  : 'Sequência Atual'}
                </h2>
                <p className="metrica-modal-sub-header">
                  {modalMetrica === 'humor'    ? 'Análise do seu estado emocional'         :
                   modalMetrica === 'dias'     ? 'Consistência do seu acompanhamento'      :
                                                'Dias consecutivos com registro'}
                </p>
              </div>

              {/* Número em destaque */}
              <div className="metrica-modal-destaque">
                <span className="metrica-modal-numero">
                  {modalMetrica === 'humor'     ? humorMedio       :
                   modalMetrica === 'dias'      ? diasRegistrados  : `${sequencia}d`}
                </span>
                <span className="metrica-modal-descricao">
                  {modalMetrica === 'humor'     ? getHumorLabel(parseFloat(humorMedio))  :
                   modalMetrica === 'dias'      ? 'dias com registro'                    :
                                                  'sequência atual'}
                </span>
              </div>

              {/* Corpo por tipo */}
              <div className="metrica-modal-corpo">

                {/* ── Humor Médio ── */}
                {modalMetrica === 'humor' && (
                  <>
                    {dadosLinha.length > 0 && (
                      <div className="metrica-modal-chart">
                        <p className="metrica-modal-chart-label">Evolução recente</p>
                        <ResponsiveContainer width="100%" height={140}>
                          <AreaChart data={dadosLinha.slice(-7)} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                            <defs>
                              <linearGradient id="gradienteHumorCard" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%"   stopColor="#00A884" stopOpacity={0.32}/>
                                <stop offset="55%"  stopColor="#00A884" stopOpacity={0.08}/>
                                <stop offset="100%" stopColor="#00A884" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                            <XAxis dataKey="dia" tick={{ fontSize: 10, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                            <YAxis domain={[1,5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 10, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                            <Tooltip content={<TooltipHumor />} />
                            <Area type="linear" dataKey="humor" stroke="#00A884" strokeWidth={2}
                              fill="url(#gradienteHumorCard)"
                              dot={{ r: 3, fill: '#00A884', stroke: '#fff', strokeWidth: 1.5 }}
                              activeDot={{ r: 5, fill: '#00A884', stroke: '#fff', strokeWidth: 2 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    <div className="metrica-modal-stats">
                      <div className="metrica-stat-pill">
                        <span className="metrica-stat-val">
                          {registros.length ? Math.min(...registros.map(r => r.nivelHumor)) : '—'}
                        </span>
                        <span className="metrica-stat-lbl">Mínimo</span>
                      </div>
                      <div className="metrica-stat-pill">
                        <span className="metrica-stat-val">
                          {registros.length ? Math.max(...registros.map(r => r.nivelHumor)) : '—'}
                        </span>
                        <span className="metrica-stat-lbl">Máximo</span>
                      </div>
                      <div className="metrica-stat-pill">
                        <span className="metrica-stat-val">{registros.length}</span>
                        <span className="metrica-stat-lbl">Registros</span>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Dias Registrados ── */}
                {modalMetrica === 'dias' && (
                  <>
                    <div className="metrica-modal-stats">
                      <div className="metrica-stat-pill">
                        <span className="metrica-stat-val">{contarRegistrosSemana(registros)}</span>
                        <span className="metrica-stat-lbl">Esta semana</span>
                      </div>
                      <div className="metrica-stat-pill">
                        <span className="metrica-stat-val">{contarRegistrosMes(registros)}</span>
                        <span className="metrica-stat-lbl">Este mês</span>
                      </div>
                      <div className="metrica-stat-pill">
                        <span className="metrica-stat-val">{registros.length}</span>
                        <span className="metrica-stat-lbl">Total</span>
                      </div>
                    </div>
                    {registros.length > 0 && (
                      <div className="metrica-modal-chart">
                        <p className="metrica-modal-chart-label">Frequência por dia da semana</p>
                        <ResponsiveContainer width="100%" height={130}>
                          <BarChart data={contarPorDiaSemana(registros)} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
                            <defs>
                              <linearGradient id="gradienteDias" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%"   stopColor="#6C5CE7" stopOpacity={1}/>
                                <stop offset="100%" stopColor="#A29BFE" stopOpacity={0.8}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                            <Tooltip content={<TooltipHumor />} />
                            <Bar dataKey="count" name="Registros" fill="url(#gradienteDias)" radius={[6,6,0,0]} maxBarSize={32} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </>
                )}

                {/* ── Sequência Atual ── */}
                {modalMetrica === 'sequencia' && (
                  <>
                    <div className="metrica-modal-stats">
                      <div className="metrica-stat-pill">
                        <span className="metrica-stat-val">{sequencia}d</span>
                        <span className="metrica-stat-lbl">Atual</span>
                      </div>
                      <div className="metrica-stat-pill">
                        <span className="metrica-stat-val">{melhorSequencia}d</span>
                        <span className="metrica-stat-lbl">Melhor</span>
                      </div>
                      <div className="metrica-stat-pill">
                        <span className="metrica-stat-val">{diasRegistrados}</span>
                        <span className="metrica-stat-lbl">Dias totais</span>
                      </div>
                    </div>
                    <div className="metrica-modal-msg">
                      <p>
                        {sequencia === 0
                          ? '✨ Que tal recomeçar hoje? Cada registro conta!'
                          : sequencia < 3
                            ? '🌱 Ótimo começo! Continue registrando.'
                            : sequencia < 7
                              ? '🔥 Você está em uma boa sequência!'
                              : '⚡ Sequência incrível! Mantenha o ritmo.'}
                      </p>
                      {primeiroRegistro && (
                        <span className="metrica-modal-data-inicio">
                          Primeiro registro em{' '}
                          {new Date(primeiroRegistro.createdAt).toLocaleDateString('pt-BR', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </>
                )}

              </div>
            </div>
          </div>
        )}

        {/* Modal de perfil comportamental */}
        {modalPerfil && (
          <div className="modal-overlay" onClick={() => setModalPerfil(false)}>
            <div className="perfil-modal" onClick={e => e.stopPropagation()}>

              {loadingPerfil ? (
                <div className="perfil-modal-loading">
                  <div className="perfil-modal-loading-spinner" />
                  <p>Carregando perfil…</p>
                </div>
              ) : !perfil ? (
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
                <>
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
                  <div className="perfil-modal-corpo">
                    <p className="perfil-modal-justificativa">{perfil.justificativa}</p>
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
                    <div className="perfil-modal-secao">
                      <h3 className="perfil-modal-secao-titulo">⚠️ Pontos de atenção</h3>
                      <ul className="perfil-lista">
                        {perfil.insights.map((item, i) => (
                          <li key={i} className="perfil-lista-item perfil-lista-insight">{item}</li>
                        ))}
                      </ul>
                    </div>
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

        {/* Modal de gráfico expandido */}
        {modalGrafico && (
          <div className="modal-overlay" onClick={() => setModalGrafico(null)}>
            <div className="grafico-modal" onClick={e => e.stopPropagation()}>
              <div className="grafico-modal-header">
                <div>
                  <h2 className="grafico-modal-titulo">
                    {modalGrafico === 'linha' ? 'Evolução do Humor' : 'Humor por Dia da Semana'}
                  </h2>
                  <p className="grafico-modal-sub">
                    {modalGrafico === 'linha'
                      ? `${dadosLinha.length} registros mais recentes`
                      : 'Média de humor por dia da semana'}
                  </p>
                </div>
                <button className="grafico-modal-fechar" onClick={() => setModalGrafico(null)}>✕</button>
              </div>
              <div className="grafico-modal-corpo">
                {modalGrafico === 'linha' ? (
                  <ResponsiveContainer width="100%" height={360}>
                    <AreaChart data={dadosLinha} margin={{ top: 12, right: 16, left: -8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradienteHumorModal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#6C5CE7" stopOpacity={0.30}/>
                          <stop offset="55%"  stopColor="#6C5CE7" stopOpacity={0.08}/>
                          <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#B2BEC3' }} tickLine={false} axisLine={false} interval={2} />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                      <Tooltip content={<TooltipHumor />} />
                      <Area
                        type="linear"
                        dataKey="humor"
                        stroke="#6C5CE7"
                        strokeWidth={2.5}
                        fill="url(#gradienteHumorModal)"
                        dot={{ r: 4, fill: '#6C5CE7', stroke: '#fff', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#6C5CE7', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={dadosBarra} margin={{ top: 24, right: 16, left: -8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradienteBarraModal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#6C5CE7" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#A29BFE" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                      <XAxis dataKey="dia" tick={{ fontSize: 13, fill: '#636E72' }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                      <Tooltip content={<TooltipHumor />} />
                      <Bar
                        dataKey="humor"
                        fill="url(#gradienteBarraModal)"
                        radius={[10, 10, 0, 0]}
                        maxBarSize={64}
                        label={{ position: 'top', fontSize: 13, fill: '#6C5CE7', fontWeight: 700, formatter: v => v > 0 ? v : '' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Gráficos principais */}
        <section className="charts-grid">

          {/* Evolução do humor — AreaChart com gradiente fechado */}
          <div className="chart-card chart-card-interativo" onClick={() => setModalGrafico('linha')}>
            <div className="chart-header">
              <h2 className="chart-titulo">Evolução do Humor</h2>
              <span className="chart-periodo">Últimos {dadosLinha.length || 30} registros</span>
            </div>
            {loadingRegistros ? (
              <div className="chart-loading">Carregando…</div>
            ) : dadosLinha.length === 0 ? (
              <div className="chart-loading">Adicione registros para ver a evolução</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dadosLinha} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradienteHumor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#6C5CE7" stopOpacity={0.30}/>
                      <stop offset="55%"  stopColor="#6C5CE7" stopOpacity={0.08}/>
                      <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<TooltipHumor />} />
                  <Area
                    type="linear"
                    dataKey="humor"
                    stroke="#6C5CE7"
                    strokeWidth={2.5}
                    fill="url(#gradienteHumor)"
                    dot={{ r: 3, fill: '#6C5CE7', stroke: '#fff', strokeWidth: 1.5 }}
                    activeDot={{ r: 5, fill: '#6C5CE7', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Humor por dia da semana */}
          <div className="chart-card chart-card-interativo" onClick={() => setModalGrafico('barra')}>
            <div className="chart-header">
              <h2 className="chart-titulo">Humor por Dia da Semana</h2>
              <span className="chart-periodo">Média semanal</span>
            </div>
            {loadingRegistros ? (
              <div className="chart-loading">Carregando…</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dadosBarra} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradienteBarra" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#6C5CE7" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#A29BFE" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<TooltipHumor />} />
                  <Bar dataKey="humor" fill="url(#gradienteBarra)" radius={[8, 8, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </section>

        {/* Última avaliação */}
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
