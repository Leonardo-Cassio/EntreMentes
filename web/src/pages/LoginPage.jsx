import { useState } from 'react';
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
      // RotaPublica no App.jsx redireciona automaticamente para /dashboard
    } catch {
      setError('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-brand">
        <h1>EntreMentes</h1>
        <p>Cuide da sua mente, um dia de cada vez</p>
        {/* TODO: trocar src por pedrasImg quando disponível */}
        <img
          src="https://images.unsplash.com/photo-1525857597365-5f6dbff2e36e?w=500&h=500&fit=crop"
          alt="Pedras zen empilhadas"
          className="auth-brand-image"
        />
      </div>

      <div className="auth-form-side">
        <div className="auth-form-container">
          <h2>Bem vindo de volta</h2>
          <p className="subtitle">Entre na sua conta para continuar</p>

          {error && <div className="error-message">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="E-mail"
              type="email"
              placeholder="Digite seu E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={EmailIcon}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Digite sua Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={CadeadoIcon}
            />

            <Button title="Entrar" type="submit" loading={loading} />
          </form>

          <p className="auth-footer">
            Não tem uma conta? <Link to="/register">Cadastre-se</Link>
          </p>

          <p className="auth-copyright">EntreMentes © 2026</p>
        </div>
      </div>
    </div>
  );
}
