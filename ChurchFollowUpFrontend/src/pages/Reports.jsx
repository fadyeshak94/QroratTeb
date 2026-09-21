import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { fetchWithAuth } from '../utils/fetchWithAuth';

export default function Reports() {
  const [visits, setVisits] = useState([]);
  const [servants, setServants] = useState([]);
  
  // Filters
  const [filterServant, setFilterServant] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Print state
  const [printMode, setPrintMode] = useState('list'); // 'list' or 'single'
  const [visitToPrint, setVisitToPrint] = useState(null);

  useEffect(() => {
    fetchServants();
    fetchReports();
  }, [filterServant, filterPriority]);

  const fetchServants = async () => {
    try {
      const res = await fetchWithAuth('/api/servants');
      const data = await res.json();
      setServants(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReports = async () => {
    try {
      let url = '/api/followup?';
      if (filterPriority) url += `priorityFlag=${filterPriority}&`;
      if (filterServant) url += `servantId=${filterServant}&`;

      const res = await fetchWithAuth(url);
      const data = await res.json();
      setVisits(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrintList = () => {
    setPrintMode('list');
    setTimeout(() => window.print(), 100);
  };

  const handlePrintSingle = (visit) => {
    setVisitToPrint(visit);
    setPrintMode('single');
    setTimeout(() => window.print(), 100);
  };

  const handleExportExcel = () => {
    if (visits.length === 0) {
      alert("لا توجد بيانات للتصدير");
      return;
    }

    const exportData = visits.map(v => ({
      "التاريخ": new Date(v.visitDate).toLocaleDateString('ar-EG'),
      "اسم جهة الاتصال": v.family ? v.family.primaryContactName : '-',
      "رقم الهاتف": v.family ? v.family.phoneNumber : '-',
      "رقم الواتساب": (v.family && v.family.whatsAppNumber) ? v.family.whatsAppNumber : '-',
      "المنطقة": v.family ? v.family.area : '-',
      "الشارع": v.family ? v.family.street : '-',
      "العمارة": v.family ? v.family.buildingNo : '-',
      "الدور": (v.family && v.family.floor) ? v.family.floor : '-',
      "لجنة التوجيه": v.originatingCommittee,
      "الخادم": v.servant ? v.servant.name : '-',
      "حضور كاهن": v.wasPriestPresent ? `نعم - ${v.priestName}` : 'لا',
      "الأولوية": v.priorityFlag === 'RED' ? 'عاجل' : (v.priorityFlag === 'YELLOW' ? 'متابعة' : 'روتيني'),
      "حالة المتابعة": v.isResolved ? 'محلولة/تمت المتابعة' : 'تحت المتابعة'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الزيارات");
    XLSX.writeFile(workbook, "تقرير_الزيارات.xlsx");
  };

  const handleResolveVisit = async (visitId) => {
    if (!window.confirm("هل أنت متأكد من تغيير حالة الزيارة إلى (تمت المتابعة/محلولة)؟")) return;

    try {
      const response = await fetchWithAuth(`/api/followup/${visitId}/resolve`, {
        method: 'PUT'
      });
      if (response.ok) {
        // Refresh reports
        fetchReports();
      } else {
        alert("حدث خطأ أثناء تحديث حالة الزيارة.");
      }
    } catch (e) {
      console.error(e);
      alert("فشل الاتصال بالخادم.");
    }
  };

  const mapNeedCategory = (need) => {
    const map = {
      'spiritual': 'احتياج روحي وكنسي',
      'sunday_school': 'تربية كنسية (مدارس الأحد)',
      'healthcare': 'رعاية خاصة ومرضى',
      'social_support': 'دعم اجتماعي ورعائي',
      'general_visit': 'زيارة تعارف واطمئنان فقط'
    };
    return map[need] || need;
  };

  return (
    <div className={`app-container print-mode-${printMode}`} style={{maxWidth: '1200px'}}>
      
      {/* -------------------- LIST PRINT VIEW -------------------- */}
      <div className="list-print-view">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
          <h1>تقارير الزيارات</h1>
          <div className="no-print" style={{display: 'flex', gap: '1rem'}}>
            <button onClick={handleExportExcel} className="submit-btn" style={{width: 'auto', margin: 0, padding: '0.5rem 1.5rem', backgroundColor: '#10b981'}}>
              📊 تصدير Excel
            </button>
            <button onClick={handlePrintList} className="submit-btn" style={{width: 'auto', margin: 0, padding: '0.5rem 1.5rem'}}>
              🖨️ طباعة القائمة
            </button>
          </div>
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
                  <th style={{padding: '1rem'}}>التصنيف</th>
                  <th className="no-print" style={{padding: '1rem'}}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {visits.map(v => (
                  <tr key={v.id} style={{borderBottom: '1px solid #e2e8f0', background: v.isResolved ? '#f8fafc' : 'white'}}>
                    <td style={{padding: '1rem'}}>
                      {new Date(v.visitDate).toLocaleDateString('ar-EG')}
                      {v.isResolved && <div style={{color: '#10b981', fontSize: '0.85rem', marginTop: '0.25rem'}}>✔️ محلولة</div>}
                    </td>
                    <td style={{padding: '1rem'}}>
                      <strong>{v.family ? v.family.primaryContactName : '-'}</strong><br/>
                      <span style={{fontSize: '0.85rem', color: '#64748b'}} dir="ltr" style={{display: 'inline-block'}}>{v.family ? v.family.phoneNumber : ''}</span>
                    </td>
                    <td style={{padding: '1rem'}}>{v.family ? `${v.family.area} - ${v.family.street}` : '-'}</td>
                    <td style={{padding: '1rem'}}>
                      {v.servant ? v.servant.name : 'غير محدد'}<br/>
                      <span style={{fontSize: '0.85rem', color: '#64748b'}}>{v.wasPriestPresent ? `كاهن: ${v.priestName}` : ''}</span>
                    </td>
                    <td style={{padding: '1rem'}}>
                      <span className={`flag-badge flag-${v.priorityFlag.toLowerCase()}`} style={{padding: '0.25rem 0.5rem', fontSize: '0.8rem', margin: 0, opacity: v.isResolved ? 0.6 : 1}}>
                        {v.priorityFlag === 'RED' ? '🔴 عاجل' : v.priorityFlag === 'YELLOW' ? '🟡 متابعة' : '🟢 روتيني'}
                      </span>
                    </td>
                    <td className="no-print" style={{padding: '1rem'}}>
                      <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                        <button 
                          onClick={() => handlePrintSingle(v)} 
                          className="submit-btn" 
                          style={{width: 'auto', margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#334155'}}
                        >
                          🖨️ طباعة
                        </button>
                        {!v.isResolved && (
                          <button 
                            onClick={() => handleResolveVisit(v.id)} 
                            className="submit-btn" 
                            style={{width: 'auto', margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#10b981'}}
                          >
                            ✔️ تمت
                          </button>
                        )}
                      </div>
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
      </div>

      {/* -------------------- SINGLE PRINT VIEW -------------------- */}
      {visitToPrint && (
        <div className="single-print-view" style={{ display: 'none' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #0f172a', paddingBottom: '1rem' }}>
            <h1 style={{fontSize: '2rem', marginBottom: '0.5rem'}}>قارورة طيب - تقرير زيارة مفصل</h1>
            <p style={{fontSize: '1.2rem', color: '#475569'}}>
              تاريخ ووقت الزيارة: {new Date(visitToPrint.visitDate).toLocaleString('ar-EG')}
            </p>
            <div style={{ marginTop: '1rem' }}>
              <span style={{
                display: 'inline-block',
                padding: '0.5rem 1.5rem',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                backgroundColor: '#f8fafc'
              }}>
                أولوية الحالة: {visitToPrint.priorityFlag === 'RED' ? '🔴 عاجل' : visitToPrint.priorityFlag === 'YELLOW' ? '🟡 متابعة قريبة' : '🟢 روتيني'}
              </span>
            </div>
          </div>

          <div style={{ border: '1px solid #cbd5e1', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', backgroundColor: '#fff' }}>
            <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a', fontSize: '1.4rem' }}>البيانات الأساسية</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '1.1rem', lineHeight: '1.8' }}>
              <div><strong>اسم الخادم:</strong> {visitToPrint.servant?.name || 'غير محدد'}</div>
              <div><strong>لجنة التوجيه:</strong> {visitToPrint.originatingCommittee || 'غير محدد'}</div>
              <div><strong>حضور كاهن:</strong> {visitToPrint.wasPriestPresent ? `نعم - ${visitToPrint.priestName}` : 'لا'}</div>
              <div><strong>اسم جهة الاتصال:</strong> {visitToPrint.primaryContactName}</div>
              <div dir="rtl"><strong>رقم الهاتف:</strong> <span dir="ltr">{visitToPrint.phoneNumber}</span></div>
              <div dir="rtl"><strong>رقم الواتساب:</strong> <span dir="ltr">{visitToPrint.whatsAppNumber || 'لا يوجد'}</span></div>
              <div style={{gridColumn: '1 / -1'}}>
                <strong>العنوان:</strong> {visitToPrint.area} - {visitToPrint.street} - عمارة {visitToPrint.buildingNo}
                {visitToPrint.floor ? ` - الدور ${visitToPrint.floor}` : ''}
                {visitToPrint.landmark ? ` (${visitToPrint.landmark})` : ''}
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid #cbd5e1', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', backgroundColor: '#fff' }}>
            <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#0f172a', fontSize: '1.4rem' }}>الاحتياجات وتفاصيل الزيارة</h3>
            
            {visitToPrint.needs && visitToPrint.needs.length > 0 && (
              <div style={{marginBottom: '1.5rem'}}>
                <strong>أنواع الاحتياجات:</strong>
                <ul style={{marginTop: '0.5rem', listStyleType: 'square', marginRight: '1.5rem', fontSize: '1.1rem'}}>
                  {visitToPrint.needs.map((n, i) => <li key={i}>{mapNeedCategory(n.needCategory)}</li>)}
                </ul>
              </div>
            )}
            
            {visitToPrint.spiritualServiceType && (
              <div style={{marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px'}}>
                <h4 style={{fontSize: '1.2rem', marginBottom: '0.8rem', color: '#334155'}}>🔹 الاحتياج الروحي</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '1.1rem' }}>
                  <div><strong>نوع الخدمة:</strong> {visitToPrint.spiritualServiceType}</div>
                  <div><strong>أب اعتراف:</strong> {visitToPrint.hasConfessor === 'yes' ? `نعم (${visitToPrint.confessorName})` : 'لا'}</div>
                  <div><strong>طريح الفراش:</strong> {visitToPrint.isBedridden === 'yes' ? 'نعم' : 'لا'}</div>
                  <div><strong>مستوى الأهمية:</strong> {visitToPrint.spiritualUrgency}</div>
                </div>
              </div>
            )}
            
            {visitToPrint.individuals && visitToPrint.individuals.length > 0 && (
              <div style={{marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px'}}>
                <h4 style={{fontSize: '1.2rem', marginBottom: '0.8rem', color: '#334155'}}>🔹 تربية كنسية (مدارس الأحد)</h4>
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'right', marginTop: '0.5rem', fontSize: '1.1rem'}}>
                  <thead>
                    <tr style={{background: '#e2e8f0'}}>
                      <th style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>الاسم</th>
                      <th style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>المرحلة</th>
                      <th style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>المدرسة/الكلية</th>
                      <th style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>سبب الانقطاع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitToPrint.individuals.map((ind, i) => (
                      <tr key={i} style={{background: '#fff'}}>
                        <td style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>{ind.childName}</td>
                        <td style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>{ind.educationalStage}</td>
                        <td style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>{ind.schoolCollegeName || '-'}</td>
                        <td style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>{ind.nonAttendanceReason || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {visitToPrint.healthCategory && (
              <div style={{marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px'}}>
                <h4 style={{fontSize: '1.2rem', marginBottom: '0.8rem', color: '#334155'}}>🔹 رعاية خاصة ومرضى</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '1.1rem' }}>
                  <div><strong>التصنيف:</strong> {visitToPrint.healthCategory}</div>
                  <div><strong>المساعدات المطلوبة:</strong> {visitToPrint.healthcareAssistanceTypes || 'لا يوجد'}</div>
                  <div><strong>مرافق متوفر:</strong> {visitToPrint.caregiverAvailable === 'yes' ? 'نعم' : 'لا'}</div>
                </div>
              </div>
            )}

            {visitToPrint.supportLevel && (
              <div style={{marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px'}}>
                <h4 style={{fontSize: '1.2rem', marginBottom: '0.8rem', color: '#334155'}}>🔹 دعم اجتماعي</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '1.1rem' }}>
                  <div><strong>مستوى الدعم:</strong> {visitToPrint.supportLevel}</div>
                  <div><strong>نوع الدعم:</strong> {visitToPrint.socialSupportCategories || 'لا يوجد'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; padding: 0; }
          .app-container { border: none !important; box-shadow: none !important; max-width: 100% !important; padding: 0 !important; background: transparent !important; }
          
          /* Hide list when printing single */
          .print-mode-single .list-print-view { display: none !important; }
          .print-mode-single .single-print-view { display: block !important; }
          
          /* Hide single when printing list */
          .print-mode-list .single-print-view { display: none !important; }
          .print-mode-list .list-print-view { display: block !important; }
          
          .reports-table th { background: #e2e8f0 !important; color: black !important; }
          
          /* Ensures backgrounds print correctly if user enables background graphics */
          .single-print-view { padding: 1rem; color: black; }
          .single-print-view h3 { color: black !important; border-bottom: 2px solid black !important; }
          .single-print-view h4 { color: black !important; }
          .single-print-view > div { border-color: black !important; }
        }
      `}</style>
    </div>
  );
}
