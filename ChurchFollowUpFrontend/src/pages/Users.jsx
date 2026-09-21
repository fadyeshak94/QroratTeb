import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/fetchWithAuth';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [servants, setServants] = useState([]);
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Servant');
  const [servantId, setServantId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchServants();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetchWithAuth('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchServants = async () => {
    try {
      const res = await fetchWithAuth('/api/servants');
      if (res.ok) {
        const data = await res.json();
        setServants(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        username,
        password,
        role,
        servantId: servantId ? parseInt(servantId) : null
      };

      const res = await fetchWithAuth('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('تمت إضافة المستخدم بنجاح');
        setUsername('');
        setPassword('');
        setRole('Servant');
        setServantId('');
        fetchUsers();
      } else {
        const err = await res.text();
        alert('خطأ: ' + err);
      }
    } catch (e) {
      console.error(e);
      alert('حدث خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>إدارة المستخدمين والصلاحيات 🔐</h1>
      
      <div className="form-section">
        <h2 className="section-title">إضافة مستخدم جديد</h2>
        <form onSubmit={handleAddUser}>
          <div className="address-grid">
            <div className="form-group">
              <label>اسم المستخدم</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>كلمة المرور</label>
              <input type="text" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
          </div>
          
          <div className="address-grid">
            <div className="form-group">
              <label>الصلاحية (النوع)</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="Servant">خادم عادي (Servant)</option>
                <option value="Admin">مدير نظام (Admin)</option>
              </select>
            </div>
            <div className="form-group">
              <label>ربط بخادم مسجل (اختياري)</label>
              <select value={servantId} onChange={e => setServantId(e.target.value)}>
                <option value="">-- لا يوجد ربط --</option>
                {servants.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - {s.committee}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading} style={{ marginTop: '1rem' }}>
            {isLoading ? 'جاري الإضافة...' : '+ إضافة المستخدم'}
          </button>
        </form>
      </div>

      <div className="form-section">
        <h2 className="section-title">قائمة المستخدمين</h2>
        <table className="reports-table" style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={{ padding: '0.75rem' }}>م</th>
              <th style={{ padding: '0.75rem' }}>اسم المستخدم</th>
              <th style={{ padding: '0.75rem' }}>الصلاحية</th>
              <th style={{ padding: '0.75rem' }}>الخادم المرتبط</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem' }}>{idx + 1}</td>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{u.username}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span className={`flag-badge flag-${u.role === 'Admin' ? 'red' : 'green'}`} style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem', margin: 0 }}>
                    {u.role === 'Admin' ? 'مدير' : 'خادم'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem', color: '#64748b' }}>{u.servantName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
