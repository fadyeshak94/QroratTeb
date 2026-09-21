import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Servants from './pages/Servants';
import Reports from './pages/Reports';
import Users from './pages/Users';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null; // Don't show navbar on login page

  return (
    <nav style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(12px)',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '2rem',
      borderBottom: '1px solid var(--glass-border)',
      marginBottom: '2rem',
      boxShadow: 'var(--shadow-sm)'
    }} className="no-print">
      <Link to="/" style={linkStyle}>الزيارات (النموذج)</Link>
      
      {/* Admin Only Links */}
      {user.role === 'Admin' && (
        <>
          <Link to="/dashboard" style={linkStyle}>لوحة التحكم</Link>
          <Link to="/reports" style={linkStyle}>التقارير</Link>
          <Link to="/servants" style={linkStyle}>إدارة الخدام</Link>
          <Link to="/users" style={linkStyle}>المستخدمين</Link>
        </>
      )}

      <button onClick={logout} style={{
        ...linkStyle, 
        background: 'transparent', 
        border: 'none', 
        color: '#ef4444', 
        cursor: 'pointer'
      }}>
        تسجيل خروج
      </button>
    </nav>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['Admin']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/servants" element={
            <ProtectedRoute roles={['Admin']}>
              <Servants />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute roles={['Admin']}>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute roles={['Admin']}>
              <Reports />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

const linkStyle = {
  textDecoration: 'none',
  color: 'var(--primary-color)',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  transition: 'background 0.3s'
};
