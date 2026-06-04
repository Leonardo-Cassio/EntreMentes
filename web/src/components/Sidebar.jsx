import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './Sidebar.css';

function IconeDashboard({ cor }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" fill={cor} />
      <rect x="14" y="3" width="7" height="7" rx="1.5" fill={cor} />
      <rect x="3" y="14" width="7" height="7" rx="1.5" fill={cor} />
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill={cor} />
    </svg>
  );
}

function IconeHumor({ cor }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={cor} strokeWidth="2" />
      <path d="M8.5 14.5s1 1.5 3.5 1.5 3.5-1.5 3.5-1.5" stroke={cor} strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="10" r="1" fill={cor} />
      <circle cx="15" cy="10" r="1" fill={cor} />
    </svg>
  );
}

function IconeHistorico({ cor }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={cor} strokeWidth="2" />
      <path d="M12 7v5l3 3" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeSair({ cor }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={cor} strokeWidth="2" strokeLinecap="round" />
      <polyline points="16 17 21 12 16 7" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="21" y1="12" x2="9" y2="12" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS = [
  { path: '/dashboard',    label: 'Dashboard',       Icone: IconeDashboard    },
  { path: '/registro',     label: 'Registrar Humor', Icone: IconeHumor        },
  { path: '/historico',    label: 'Histórico',       Icone: IconeHistorico    },
  { path: '/estatisticas', label: 'Estatísticas',    Icone: IconeEstatisticas },
  { path: '/perfil',       label: 'Meu Perfil',      Icone: IconePerfil       },
];

function IconePerfil({ cor }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={cor} strokeWidth="2" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconeEstatisticas({ cor }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3"  y="14" width="4" height="7" rx="1" fill={cor} />
      <rect x="10" y="9"  width="4" height="12" rx="1" fill={cor} />
      <rect x="17" y="4"  width="4" height="17" rx="1" fill={cor} />
    </svg>
  );
}

function IconeExcluir({ cor }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <polyline points="3 6 5 6 21 6" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6l-1 14H6L5 6" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke={cor} strokeWidth="2" strokeLinecap="round" />
      <path d="M9 6V4h6v2" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, token, logout } = useAuth();
  const [modalExcluir, setModalExcluir] = useState(false);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark',
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const iniciais = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'US';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleExcluirConta = async () => {
    await api.deleteMe(token);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">E</div>
        <span className="sidebar-logo-texto">EntreMentes</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ path, label, Icone }) => {
          const ativo = location.pathname === path;
          return (
            <button
              key={path}
              className={`sidebar-nav-item ${ativo ? 'ativo' : ''}`}
              onClick={() => navigate(path)}
            >
              <Icone cor={ativo ? '#6C5CE7' : '#636E72'} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Toggle tema */}
      <div className="sidebar-tema">
        <button
          className={`tema-switch ${darkMode ? 'tema-switch-dark' : ''}`}
          onClick={() => setDarkMode(d => !d)}
          aria-label="Alternar tema"
        >
          <span className="tema-switch-knob">
            <span className="tema-icon-sun">☀️</span>
            <span className="tema-icon-moon">🌙</span>
          </span>
        </button>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-usuario">
          <div className="sidebar-avatar">{iniciais}</div>
          <span className="sidebar-nome">{user?.name ?? 'Usuário'}</span>
        </div>
        <button className="sidebar-excluir" onClick={() => setModalExcluir(true)}>
          <IconeExcluir cor="#636E72" />
          <span>Excluir conta</span>
        </button>
        <button className="sidebar-sair" onClick={handleLogout}>
          <IconeSair cor="#636E72" />
          <span>Sair</span>
        </button>
      </div>

      {modalExcluir && (
        <div className="sidebar-modal-overlay" onClick={() => setModalExcluir(false)}>
          <div className="sidebar-modal" onClick={e => e.stopPropagation()}>
            <p className="sidebar-modal-texto">Tem certeza de que quer excluir a sua conta?</p>
            <div className="sidebar-modal-botoes">
              <button className="sidebar-modal-sim" onClick={handleExcluirConta}>Sim</button>
              <button className="sidebar-modal-nao" onClick={() => setModalExcluir(false)}>Não</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
