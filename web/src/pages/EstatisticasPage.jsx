import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './EstatisticasPage.css';

const HUMOR_LABELS  = { 1: 'Muito mal', 2: 'Mal', 3: 'Neutro', 4: 'Bem', 5: 'Muito bem' };
const HUMOR_EMOJIS  = { 1: '😢', 2: '😟', 3: '😐', 4: '🙂', 5: '😄' };
const ESTRESSE_COR  = { Baixo: '#00B894', Medio: '#FDCB6E', Alto: '#E17055' };
const DESEMPENHO_COR = { Melhorou: '#00B894', Mesmo: '#74B9FF', Piorou: '#E17055' };

function media(arr) {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function calcularEstatisticas(registros) {
  if (!registros.length) return null;

  const sonoMedio      = media(registros.map(r => r.duracaoSono));
  const telaMedio      = media(registros.map(r => r.tempoTela));
  const atividadeMedio = media(registros.map(r => r.atividadeFisica));
  const taxaAnsiedade  = Math.round(
    (registros.filter(r => r.ansiedadeAntesProva).length / registros.length) * 100,
  );

  const distHumor = [1, 2, 3, 4, 5].map(n => ({
    label: `${HUMOR_EMOJIS[n]} ${HUMOR_LABELS[n]}`,
    count: registros.filter(r => r.nivelHumor === n).length,
  }));

  const estresseContagem = { Baixo: 0, Medio: 0, Alto: 0 };
  registros.forEach(r => { if (r.nivelEstresse) estresseContagem[r.nivelEstresse]++; });
  const distEstresse = Object.entries(estresseContagem).map(([k, v]) => ({ label: k, count: v }));

  const desempenhoContagem = { Melhorou: 0, Mesmo: 0, Piorou: 0 };
  registros.forEach(r => { if (r.desempenhoAcademico) desempenhoContagem[r.desempenhoAcademico]++; });
  const distDesempenho = Object.entries(desempenhoContagem).map(([k, v]) => ({ label: k, count: v }));

  const ultimos30 = [...registros]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-30)
    .map((r, i) => ({
      dia:       String(i + 1).padStart(2, '0'),
      sono:      parseFloat(r.duracaoSono.toFixed(1)),
      tela:      parseFloat(r.tempoTela.toFixed(1)),
      atividade: parseFloat(r.atividadeFisica.toFixed(1)),
    }));

  return { sonoMedio, telaMedio, atividadeMedio, taxaAnsiedade, distHumor, distEstresse, distDesempenho, ultimos30 };
}

function TooltipPersonalizado({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="est-tooltip">
      <p className="est-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="est-tooltip-valor" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

function CardSummary({ icone, label, valor, sub, cor }) {
  return (
    <div className={`est-summary-card est-summary-${cor}`}>
      <div className="est-summary-icone">{icone}</div>
      <div className="est-summary-info">
        <p className="est-summary-label">{label}</p>
        <p className="est-summary-valor">{valor}</p>
        {sub && <p className="est-summary-sub">{sub}</p>}
      </div>
    </div>
  );
}

export default function EstatisticasPage() {
  const { token } = useAuth();
  const [registros, setRegistros]   = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]             = useState(null);

  useEffect(() => {
    api.listRegistros(token)
      .then(res => {
        if (!res.success) throw new Error(res.message || 'Erro ao buscar registros');
        setRegistros(res.data ?? []);
      })
      .catch(e => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [token]);

  const stats = calcularEstatisticas(registros);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="est-main">
        <div className="est-container">

          <div className="est-page-header">
            <h1 className="est-titulo">Estatísticas</h1>
            <p className="est-subtitulo">
              Análise detalhada do seu bem-estar — {registros.length} registro{registros.length !== 1 ? 's' : ''}
            </p>
          </div>

          {carregando ? (
            <div className="est-estado">
              <div className="est-spinner" />
              <span>Carregando estatísticas...</span>
            </div>
          ) : erro ? (
            <div className="est-estado">
              <span className="est-estado-icone">⚠️</span>
              <p>{erro}</p>
            </div>
          ) : !stats ? (
            <div className="est-estado">
              <span className="est-estado-icone">📊</span>
              <p className="est-vazio-titulo">Sem dados ainda</p>
              <p className="est-vazio-sub">Faça pelo menos um registro de humor para ver suas estatísticas.</p>
            </div>
          ) : (
            <>
              <div className="est-summary-grid">
                <CardSummary icone="🌙" label="Sono médio"       valor={`${stats.sonoMedio.toFixed(1)}h`}      sub="ideal: 7–9h"     cor="roxo"    />
                <CardSummary icone="🖥️" label="Tela média"        valor={`${stats.telaMedio.toFixed(1)}h/dia`}  sub="ideal: < 6h"     cor="azul"    />
                <CardSummary icone="🏃" label="Atividade física"  valor={`${stats.atividadeMedio.toFixed(1)}h`} sub="por registro"    cor="verde"   />
                <CardSummary icone="😰" label="Taxa de ansiedade" valor={`${stats.taxaAnsiedade}%`}             sub="antes de provas" cor="laranja" />
              </div>

              <div className="est-charts-grid">
                <div className="est-chart-card">
                  <div className="est-chart-header">
                    <h2 className="est-chart-titulo">Distribuição do Humor</h2>
                    <span className="est-chart-periodo">Total de registros</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.distHumor} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                      <Tooltip content={<TooltipPersonalizado />} />
                      <Bar dataKey="count" name="Registros" radius={[6, 6, 0, 0]} maxBarSize={40}>
                        {stats.distHumor.map((_, i) => (
                          <Cell key={i} fill={['#E17055', '#FDCB6E', '#B2BEC3', '#74B9FF', '#00B894'][i]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="est-chart-card">
                  <div className="est-chart-header">
                    <h2 className="est-chart-titulo">Nível de Estresse</h2>
                    <span className="est-chart-periodo">Frequência</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.distEstresse} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 13, fill: '#636E72' }} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                      <Tooltip content={<TooltipPersonalizado />} />
                      <Bar dataKey="count" name="Registros" radius={[6, 6, 0, 0]} maxBarSize={56}>
                        {stats.distEstresse.map((entry, i) => (
                          <Cell key={i} fill={ESTRESSE_COR[entry.label] ?? '#B2BEC3'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="est-charts-grid">
                <div className="est-chart-card">
                  <div className="est-chart-header">
                    <h2 className="est-chart-titulo">Desempenho Acadêmico</h2>
                    <span className="est-chart-periodo">Frequência</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.distDesempenho} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 13, fill: '#636E72' }} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                      <Tooltip content={<TooltipPersonalizado />} />
                      <Bar dataKey="count" name="Registros" radius={[6, 6, 0, 0]} maxBarSize={56}>
                        {stats.distDesempenho.map((entry, i) => (
                          <Cell key={i} fill={DESEMPENHO_COR[entry.label] ?? '#B2BEC3'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="est-chart-card">
                  <div className="est-chart-header">
                    <h2 className="est-chart-titulo">Sono e Tela</h2>
                    <span className="est-chart-periodo">Últimos {stats.ultimos30.length} registros</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={stats.ultimos30} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} interval={4} />
                      <YAxis tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                      <Tooltip content={<TooltipPersonalizado />} />
                      <Line type="monotone" dataKey="sono" name="Sono (h)" stroke="#6C5CE7" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="tela" name="Tela (h)" stroke="#E17055" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="est-legenda">
                    <span className="est-legenda-item"><span className="est-legenda-cor" style={{ background: '#6C5CE7' }} /> Sono</span>
                    <span className="est-legenda-item"><span className="est-legenda-cor" style={{ background: '#E17055' }} /> Tela</span>
                  </div>
                </div>
              </div>

              <div className="est-chart-card est-chart-full">
                <div className="est-chart-header">
                  <h2 className="est-chart-titulo">Atividade Física ao Longo do Tempo</h2>
                  <span className="est-chart-periodo">Últimos {stats.ultimos30.length} registros</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.ultimos30} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 11, fill: '#B2BEC3' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<TooltipPersonalizado />} />
                    <Line type="monotone" dataKey="atividade" name="Atividade (h)" stroke="#00B894" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#00B894', stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <p className="est-disclaimer">
                Este conteúdo é baseado em padrões estatísticos e não substitui acompanhamento profissional de saúde mental.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
