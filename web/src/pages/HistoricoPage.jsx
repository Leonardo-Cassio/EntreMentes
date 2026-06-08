/**
 * HistoricoPage.jsx — Página de Histórico de Registros
 *
 * Exibe todos os registros de bem-estar do usuário em cards expansíveis.
 * Permite editar e excluir registros diretamente pela interface,
 * com re-classificação automática do perfil comportamental após cada edição.
 *
 * COMPONENTES INTERNOS:
 *   - ModalEdicao    → formulário completo para editar um registro
 *   - ModalExcluir   → confirmação de exclusão com feedback visual
 *   - SliderCampo    → slider reutilizável com label e valor formatado
 *   - CardRegistro   → card expansível com botões de ação (editar/excluir)
 *   - HistoricoPage  → página principal com estado e chamadas à API
 */

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './HistoricoPage.css';

// Mapeamentos de exibição para os níveis de humor (1–5)
const EMOJIS  = { 1: '😢', 2: '😟', 3: '😐', 4: '🙂', 5: '😄' };
const LABELS  = { 1: 'Muito mal', 2: 'Mal', 3: 'Neutro', 4: 'Bem', 5: 'Muito bem' };
// Cores dos badges de estresse (usadas tanto nos cards quanto no modal de edição)
const COR_ESTRESSE = { Baixo: '#00B894', Medio: '#FDCB6E', Alto: '#E17055' };

/** Formata uma data ISO para o padrão brasileiro: "07 de junho de 2026" */
function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

// ── Modal de Edição ───────────────────────────────────────────────────────────
/**
 * ModalEdicao — Formulário completo para alterar um registro existente.
 *
 * Campos editáveis: humor (emoji), estresse (botões), sono/tela/exercício (sliders),
 * desempenho acadêmico (botões), ansiedade (toggle) e nota (textarea).
 *
 * Fecha ao clicar fora do modal ou pressionar Escape.
 * Ao salvar, chama o PUT /mood/:id que re-dispara a classificação BullMQ.
 */
function ModalEdicao({ item, onSalvar, onFechar, salvando }) {
  // Estado local do formulário inicializado com os valores atuais do registro
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

  // Atualiza um campo específico do formulário sem perder os demais valores
  const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

  // Fecha o modal ao pressionar Escape (acessibilidade)
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onFechar(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn); // Limpa o listener ao desmontar
  }, [onFechar]);

  return (
    // Overlay escuro — clicar fora fecha o modal
    <div className="hm-overlay" onClick={onFechar}>
      {/* stopPropagation evita que cliques dentro do modal fechem ele */}
      <div className="hm-modal" onClick={e => e.stopPropagation()}>
        <div className="hm-modal-header">
          <h2 className="hm-modal-titulo">Editar Registro</h2>
          <span className="hm-modal-data">{formatarData(item.createdAt)}</span>
        </div>

        {/* Seleção de Humor via Emojis */}
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

        {/* Seleção de Estresse — cores dinâmicas por nível */}
        <div className="hm-campo">
          <label className="hm-label">Nível de estresse</label>
          <div className="hm-opcoes">
            {['Baixo','Medio','Alto'].map(op => (
              <button
                key={op}
                className={`hm-opcao-btn ${form.nivelEstresse === op ? 'ativo' : ''}`}
                // Aplica a cor correspondente ao nível quando selecionado
                style={form.nivelEstresse === op
                  ? { background: COR_ESTRESSE[op] + '22', borderColor: COR_ESTRESSE[op], color: COR_ESTRESSE[op] }
                  : {}}
                onClick={() => set('nivelEstresse', op)}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders contínuos: Sono, Tempo de Tela, Atividade Física */}
        <div className="hm-sliders">
          <SliderCampo label="🌙 Sono" valor={form.duracaoSono} min={0} max={12} step={0.5}
            onChange={v => set('duracaoSono', v)} unidade="h" />
          <SliderCampo label="🖥️ Tempo de tela" valor={form.tempoTela} min={0} max={16} step={0.5}
            onChange={v => set('tempoTela', v)} unidade="h" />
          <SliderCampo label="🏃 Atividade física" valor={form.atividadeFisica} min={0} max={8} step={0.5}
            onChange={v => set('atividadeFisica', v)} unidade="h" />
        </div>

        {/* Desempenho Acadêmico + Toggle de Ansiedade em linha */}
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
            {/* Toggle booleano — alterna entre Sim/Não */}
            <button
              className={`hm-toggle ${form.ansiedadeAntesProva ? 'ativo' : ''}`}
              onClick={() => set('ansiedadeAntesProva', !form.ansiedadeAntesProva)}
            >
              {form.ansiedadeAntesProva ? '✅ Sim' : '⬜ Não'}
            </button>
          </div>
        </div>

        {/* Nota livre opcional */}
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

        {/* Botões de ação — desabilitados durante o salvamento */}
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

// ── Componente Slider Reutilizável ────────────────────────────────────────────
/**
 * SliderCampo — slider com label, valor atual formatado e unidade.
 * accent-color: #6C5CE7 (definido no CSS) aplica a cor roxa ao thumb do input.
 */
function SliderCampo({ label, valor, min, max, step, onChange, unidade }) {
  return (
    <div className="hm-slider-campo">
      <div className="hm-slider-topo">
        <span className="hm-label">{label}</span>
        {/* toFixed(1) garante sempre 1 casa decimal (ex: 7.5h, 2.0h) */}
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

// ── Modal de Confirmação de Exclusão ─────────────────────────────────────────
/**
 * ModalExcluir — diálogo de confirmação antes de deletar um registro.
 * Ação irreversível — alerta o usuário claramente.
 * Fecha com Escape ou clique fora.
 */
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

// ── Card de Registro ──────────────────────────────────────────────────────────
/**
 * CardRegistro — exibe um registro em formato de card expansível.
 *
 * Comportamento:
 *   - Clicar no card expande/recolhe os detalhes
 *   - Os botões ✏️ 🗑️ aparecem no hover (opacity 0→1 via CSS)
 *   - stopPropagation nos botões evita abrir/fechar o card ao clicar neles
 */
function CardRegistro({ item, onEditar, onExcluir }) {
  const [expandido, setExpandido] = useState(false);
  const cor = COR_ESTRESSE[item.nivelEstresse]; // Cor do badge de estresse

  // Wrapper para parar propagação do clique nos botões de ação
  const handleAcao = (e, fn) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div className="historico-card" onClick={() => setExpandido(v => !v)}>
      <div className="historico-card-topo">
        {/* Emoji de humor como indicador visual principal */}
        <span className="historico-emoji">{EMOJIS[item.nivelHumor]}</span>
        <div className="historico-card-info">
          <span className="historico-humor">{LABELS[item.nivelHumor]}</span>
          <span className="historico-data">{formatarData(item.createdAt)}</span>
        </div>
        {/* Badge colorido de estresse (Baixo/Médio/Alto) */}
        <span className="historico-badge" style={{ background: cor + '22', color: cor }}>
          {item.nivelEstresse}
        </span>
        {/* Botões de ação — visíveis apenas no hover do card (CSS opacity) */}
        <div className="historico-acoes" onClick={e => e.stopPropagation()}>
          <button className="historico-acao-btn editar" onClick={e => handleAcao(e, onEditar)} title="Editar">
            ✏️
          </button>
          <button className="historico-acao-btn excluir" onClick={e => handleAcao(e, onExcluir)} title="Excluir">
            🗑️
          </button>
        </div>
        {/* Indicador de estado do card (expandido/recolhido) */}
        <span className="historico-chevron">{expandido ? '▲' : '▼'}</span>
      </div>

      {/* Detalhes expandíveis — renderizados condicionalmente */}
      {expandido && (
        <div className="historico-detalhes">
          <div className="historico-grade">
            <div className="historico-item">🌙 <b>Sono</b> {item.duracaoSono.toFixed(1)}h</div>
            <div className="historico-item">🖥️ <b>Tela</b> {item.tempoTela.toFixed(1)}h</div>
            <div className="historico-item">🏃 <b>Exercício</b> {item.atividadeFisica.toFixed(1)}h</div>
            <div className="historico-item">📈 <b>Desempenho</b> {item.desempenhoAcademico}</div>
            <div className="historico-item">📝 <b>Ansiedade</b> {item.ansiedadeAntesProva ? 'Sim' : 'Não'}</div>
          </div>
          {/* Nota livre — só exibe se existir */}
          {item.nota && (
            <div className="historico-nota">💬 {item.nota}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Página Principal ──────────────────────────────────────────────────────────
/**
 * HistoricoPage — componente de página completo.
 *
 * Estados gerenciados:
 *   registros  → lista de todos os registros do usuário
 *   carregando → exibe spinner enquanto busca da API
 *   erro       → exibe mensagem de erro se a busca falhar
 *   editando   → item sendo editado (null = modal fechado)
 *   excluindo  → item sendo excluído (null = modal fechado)
 *   salvando   → true durante o PUT (desabilita botões do modal)
 *   removendo  → true durante o DELETE (desabilita botões do modal)
 */
export default function HistoricoPage() {
  const { token } = useAuth(); // JWT do usuário logado
  const [registros,   setRegistros]   = useState([]);
  const [carregando,  setCarregando]  = useState(true);
  const [erro,        setErro]        = useState(null);
  const [editando,    setEditando]    = useState(null);  // item sendo editado
  const [excluindo,   setExcluindo]   = useState(null);  // item sendo excluído
  const [salvando,    setSalvando]    = useState(false);
  const [removendo,   setRemovendo]   = useState(false);

  // Carrega os registros do usuário ao montar a página
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

  /**
   * handleSalvar — persiste a edição via PUT /mood/:id.
   * Atualização otimista: substitui o item na lista local com o dado retornado pela API.
   * O backend dispara re-classificação BullMQ automaticamente após o update.
   */
  const handleSalvar = useCallback(async (form) => {
    setSalvando(true);
    try {
      const res = await api.updateRegistro(token, editando.id, form);
      if (!res.success) throw new Error(res.message || 'Erro ao salvar');
      // Substitui apenas o item editado na lista, preservando a ordem dos demais
      setRegistros(prev => prev.map(r => r.id === editando.id ? res.data : r));
      setEditando(null); // Fecha o modal
    } catch (e) {
      alert(e.message);
    } finally {
      setSalvando(false);
    }
  }, [token, editando]);

  /**
   * handleExcluir — remove o registro via DELETE /mood/:id.
   * Remove o item da lista local imediatamente após confirmação da API.
   */
  const handleExcluir = useCallback(async () => {
    setRemovendo(true);
    try {
      const res = await api.deleteRegistro(token, excluindo.id);
      if (!res.success) throw new Error(res.message || 'Erro ao excluir');
      // Filtra o item removido da lista sem recarregar todos os registros
      setRegistros(prev => prev.filter(r => r.id !== excluindo.id));
      setExcluindo(null); // Fecha o modal
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

          {/* Estados de carregamento, erro e lista vazia */}
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
            // Lista de cards — cada card recebe callbacks de edição e exclusão
            <div className="historico-lista">
              {registros.map(item => (
                <CardRegistro
                  key={item.id}
                  item={item}
                  onEditar={() => setEditando(item)}   // Abre modal com dados do item
                  onExcluir={() => setExcluindo(item)} // Abre modal de confirmação
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de edição — renderizado fora do main para ficar acima de tudo (z-index 1000) */}
      {editando && (
        <ModalEdicao
          item={editando}
          onSalvar={handleSalvar}
          onFechar={() => setEditando(null)}
          salvando={salvando}
        />
      )}

      {/* Modal de confirmação de exclusão */}
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
