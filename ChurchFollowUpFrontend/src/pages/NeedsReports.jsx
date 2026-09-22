import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { useNavigate } from 'react-router-dom';

export default function NeedsReports() {
  const navigate = useNavigate();
  const [allVisits, setAllVisits] = useState([]);
  const [visits, setVisits] = useState([]);
  
  // Filters
  const [filterNeed, setFilterNeed] = useState('');

  // Print and View state
  const [printMode, setPrintMode] = useState('list'); // 'list' or 'single'
  const [visitToPrint, setVisitToPrint] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (!filterNeed) {
      setVisits(allVisits);
    } else {
      setVisits(allVisits.filter(v => v.needs && v.needs.some(n => n.needCategory === filterNeed)));
    }
  }, [filterNeed, allVisits]);

  const fetchReports = async () => {
    try {
      const res = await fetchWithAuth('/api/followup');
      const data = await res.json();
      setAllVisits(data);
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

  const handleViewSingle = (visit) => {
    setVisitToPrint(visit);
    setPrintMode('single'); // For styling purposes
    setShowViewModal(true);
  };

  const handleExportExcel = () => {
    if (visits.length === 0) {
      alert("لا توجد بيانات للتصدير");
      return;
    }

    let exportData = [];

    if (filterNeed === 'sunday_school') {
      // Export individuals
      exportData = visits.flatMap(v => {
        if (!v.individuals || v.individuals.length === 0) return [];
        return v.individuals.map(ind => ({
          "اسم الابن/الابنة": ind.childName || '-',
          "القرابة": ind.relation || '-',
          "تاريخ الميلاد": ind.dateOfBirth || '-',
          "السن": ind.age || '-',
          "المرحلة الدراسية": ind.educationalStage || '-',
          "المدرسة/الكلية": ind.schoolCollegeName || '-',
          "رقم التليفون": ind.phoneNumber || '-',
          "أب الاعتراف": ind.confessorName || '-',
          "اسم ولي الأمر": v.family?.primaryContactName || '-',
          "تليفون ولي الأمر": v.family?.phoneNumber || '-',
          "سبب الانقطاع": ind.nonAttendanceReason || '-',
          "كنيسة أخرى": ind.otherChurchName || '-'
        }));
      });
    } else {
      // Export general visits
      exportData = visits.map(v => ({
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
        "اسم المريض": filterNeed === 'healthcare' ? (v.healthcarePatientName || '-') : '-',
        "الأولوية": v.priorityFlag === 'RED' ? 'عاجل' : (v.priorityFlag === 'YELLOW' ? 'متابعة' : 'روتيني'),
        "حالة المتابعة": v.isResolved ? 'محلولة/تمت المتابعة' : 'تحت المتابعة'
      }));
    }

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
          <h1>تقارير الاحتياجات (مفصلة)</h1>
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
            <div className="form-group" style={{gridColumn: '1 / -1'}}>
              <label>فلترة حسب نوع الاحتياج</label>
              <select value={filterNeed} onChange={(e) => setFilterNeed(e.target.value)}>
                <option value="">جميع الاحتياجات</option>
                <option value="spiritual">احتياج روحي وكنسي</option>
                <option value="sunday_school">تربية كنسية (مدارس الأحد)</option>
                <option value="healthcare">رعاية خاصة ومرضى</option>
                <option value="social_support">دعم اجتماعي ورعائي</option>
                <option value="general_visit">زيارة تعارف واطمئنان</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">
            {filterNeed === 'sunday_school' ? `أبناء مدارس الأحد (${visits.reduce((acc, v) => acc + (v.individuals?.length || 0), 0)})` : `سجل الزيارات (${visits.length})`}
          </h2>
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'right'}} className="reports-table">
              <thead>
                {filterNeed === 'sunday_school' ? (
                  <tr style={{background: 'var(--primary-color)', color: 'white'}}>
                    <th style={{padding: '1rem'}}>الاسم (القرابة)</th>
                    <th style={{padding: '1rem'}}>السن / الميلاد</th>
                    <th style={{padding: '1rem'}}>المرحلة / المدرسة</th>
                    <th style={{padding: '1rem'}}>التليفون</th>
                    <th style={{padding: '1rem'}}>ولي الأمر</th>
                    <th className="no-print" style={{padding: '1rem'}}>إجراءات الزيارة</th>
                  </tr>
                ) : (
                  <tr style={{background: 'var(--primary-color)', color: 'white'}}>
                    <th style={{padding: '1rem'}}>التاريخ</th>
                    <th style={{padding: '1rem'}}>الأسرة</th>
                    <th style={{padding: '1rem'}}>العنوان</th>
                    {filterNeed === 'healthcare' && <th style={{padding: '1rem'}}>اسم المريض</th>}
                    <th style={{padding: '1rem'}}>الخادم</th>
                    <th style={{padding: '1rem'}}>التصنيف</th>
                    <th className="no-print" style={{padding: '1rem'}}>إجراءات</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {filterNeed === 'sunday_school' ? (
                  visits.flatMap(v => v.individuals?.map(ind => (
                    <tr key={`${v.id}-${ind.id}`} style={{borderBottom: '1px solid #e2e8f0', background: v.isResolved ? '#f8fafc' : 'white'}}>
                      <td style={{padding: '1rem'}}>
                        <strong>{ind.childName}</strong> <span style={{fontSize: '0.85rem', color: '#64748b'}}>({ind.relation || 'ابن/ابنة'})</span>
                      </td>
                      <td style={{padding: '1rem'}}>
                        {ind.age || '-'}<br/><span style={{fontSize: '0.85rem'}}>{ind.dateOfBirth}</span>
                      </td>
                      <td style={{padding: '1rem'}}>
                        {ind.educationalStage || '-'}<br/><span style={{fontSize: '0.85rem'}}>{ind.schoolCollegeName}</span>
                      </td>
                      <td style={{padding: '1rem'}} dir="ltr">{ind.phoneNumber || '-'}</td>
                      <td style={{padding: '1rem'}}>
                        {v.family?.primaryContactName}<br/>
                        <span style={{fontSize: '0.85rem'}} dir="ltr">{v.family?.phoneNumber}</span>
                      </td>
                      <td className="no-print" style={{padding: '1rem'}}>
                        <button onClick={() => navigate(`/edit-visit/${v.id}`)} className="submit-btn" style={{width: 'auto', margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#3b82f6'}}>
                          ✏️ تعديل الزيارة
                        </button>
                      </td>
                    </tr>
                  )))
                ) : (
                  visits.map(v => (
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
                      
                      {filterNeed === 'healthcare' && (
                        <td style={{padding: '1rem'}}>
                          <strong>{v.healthcarePatientName || 'غير محدد'}</strong>
                        </td>
                      )}

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
                          <button onClick={() => handleViewSingle(v)} className="submit-btn" style={{width: 'auto', margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#64748b'}}>👁️ عرض</button>
                          <button onClick={() => handlePrintSingle(v)} className="submit-btn" style={{width: 'auto', margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#334155'}}>🖨️ طباعة</button>
                          <button onClick={() => navigate(`/edit-visit/${v.id}`)} className="submit-btn" style={{width: 'auto', margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#3b82f6'}}>✏️ تعديل</button>
                          {!v.isResolved && (
                            <button onClick={() => handleResolveVisit(v.id)} className="submit-btn" style={{width: 'auto', margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#10b981'}}>✔️ تمت</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {visits.length === 0 && (
                  <tr>
                    <td colSpan={filterNeed === 'healthcare' ? 7 : 6} style={{padding: '2rem', textAlign: 'center', color: '#64748b'}}>لا توجد زيارات مطابقة للبحث</td>
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
                <div><strong>اسم جهة الاتصال:</strong> {visitToPrint.family?.primaryContactName || '-'}</div>
                
                <div><strong>الأب / الزوج:</strong> {visitToPrint.family?.husbandName || '-'} {visitToPrint.family?.isHusbandDeceased ? '(متوفى)' : ''}</div>
                <div><strong>الأم / الزوجة:</strong> {visitToPrint.family?.wifeName || '-'} {visitToPrint.family?.isWifeDeceased ? '(متوفاة)' : ''}</div>

                <div dir="rtl"><strong>رقم الهاتف:</strong> <span dir="ltr">{visitToPrint.family?.phoneNumber || '-'}</span></div>
                <div dir="rtl"><strong>رقم الواتساب:</strong> <span dir="ltr">{visitToPrint.family?.whatsAppNumber || 'لا يوجد'}</span></div>
                <div style={{gridColumn: '1 / -1'}}>
                  <strong>العنوان:</strong> {visitToPrint.family?.area} - {visitToPrint.family?.street} - عمارة {visitToPrint.family?.buildingNo}
                  {visitToPrint.family?.floor ? ` - الدور ${visitToPrint.family?.floor}` : ''}
                  {visitToPrint.family?.landmark ? ` (${visitToPrint.family?.landmark})` : ''}
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
            
              <div style={{marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px'}}>
                <h4 style={{fontSize: '1.2rem', marginBottom: '0.8rem', color: '#334155'}}>🔹 الأبناء</h4>
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'right', marginTop: '0.5rem', fontSize: '1.1rem'}}>
                  <thead>
                    <tr style={{background: '#e2e8f0'}}>
                      <th style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>الاسم</th>
                      <th style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>السن (والميلاد)</th>
                      <th style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>التليفون</th>
                      <th style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>أب الاعتراف</th>
                      <th style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>بيانات أخرى</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitToPrint.individuals.map((ind, i) => (
                      <tr key={i} style={{background: '#fff'}}>
                        <td style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>{ind.childName} <span style={{fontSize: '0.85rem', color: '#64748b'}}>({ind.relation || 'ابن/ابنة'})</span>
                          {ind.educationalStage && <div style={{fontSize: '0.85rem', color: '#64748b'}}>{ind.educationalStage} - {ind.schoolCollegeName}</div>}
                        </td>
                        <td style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>{ind.age || '-'}<br/><span style={{fontSize: '0.85rem'}}>{ind.dateOfBirth}</span></td>
                        <td style={{padding: '0.75rem', border: '1px solid #cbd5e1'}} dir="ltr">{ind.phoneNumber || '-'}</td>
                        <td style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>{ind.confessorName || '-'}</td>
                        <td style={{padding: '0.75rem', border: '1px solid #cbd5e1'}}>
                          {ind.nonAttendanceReason && <div style={{fontSize: '0.85rem'}}>الانقطاع: {ind.nonAttendanceReason}</div>}
                          {ind.otherChurchName && <div style={{fontSize: '0.85rem'}}>كنيسة أخرى: {ind.otherChurchName}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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

      {/* VIEW MODAL (On-Screen details) */}
      {showViewModal && visitToPrint && (
        <div className="modal-overlay" style={{zIndex: 9999}}>
          <div className="modal-content" style={{maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2 style={{margin: 0}}>عرض تقرير الزيارة</h2>
              <button onClick={() => setShowViewModal(false)} style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#ef4444'}}>✖</button>
            </div>
            
            {/* Inject the exact same UI as single-print-view here for consistency */}
            <div className="single-print-view" style={{display: 'block'}}>
              {/* Force the view to display as block instead of relying on media queries */}
              <div dangerouslySetInnerHTML={{ __html: document.querySelector('.single-print-view')?.innerHTML || '' }} />
            </div>

            <div style={{marginTop: '2rem', textAlign: 'center'}}>
              <button className="submit-btn" onClick={() => setShowViewModal(false)} style={{width: '200px'}}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
