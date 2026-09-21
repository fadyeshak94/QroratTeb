import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/fetchWithAuth';

export default function Servants() {
  const [servants, setServants] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [committee, setCommittee] = useState('');

  useEffect(() => {
    fetchServants();
  }, []);

  const fetchServants = async () => {
    try {
      const res = await fetchWithAuth('/api/servants');
      const data = await res.json();
      setServants(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/servants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, committee })
      });
      if (res.ok) {
        setName('');
        setPhone('');
        setCommittee('');
        fetchServants();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="app-container">
      <h1>إدارة الخدام</h1>
      <p className="subtitle">إضافة خدام جدد لقاعدة البيانات</p>

      <form onSubmit={handleAdd} className="form-section">
        <div className="address-grid">
          <div className="form-group">
            <label>اسم الخادم</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>رقم الهاتف</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
          </div>
          <div className="form-group" style={{gridColumn: '1 / -1'}}>
            <label>اللجنة التابع لها</label>
            <input type="text" value={committee} onChange={(e) => setCommittee(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="add-btn" style={{background: 'var(--primary-color)', color: 'white'}}>
          إضافة الخادم
        </button>
      </form>

      <div className="form-section">
        <h2 className="section-title">قائمة الخدام المسجلين</h2>
        <ul style={{listStyle: 'none', padding: 0}}>
          {servants.map(s => (
            <li key={s.id} style={{padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between'}}>
              <strong>{s.name}</strong>
              <span style={{color: 'var(--text-muted)'}}>{s.committee} | {s.phone}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
