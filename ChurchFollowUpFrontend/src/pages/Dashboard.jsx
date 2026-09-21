import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchWithAuth('/api/analytics')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error fetching analytics", err));
  }, []);

  if (!stats) return <div style={{textAlign: 'center', padding: '2rem'}}>جاري التحميل...</div>;

  const priorityData = [
    { name: 'عاجل (أحمر)', value: stats.priorityStats.RED || 0, color: '#ef4444' },
    { name: 'متابعة (أصفر)', value: stats.priorityStats.YELLOW || 0, color: '#eab308' },
    { name: 'روتيني (أخضر)', value: stats.priorityStats.GREEN || 0, color: '#22c55e' }
  ];

  const mapNeedCategory = (need) => {
    const map = {
      'spiritual': 'احتياج روحي',
      'sunday_school': 'مدارس الأحد',
      'healthcare': 'رعاية مرضى',
      'social_support': 'دعم اجتماعي',
      'general_visit': 'تعارف واطمئنان'
    };
    return map[need] || need;
  };

  const needsData = Object.keys(stats.needStats).map(key => ({
    name: mapNeedCategory(key),
    count: stats.needStats[key]
  }));

  return (
    <div className="app-container" style={{maxWidth: '1200px'}}>
      <h1 style={{marginBottom: '2rem', textAlign: 'center'}}>لوحة التحكم وإحصائيات الزيارات</h1>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
        <div style={{background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--glass-border)'}}>
          <h3 style={{color: '#64748b', fontSize: '1.1rem', marginBottom: '0.5rem'}}>إجمالي الزيارات</h3>
          <p style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', margin: 0}}>{stats.totalVisits}</p>
        </div>
        <div style={{background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--glass-border)'}}>
          <h3 style={{color: '#64748b', fontSize: '1.1rem', marginBottom: '0.5rem'}}>تمت المتابعة (محلولة)</h3>
          <p style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', margin: 0}}>{stats.resolvedVisits}</p>
        </div>
        <div style={{background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--glass-border)'}}>
          <h3 style={{color: '#64748b', fontSize: '1.1rem', marginBottom: '0.5rem'}}>تحت المتابعة</h3>
          <p style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#ef4444', margin: 0}}>{stats.pendingVisits}</p>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem'}}>
        
        {/* Priority Pie Chart */}
        <div className="form-section" style={{marginBottom: 0}}>
          <h2 className="section-title" style={{textAlign: 'center'}}>الحالة الطارئة والأولوية</h2>
          <div style={{height: 300}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Needs Bar Chart */}
        <div className="form-section" style={{marginBottom: 0}}>
          <h2 className="section-title" style={{textAlign: 'center'}}>توزيع أنواع الاحتياجات</h2>
          <div style={{height: 300}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={needsData} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="form-section">
        <h2 className="section-title">أحدث الزيارات المضافة</h2>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'right'}} className="reports-table">
            <thead>
              <tr style={{background: '#f8fafc', borderBottom: '2px solid #e2e8f0'}}>
                <th style={{padding: '1rem'}}>التاريخ</th>
                <th style={{padding: '1rem'}}>الأسرة</th>
                <th style={{padding: '1rem'}}>التصنيف</th>
                <th style={{padding: '1rem'}}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentVisits.map(v => (
                <tr key={v.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                  <td style={{padding: '1rem'}}>{new Date(v.visitDate).toLocaleDateString('ar-EG')}</td>
                  <td style={{padding: '1rem'}}><strong>{v.primaryContactName}</strong></td>
                  <td style={{padding: '1rem'}}>
                    <span className={`flag-badge flag-${v.priorityFlag.toLowerCase()}`} style={{padding: '0.25rem 0.5rem', fontSize: '0.8rem', margin: 0}}>
                      {v.priorityFlag === 'RED' ? '🔴 عاجل' : v.priorityFlag === 'YELLOW' ? '🟡 متابعة' : '🟢 روتيني'}
                    </span>
                  </td>
                  <td style={{padding: '1rem'}}>
                    {v.isResolved ? <span style={{color: '#10b981', fontWeight: 'bold'}}>✔️ تمت</span> : <span style={{color: '#ef4444'}}>⏳ تحت المتابعة</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
