import React, { useState, useEffect } from 'react';

export default function Reports() {
  const [visits, setVisits] = useState([]);
  const [servants, setServants] = useState([]);
  
  // Filters
  const [filterServant, setFilterServant] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    fetchServants();
    fetchReports();
  }, [filterServant, filterPriority]);

  const fetchServants = async () => {
    try {
      const res = await fetch('http://localhost:5206/api/servants');
      const data = await res.json();
      setServants(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReports = async () => {
    try {
      let url = 'http://localhost:5206/api/followup?';
      if (filterPriority) url += `priorityFlag=${filterPriority}&`;
      if (filterServant) url += `servantId=${filterServant}&`;

      const res = await fetch(url);
      const data = await res.json();
      setVisits(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-container" style={{maxWidth: '1200px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h1>تقارير الزيارات</h1>
        <button onClick={handlePrint} className="submit-btn" style={{width: 'auto', margin: 0, padding: '0.5rem 2rem'}}>
          🖨️ طباعة التقرير
        </button>
      </div>

      <div className="form-section no-print">
        <h2 className="section-title">فلاتر البحث</h2>
        <div className="address-grid">
          <div className="form-group">
            <label>فلترة بالخادم</label>
            <select value={filterServant} onChange={(e) => setFilterServant(e.target.value)}>
              <option value="">الكل</option>
              {servants.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>فلترة بالأولوية</label>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="">الكل</option>
              <option value="RED">🔴 عاجل وطارئ</option>
              <option value="YELLOW">🟡 متابعة قريبة</option>
              <option value="GREEN">🟢 روتيني</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2 className="section-title">سجل الزيارات ({visits.length})</h2>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'right'}} className="reports-table">
            <thead>
              <tr style={{background: 'var(--primary-color)', color: 'white'}}>
                <th style={{padding: '1rem'}}>التاريخ</th>
                <th style={{padding: '1rem'}}>الأسرة</th>
                <th style={{padding: '1rem'}}>العنوان</th>
                <th style={{padding: '1rem'}}>الخادم</th>
                <th style={{padding: '1rem'}}>الكاهن</th>
                <th style={{padding: '1rem'}}>التصنيف</th>
              </tr>
            </thead>
            <tbody>
              {visits.map(v => (
                <tr key={v.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                  <td style={{padding: '1rem'}}>{new Date(v.visitDate).toLocaleDateString('ar-EG')}</td>
                  <td style={{padding: '1rem'}}>
                    <strong>{v.primaryContactName}</strong><br/>
                    <span style={{fontSize: '0.85rem', color: '#64748b'}}>{v.phoneNumber}</span>
                  </td>
                  <td style={{padding: '1rem'}}>{v.area} - {v.street}</td>
                  <td style={{padding: '1rem'}}>{v.servant ? v.servant.name : 'غير محدد'}</td>
                  <td style={{padding: '1rem'}}>{v.wasPriestPresent ? v.priestName : 'لا يوجد'}</td>
                  <td style={{padding: '1rem'}}>
                    <span className={`flag-badge flag-${v.priorityFlag.toLowerCase()}`} style={{padding: '0.25rem 0.5rem', fontSize: '0.8rem', margin: 0}}>
                      {v.priorityFlag}
                    </span>
                  </td>
                </tr>
              ))}
              {visits.length === 0 && (
                <tr>
                  <td colSpan="6" style={{padding: '2rem', textAlign: 'center', color: '#64748b'}}>لا توجد زيارات مطابقة للبحث</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .app-container { border: none; box-shadow: none; max-width: 100%; padding: 0; }
          .reports-table th { background: #e2e8f0 !important; color: black !important; }
        }
      `}</style>
    </div>
  );
}
