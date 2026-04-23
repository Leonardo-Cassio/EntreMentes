import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import DashboardPage      from './pages/DashboardPage';
import RegistroDiarioPage from './pages/RegistroDiarioPage';
import './App.css';

function RotaProtegida({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RotaPublica({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function Rotas() {
  return (
    <Routes>
      <Route path="/login"     element={<RotaPublica><LoginPage /></RotaPublica>} />
      <Route path="/register"  element={<RotaPublica><RegisterPage /></RotaPublica>} />
      <Route path="/dashboard" element={<RotaProtegida><DashboardPage /></RotaProtegida>} />
      <Route path="/registro"  element={<RotaProtegida><RegistroDiarioPage /></RotaProtegida>} />
      <Route path="*"          element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Rotas />
      </BrowserRouter>
    </AuthProvider>
  );
}
