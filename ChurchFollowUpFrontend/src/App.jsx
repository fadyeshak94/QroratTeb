import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Servants from './pages/Servants';
import Reports from './pages/Reports';

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        borderBottom: '1px solid var(--glass-border)',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-sm)'
      }} className="no-print">
        <Link to="/" style={linkStyle}>الزيارات (النموذج)</Link>
        <Link to="/reports" style={linkStyle}>التقارير</Link>
        <Link to="/servants" style={linkStyle}>إدارة الخدام</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servants" element={<Servants />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
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
