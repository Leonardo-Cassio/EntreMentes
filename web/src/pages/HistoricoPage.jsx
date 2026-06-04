import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './HistoricoPage.css';

const EMOJIS  = { 1: '😢', 2: '😟', 3: '😐', 4: '🙂', 5: '😄' };
const LABELS  = { 1: 'Muito mal', 2: 'Mal', 3: 'Neutro', 4: 'Bem', 5: 'Muito bem' };
const COR_ESTRESSE = { Baixo: '#00B894', Medio: '#FDCB6E', Alto: '#E17055' };

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

/* ── Modal de Edição ──────────────────────────────────────────────────────── */
function ModalEdicao({ item, onSalvar, onFechar, salvando }) {
  const [form, setForm] = useState({
    nivelHumor:          item.nivelHumor,
    nivelEstresse:       item.nivelEstresse,
    duracaoSono:         item.duracaoSono,
    tempoTela:           item.tempoTela,
    atividadeFisica:     item.atividadeFisica,
    ansiedadeAntesProva: item.ansiedadeAntesProva,
    desempenhoAcademico: item.desempenhoAcademico,
    nota:                item.nota || '',
  });

  const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

  // Fecha com Esc
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onFechar(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onFechar]);

  return (
    <div className="hm-overlay" onClick={onFechar}>
      <div className="hm-modal" onClick={e => e.stopPropagation()}>
        <div className="hm-modal-header">
          <h2 className="hm-modal-titulo">Editar Registro</h2>
          <span className="hm-modal-data">{formatarData(item.createdAt)}</span>
        </div>

        {/* Humor */}
        <div className="hm-campo">
          <label className="hm-label">Como você estava?</label>
          <div className="hm-emojis">
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                className={`hm-emoji-btn ${form.nivelHumor === n ? 'ativo' : ''}`}
                onClick={() => set('nivelHumor', n)}
                title={LABELS[n]}
              >
                {EMOJIS[n]}
              </button>
            ))}
          </div>
        </div>

        {/* Estresse */}
        <div className="hm-campo">
          <label className="hm-label">Nível de estresse</label>
          <div className="hm-opcoes">
            {['Baixo','Medio','Alto'].map(op => (
              <button
                key={op}
                className={`hm-opcao-btn ${form.nivelEstresse === op ? 'ativo' : ''}`}
                style={form.nivelEstresse === op ? { background: COR_ESTRESSE[op] + '22', borderColor: COR_ESTRESSE[op], color: COR_ESTRESSE[op] } : {}}
                onClick={() => set('nivelEstresse', op)}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="hm-sliders">
          <SliderCampo label="🌙 Sono" valor={form.duracaoSono} min={0} max={12} step={0.5}
            onChange={v => set('duracaoSono', v)} unidade="h" />
          <SliderCampo label="🖥️ Tempo de tela" valor={form.tempoTela} min={0} max={16} step={0.5}
            onChange={v => set('tempoTela', v)} unidade="h" />
          <SliderCampo label="🏃 Atividade física" valor={form.atividadeFisica} min={0} max={8} step={0.5}
            onChange={v => set('atividadeFisica', v)} unidade="h" />
        </div>

        {/* Desempenho + Ansiedade */}
        <div className="hm-linha-dupla">
          <div className="hm-campo">
            <label className="hm-label">Desempenho acadêmico</label>
            <div className="hm-opcoes">
              {['Melhorou','Mesmo','Piorou'].map(op => (
                <button
                  key={op}
                  className={`hm-opcao-btn ${form.desempenhoAcademico === op ? 'ativo' : ''}`}
                  onClick={() => set('desempenhoAcademico', op)}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          <div className="hm-campo">
            <label className="hm-label">Ansiedade antes de prova</label>
            <button
              className={`hm-toggle ${form.ansiedadeAntesProva ? 'ativo' : ''}`}
              onClick={() => set('ansiedadeAntesProva', !form.ansiedadeAntesProva)}
            >
              {form.ansiedadeAntesProva ? '✅ Sim' : '⬜ Não'}
            </button>
          </div>
        </div>

        {/* Nota */}
        <div className="hm-campo">
          <label className="hm-label">Nota (opcional)</label>
          <textarea
            className="hm-textarea"
            value={form.nota}
            onChange={e => set('nota', e.target.value)}
            placeholder="Como foi o seu dia?"
            rows={2}
          />
        </div>

        <div className="hm-modal-botoes">
          <button className="hm-btn-cancelar" onClick={onFechar} disabled={salvando}>
            Cancelar
          </button>
          <button className="hm-btn-salvar" onClick={() => onSalvar(form)} disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SliderCampo({ label, valor, min, max, step, onChange, unidade }) {
  return (
    <div className="hm-slider-campo">
      <div className="hm-slider-topo">
        <span className="hm-label">{label}</span>
        <span className="hm-slider-valor">{Number(valor).toFixed(1)}{unidade}</span>
      </div>
      <input
        type="range"
        className="hm-slider"
        min={min} max={max} step={step}
        value={valor}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

/* ── Modal de Confirmação de Exclusão ────────────────────────────────────── */
function ModalExcluir({ onConfirmar, onFechar, excluindo }) {
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onFechar(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onFechar]);

  return (
    <div className="hm-overlay" onClick={onFechar}>
      <div className="hm-modal hm-modal-pequeno" onClick={e => e.stopPropagation()}>
        <span className="hm-excluir-icone">🗑️</span>
        <h2 className="hm-modal-titulo">Excluir registro?</h2>
        <p className="hm-excluir-texto">
          Essa ação não pode ser desfeita. O registro será removido permanentemente.
        </p>
        <div className="hm-modal-botoes">
          <button className="hm-btn-cancelar" onClick={onFechar} disabled={excluindo}>
            Cancelar
          </button>
          <button className="hm-btn-excluir" onClick={onConfirmar} disabled={excluindo}>
            {excluindo ? 'Excluindo…' : 'Sim, excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Card ─────────────────────────────────────────────────────────────────── */
function CardRegistro({ item, onEditar, onExcluir }) {
  const [expandido, setExpandido] = useState(false);
  const cor = COR_ESTRESSE[item.nivelEstresse];

  const handleAcao = (e, fn) => {
    e.stopPropagation();
    fn();
  };

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
        <div className="historico-acoes" onClick={e => e.stopPropagation()}>
          <button className="historico-acao-btn editar" onClick={e => handleAcao(e, onEditar)} title="Editar">
            ✏️
          </button>
          <button className="historico-acao-btn excluir" onClick={e => handleAcao(e, onExcluir)} title="Excluir">
            🗑️
          </button>
        </div>
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

/* ── Página ───────────────────────────────────────────────────────────────── */
export default function HistoricoPage() {
  const { token } = useAuth();
  const [registros,   setRegistros]   = useState([]);
  const [carregando,  setCarregando]  = useState(true);
  const [erro,        setErro]        = useState(null);
  const [editando,    setEditando]    = useState(null);   // item sendo editado
  const [excluindo,   setExcluindo]   = useState(null);   // item sendo excluído
  const [salvando,    setSalvando]    = useState(false);
  const [removendo,   setRemovendo]   = useState(false);

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

  const handleSalvar = useCallback(async (form) => {
    setSalvando(true);
    try {
      const res = await api.updateRegistro(token, editando.id, form);
      if (!res.success) throw new Error(res.message || 'Erro ao salvar');
      setRegistros(prev => prev.map(r => r.id === editando.id ? res.data : r));
      setEditando(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setSalvando(false);
    }
  }, [token, editando]);

  const handleExcluir = useCallback(async () => {
    setRemovendo(true);
    try {
      const res = await api.deleteRegistro(token, excluindo.id);
      if (!res.success) throw new Error(res.message || 'Erro ao excluir');
      setRegistros(prev => prev.filter(r => r.id !== excluindo.id));
      setExcluindo(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setRemovendo(false);
    }
  }, [token, excluindo]);

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
                <CardRegistro
                  key={item.id}
                  item={item}
                  onEditar={() => setEditando(item)}
                  onExcluir={() => setExcluindo(item)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {editando && (
        <ModalEdicao
          item={editando}
          onSalvar={handleSalvar}
          onFechar={() => setEditando(null)}
          salvando={salvando}
        />
      )}

      {excluindo && (
        <ModalExcluir
          onConfirmar={handleExcluir}
          onFechar={() => setExcluindo(null)}
          excluindo={removendo}
        />
      )}
    </div>
  );
}
