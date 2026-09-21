import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        // data contains Token, Username, Role
        login({ token: data.token, username: data.username, role: data.role });
      } else {
        const errMessage = await response.text();
        setError(errMessage || 'خطأ في تسجيل الدخول');
      }
    } catch (err) {
      console.error(err);
      setError('فشل الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>تسجيل الدخول - قارورة طيب</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>اسم المستخدم</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="أدخل اسم المستخدم"
              required 
            />
          </div>
          <div className="form-group" style={{marginTop: '1rem'}}>
            <label>كلمة المرور</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="أدخل كلمة المرور"
              required 
            />
          </div>
          
          {error && <div className="error-text" style={{marginTop: '1rem', textAlign: 'center'}}>{error}</div>}

          <button 
            type="submit" 
            className="submit-btn" 
            style={{marginTop: '1.5rem', width: '100%'}}
            disabled={isLoading}
          >
            {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
