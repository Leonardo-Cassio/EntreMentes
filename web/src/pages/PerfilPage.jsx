import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './PerfilPage.css';

export default function PerfilPage() {
  const { user, token, updateUser } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [salvando, setSalvando] = useState('');
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    if (user) {
      setNome(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const iniciais = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'US';

  const mostrarMensagem = (tipo, texto) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), 4000);
  };

  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    setSalvando('perfil');
    try {
      const res = await api.updateMe(token, { name: nome.trim(), email: email.trim() });
      if (!res.success) throw new Error(res.message || 'Erro ao atualizar perfil');
      updateUser(res.data);
      mostrarMensagem('sucesso', 'Perfil atualizado com sucesso!');
    } catch (err) {
      mostrarMensagem('erro', err.message);
    } finally {
      setSalvando('');
    }
  };

  const handleAlterarSenha = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      mostrarMensagem('erro', 'As senhas não coincidem.');
      return;
    }
    if (novaSenha.length < 6) {
      mostrarMensagem('erro', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setSalvando('senha');
    try {
      const res = await api.updateMe(token, { currentPassword: senhaAtual, newPassword: novaSenha });
      if (!res.success) throw new Error(res.message || 'Erro ao alterar senha');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      mostrarMensagem('sucesso', 'Senha alterada com sucesso!');
    } catch (err) {
      mostrarMensagem('erro', err.message);
    } finally {
      setSalvando('');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="perfil-main">
        <div className="perfil-container">

          <div className="perfil-page-header">
            <h1 className="perfil-titulo">Meu Perfil</h1>
            <p className="perfil-subtitulo">Gerencie suas informações pessoais</p>
          </div>

          {mensagem && (
            <div className={`perfil-alerta perfil-alerta-${mensagem.tipo}`}>
              {mensagem.tipo === 'sucesso' ? '✓' : '⚠'} {mensagem.texto}
            </div>
          )}

          <div className="perfil-card">
            <div className="perfil-avatar-section">
              <div className="perfil-avatar-grande">{iniciais}</div>
              <div className="perfil-avatar-info">
                <p className="perfil-avatar-nome">{user?.name ?? '—'}</p>
                <p className="perfil-avatar-email">{user?.email ?? '—'}</p>
              </div>
            </div>
          </div>

          <div className="perfil-card">
            <h2 className="perfil-card-titulo">Informações Pessoais</h2>
            <form className="perfil-form" onSubmit={handleSalvarPerfil}>
              <div className="perfil-campo">
                <label className="perfil-label">Nome completo</label>
                <input
                  className="perfil-input"
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required
                  placeholder="Seu nome"
                />
              </div>
              <div className="perfil-campo">
                <label className="perfil-label">E-mail</label>
                <input
                  className="perfil-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>
              <button
                className="perfil-btn-salvar"
                type="submit"
                disabled={salvando === 'perfil'}
              >
                {salvando === 'perfil' ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          </div>

          <div className="perfil-card">
            <h2 className="perfil-card-titulo">Alterar Senha</h2>
            <form className="perfil-form" onSubmit={handleAlterarSenha}>
              <div className="perfil-campo">
                <label className="perfil-label">Senha atual</label>
                <input
                  className="perfil-input"
                  type="password"
                  value={senhaAtual}
                  onChange={e => setSenhaAtual(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              <div className="perfil-campos-linha">
                <div className="perfil-campo">
                  <label className="perfil-label">Nova senha</label>
                  <input
                    className="perfil-input"
                    type="password"
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    required
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="perfil-campo">
                  <label className="perfil-label">Confirmar nova senha</label>
                  <input
                    className="perfil-input"
                    type="password"
                    value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button
                className="perfil-btn-salvar"
                type="submit"
                disabled={salvando === 'senha'}
              >
                {salvando === 'senha' ? 'Alterando...' : 'Alterar senha'}
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
