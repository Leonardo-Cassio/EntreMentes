import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import Sidebar from '../components/Sidebar';
import './DashboardPage.css';

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
              onClick={() => setHumorSelecionado(e.nivel)}
            >
              <span className="emoji-icon">{e.emoji}</span>
              <span className="emoji-label">{e.label}</span>
            </button>
          ))}
        </section>

        {/* Cards de métricas */}
        <section className="metricas-grid">
          {METRICAS.map((m) => (
            <div key={m.label} className={`metrica-card metrica-${m.cor}`}>
              <div className="metrica-icone">{m.icone}</div>
              <div className="metrica-info">
                <p className="metrica-label">{m.label}</p>
                <p className="metrica-valor">{m.valor}</p>
              </div>
            </div>
          ))}
        </section>

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
