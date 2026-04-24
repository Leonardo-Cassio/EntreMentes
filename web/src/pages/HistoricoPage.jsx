import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './HistoricoPage.css';

const EMOJIS = { 1: '😢', 2: '😟', 3: '😐', 4: '🙂', 5: '😄' };
const LABELS = { 1: 'Muito mal', 2: 'Mal', 3: 'Neutro', 4: 'Bem', 5: 'Muito bem' };
const COR_ESTRESSE = { Baixo: '#00B894', Medio: '#FDCB6E', Alto: '#E17055' };

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function CardRegistro({ item }) {
  const [expandido, setExpandido] = useState(false);
  const cor = COR_ESTRESSE[item.nivelEstresse];

  return (
    <div className="historico-card" onClick={() => setExpandido(v => !v)}>
      <div className="historico-card-topo">
        <span className="historico-emoji">{EMOJIS[item.nivelHumor]}</span>
        <div className="historico-card-info">
          <span className="historico-humor">{LABELS[item.nivelHumor]}</span>
          <span className="historico-data">{formatarData(item.createdAt)}</span>
        </div>
        <span className="historico-badge" style={{ background: cor + '22', color: cor }}>
          {item.nivelEstresse}
        </span>
        <span className="historico-chevron">{expandido ? '▲' : '▼'}</span>
      </div>

      {expandido && (
        <div className="historico-detalhes">
          <div className="historico-grade">
            <div className="historico-item">🌙 <b>Sono</b> {item.duracaoSono.toFixed(1)}h</div>
            <div className="historico-item">🖥️ <b>Tela</b> {item.tempoTela.toFixed(1)}h</div>
            <div className="historico-item">🏃 <b>Exercício</b> {item.atividadeFisica.toFixed(1)}h</div>
            <div className="historico-item">📈 <b>Desempenho</b> {item.desempenhoAcademico}</div>
            <div className="historico-item">📝 <b>Ansiedade</b> {item.ansiedadeAntesProva ? 'Sim' : 'Não'}</div>
          </div>
          {item.nota && (
            <div className="historico-nota">💬 {item.nota}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoricoPage() {
  const { token } = useAuth();
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await api.listRegistros(token);
        if (!res.success) throw new Error(res.message || 'Erro ao buscar registros');
        setRegistros(res.data);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [token]);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="historico-main">
        <div className="historico-container">
          <div className="historico-header">
            <h1 className="historico-titulo">Histórico</h1>
            <p className="historico-subtitulo">Seus registros de bem-estar</p>
          </div>

          {carregando ? (
            <div className="historico-estado">
              <div className="historico-spinner" />
              <span>Carregando registros...</span>
            </div>
          ) : erro ? (
            <div className="historico-estado">
              <span className="historico-estado-icone">⚠️</span>
              <p>{erro}</p>
            </div>
          ) : registros.length === 0 ? (
            <div className="historico-estado">
              <span className="historico-estado-icone">📋</span>
              <p className="historico-vazio-titulo">Nenhum registro ainda</p>
              <p className="historico-vazio-sub">Faça seu primeiro registro na tela "Registrar Humor"</p>
            </div>
          ) : (
            <div className="historico-lista">
              {registros.map(item => (
                <CardRegistro key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
