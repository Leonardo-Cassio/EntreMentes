import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import CadeadoIcon from '../assets/CadeadoIcon';
import EmailIcon from '../assets/EmailIcon';
import { api } from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const HEADING = 'Seja bem-vindo!';
  const [heading, setHeading] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const ms = 3000 / HEADING.length;
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

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.register(name, email, password);

      if (!data.success) {
        setError(data.message || 'Erro ao criar conta.');
        return;
      }

      navigate('/login');
    } catch {
      setError('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout auth-layout--reversed">

      {/* ── Lado esquerdo: gradiente ──────────────────────── */}
      <div className="auth-brand">
        <div className="auth-brand-nav">
          <Link to="/login" className="auth-brand-link">Entrar</Link>
          <Link to="/login" className="auth-brand-btn">Login</Link>
        </div>

        <div className="auth-brand-content">
          <h3 className="auth-brand-heading">
            Comece sua jornada<br />de bem-estar.
          </h3>
          <p className="auth-brand-sub">
            Monitore seu humor, sono e desempenho
            acadêmico e descubra padrões sobre você mesmo.
          </p>
        </div>
      </div>

      {/* ── Lado direito: formulário ──────────────────────── */}
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
          <p className="subtitle">Crie sua conta para começar</p>

          {error && <div className="error-message">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="Nome"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={CadeadoIcon}
            />

            <Input
              label="Confirme sua senha"
              type="password"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={CadeadoIcon}
            />

            <Button title="Cadastrar" type="submit" loading={loading} variant="dark" />
          </form>

          <p className="auth-footer">
            Já tem uma conta?{' '}
            <Link to="/login">Faça login</Link>
          </p>
        </div>
      </div>

    </div>
  );
}
