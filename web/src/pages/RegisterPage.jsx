import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import CadeadoIcon from '../assets/CadeadoIcon';
import EmailIcon from '../assets/EmailIcon';
import cerebroImg from '../assets/cerebro.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
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
    <div className="auth-layout">
      <div className="auth-brand">
        <h1>EntreMentes</h1>
        <p>Comece a entender seus padrões emocionais</p>
        <img
          src={cerebroImg}
          alt="Ilustração cérebro humano"
          className="auth-brand-image"
        />
      </div>

      <div className="auth-form-side">
        <div className="auth-form-container">
          <h2>Seja bem vindo!</h2>
          <p className="subtitle">Crie sua conta para continuar</p>

          {error && <div className="error-message">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="Nome"
              placeholder="Digite seu Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

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

            <Input
              label="Confirme sua senha"
              type="password"
              placeholder="Digite sua Senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={CadeadoIcon}
            />

            <Button title="Cadastrar" type="submit" loading={loading} />
          </form>

          <p className="auth-footer">
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
