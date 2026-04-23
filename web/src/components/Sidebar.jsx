import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  { path: '/dashboard', label: 'Dashboard',       Icone: IconeDashboard },
  { path: '/registro',  label: 'Registrar Humor', Icone: IconeHumor     },
  { path: '/historico', label: 'Histórico',       Icone: IconeHistorico },
];

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  const iniciais = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'US';

  const handleLogout = () => {
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

      <div className="sidebar-bottom">
        <div className="sidebar-usuario">
          <div className="sidebar-avatar">{iniciais}</div>
          <span className="sidebar-nome">{user?.name ?? 'Usuário'}</span>
        </div>
        <button className="sidebar-sair" onClick={handleLogout}>
          <IconeSair cor="#636E72" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
