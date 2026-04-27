import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import CadeadoIcon from '../assets/CadeadoIcon';
import EmailIcon from '../assets/EmailIcon';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const HEADING = 'Olá!';
  const [heading, setHeading] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const ms = 2000 / HEADING.length;
    const id = setInterval(() => {
      i++;
      setHeading(HEADING.slice(0, i));
      if (i >= HEADING.length) { clearInterval(id); setTypingDone(true); }
    }, ms);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.login(email, password);

      if (!data.success) {
        setError(data.message);
        return;
      }

      login(data.data.token, data.data.user);
    } catch {
      setError('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">

      {/* ── Lado esquerdo: formulário ─────────────────────── */}
      <div className="auth-form-side">
        <div className="auth-logo">
          <div className="auth-logo-icon">E</div>
          <span className="auth-logo-name">EntreMentes</span>
        </div>

        <div className="auth-form-container">
          <h2 className="auth-heading">
            {heading}
            {!typingDone && <span className="auth-cursor">|</span>}
          </h2>
          <p className="subtitle">Bem-vindo de volta à comunidade</p>

          {error && <div className="error-message">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={EmailIcon}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={CadeadoIcon}
            />

            <div className="auth-forgot-row">
              <Link to="#">Esqueceu a senha?</Link>
            </div>

            <Button title="Entrar" type="submit" loading={loading} variant="dark" />
          </form>

          <p className="auth-footer">
            Não tem uma conta?{' '}
            <Link to="/register">Cadastre-se</Link>
          </p>
        </div>
      </div>

      {/* ── Lado direito: gradiente com frase ────────────── */}
      <div className="auth-brand">
        <div className="auth-brand-nav">
          <Link to="/register" className="auth-brand-link">Cadastrar</Link>
          <Link to="/register" className="auth-brand-btn">Entrar</Link>
        </div>

        <div className="auth-brand-content">
          <h3 className="auth-brand-heading">
            Cuide da sua mente,<br />um dia de cada vez.
          </h3>
          <p className="auth-brand-sub">
            Registre seus humores, monitore seu bem-estar
            e descubra padrões sobre você mesmo.
          </p>
        </div>
      </div>

    </div>
  );
}
