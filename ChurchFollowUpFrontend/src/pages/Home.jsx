import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/fetchWithAuth';

const INITIAL_STATE = {
  servantId: '',
  wasPriestPresent: 'no',
  priestName: '',
  originatingCommittee: '',
  primaryContactName: '',
  phoneNumber: '',
  whatsappNumber: '',
  address: {
    area: '',
    street: '',
    buildingNo: '',
    floor: '',
    landmark: ''
  },
  primaryNeeds: [],
  // Section 2: Spiritual
  serviceType: '',
  hasConfessor: '',
  confessorName: '',
  isBedridden: '',
  spiritualUrgency: '',
  // Section 2: Sunday School
  individualsList: [{ id: Date.now(), childName: '', educationalStage: '', schoolCollegeName: '', nonAttendanceReason: '' }],
  // Section 2: Healthcare
  healthCategory: '',
  assistanceType: [],
  caregiverAvailable: '',
  // Section 2: Social
  supportLevel: '',
  supportCategory: []
};

export default function Home() {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [servants, setServants] = useState([]);
  const [visitTime, setVisitTime] = useState('');

  // Family Profile State
  const [searchPhone, setSearchPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [visitHistory, setVisitHistory] = useState([]);

  useEffect(() => {
    const now = new Date();
    setVisitTime(now.toLocaleString('ar-EG'));

    // Fetch Servants from API
    fetchWithAuth('/api/servants')
      .then(res => res.json())
      .then(data => setServants(data))
      .catch(err => console.error("Error fetching servants", err));
  }, []);

  const handleSearchFamily = async () => {
    if (!searchPhone || searchPhone.length < 11) {
      alert("برجاء إدخال رقم هاتف صحيح للبحث");
      return;
    }
    setIsSearching(true);
    setVisitHistory([]);
    try {
      const res = await fetchWithAuth(`/api/family/search?phone=${searchPhone}`);
      if (res.ok) {
        const data = await res.json();
        // Auto-fill form
        setFormData(prev => ({
          ...prev,
          primaryContactName: data.primaryContactName || '',
          phoneNumber: data.phoneNumber || '',
          whatsappNumber: data.whatsAppNumber || '',
          address: {
            area: data.area || '',
            street: data.street || '',
            buildingNo: data.buildingNo || '',
            floor: data.floor || '',
            landmark: data.landmark || ''
          }
        }));
        setVisitHistory(data.visitHistory || []);
        alert("تم العثور على الأسرة وملء بياناتها بنجاح!");
      } else if (res.status === 404) {
        alert("لم يتم العثور على عائلة مسجلة بهذا الرقم. يمكنك تسجيلها كعائلة جديدة.");
        setFormData(prev => ({ ...prev, phoneNumber: searchPhone }));
      }
    } catch (e) {
      console.error(e);
      alert("خطأ في الاتصال بالخادم.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else if (name === 'primaryNeeds') {
      let updatedNeeds = [...formData.primaryNeeds];
      if (value === 'general_visit' && checked) {
        updatedNeeds = ['general_visit'];
      } else {
        if (checked) {
          updatedNeeds = updatedNeeds.filter(n => n !== 'general_visit');
          updatedNeeds.push(value);
        } else {
          updatedNeeds = updatedNeeds.filter(n => n !== value);
        }
      }
      setFormData(prev => ({ ...prev, primaryNeeds: updatedNeeds }));
    } else if (type === 'checkbox') {
      let updatedArr = [...formData[name]];
      if (checked) updatedArr.push(value);
      else updatedArr = updatedArr.filter(v => v !== value);
      setFormData(prev => ({ ...prev, [name]: updatedArr }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleIndividualChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      individualsList: prev.individualsList.map(ind => 
        ind.id === id ? { ...ind, [field]: value } : ind
      )
    }));
  };

  const addIndividual = () => {
    setFormData(prev => ({
      ...prev,
      individualsList: [...prev.individualsList, { id: Date.now(), childName: '', educationalStage: '', schoolCollegeName: '', nonAttendanceReason: '' }]
    }));
  };

  const removeIndividual = (id) => {
    if (formData.individualsList.length > 1) {
      setFormData(prev => ({
        ...prev,
        individualsList: prev.individualsList.filter(ind => ind.id !== id)
      }));
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.servantId) newErrors.servantId = 'مطلوب';
    if (!formData.originatingCommittee) newErrors.originatingCommittee = 'مطلوب';
    if (!formData.primaryContactName || formData.primaryContactName.length < 5) newErrors.primaryContactName = 'الاسم يجب أن يكون 5 أحرف على الأقل';
    
    if (formData.wasPriestPresent === 'yes' && !formData.priestName) newErrors.priestName = 'مطلوب إدخال اسم الكاهن';

    const phoneRegex = /^(01)[0-9]{9}$/;
    if (!phoneRegex.test(formData.phoneNumber)) newErrors.phoneNumber = 'رقم هاتف غير صحيح';
    
    if (!formData.address.area) newErrors['address.area'] = 'مطلوب';
    if (!formData.address.street) newErrors['address.street'] = 'مطلوب';
    if (!formData.address.buildingNo) newErrors['address.buildingNo'] = 'مطلوب';

    if (formData.primaryNeeds.length === 0) newErrors.primaryNeeds = 'يجب اختيار احتياج واحد على الأقل';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      try {
        const payload = {
          servantId: parseInt(formData.servantId),
          wasPriestPresent: formData.wasPriestPresent === 'yes',
          priestName: formData.priestName,
          originatingCommittee: formData.originatingCommittee,
          primaryContactName: formData.primaryContactName,
          phoneNumber: formData.phoneNumber,
          whatsAppNumber: formData.whatsappNumber,
          address: formData.address,
          primaryNeeds: formData.primaryNeeds,
          serviceType: formData.serviceType,
          hasConfessor: formData.hasConfessor,
          confessorName: formData.confessorName,
          isBedridden: formData.isBedridden,
          spiritualUrgency: formData.spiritualUrgency,
          individualsList: formData.individualsList,
          healthCategory: formData.healthCategory,
          assistanceType: formData.assistanceType,
          caregiverAvailable: formData.caregiverAvailable,
          supportLevel: formData.supportLevel,
          supportCategory: formData.supportCategory
        };

        const response = await fetchWithAuth('/api/followup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          const result = await response.json();
          setSubmitResult(result);
          setShowModal(true);
        } else {
          alert('حدث خطأ أثناء إرسال البيانات للخادم.');
        }
      } catch (error) {
        console.error(error);
        alert('فشل الاتصال بالخادم. تأكد من تشغيل خادم .NET (Backend).');
      } finally {
        setIsLoading(false);
      }
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="app-container">
      <h1>نموذج الزيارات (قارورة طيب)</h1>
      <p className="subtitle">تسجيل بيانات الافتقاد الذكي والمتابعة</p>

      <div className="form-section" style={{ background: '#f8fafc', border: '2px dashed #cbd5e1' }}>
        <h2 className="section-title">بحث عن أسرة (جلب تلقائي)</h2>
        <div className="address-grid" style={{ alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>رقم الهاتف للبحث</label>
            <input type="tel" value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} placeholder="أدخل رقم هاتف الأسرة..." dir="ltr" />
          </div>
          <button type="button" onClick={handleSearchFamily} disabled={isSearching} className="submit-btn" style={{ margin: 0, padding: '0.8rem 1rem', width: 'auto', backgroundColor: '#3b82f6' }}>
            {isSearching ? 'جاري البحث...' : '🔍 بحث وجلب البيانات'}
          </button>
        </div>
      </div>

      {visitHistory.length > 0 && (
        <div className="form-section" style={{ borderLeft: '4px solid #10b981' }}>
          <h2 className="section-title">التاريخ الرعوي (الزيارات السابقة)</h2>
          <table className="reports-table" style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '0.5rem' }}>التاريخ</th>
                <th style={{ padding: '0.5rem' }}>الخادم</th>
                <th style={{ padding: '0.5rem' }}>الأولوية</th>
                <th style={{ padding: '0.5rem' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {visitHistory.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.5rem' }}>{new Date(v.visitDate).toLocaleDateString('ar-EG')}</td>
                  <td style={{ padding: '0.5rem' }}>{v.servantName}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <span className={`flag-badge flag-${v.priorityFlag.toLowerCase()}`} style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', margin: 0 }}>
                      {v.priorityFlag === 'RED' ? '🔴 عاجل' : v.priorityFlag === 'YELLOW' ? '🟡 متابعة' : '🟢 روتيني'}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    {v.isResolved ? <span style={{ color: '#10b981' }}>✔️ محلولة</span> : <span style={{ color: '#ef4444' }}>⏳ تحت المتابعة</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="section-title">البيانات الأساسية للزيارة</h2>
          
          <div className="form-group">
            <label>تاريخ ووقت الزيارة</label>
            <input type="text" value={visitTime} disabled style={{ background: '#f1f5f9', cursor: 'not-allowed' }} />
          </div>

          <div className="address-grid">
            <div className="form-group">
              <label>اسم الخادم</label>
              <select name="servantId" value={formData.servantId} onChange={handleChange} className={errors.servantId ? 'input-error' : ''}>
                <option value="">اختر الخادم...</option>
                {servants.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - {s.committee}</option>
                ))}
              </select>
              {errors.servantId && <span className="error-text">{errors.servantId}</span>}
            </div>

            <div className="form-group">
              <label>لجنة التوجيه</label>
              <select name="originatingCommittee" value={formData.originatingCommittee} onChange={handleChange} className={errors.originatingCommittee ? 'input-error' : ''}>
                <option value="">اختر اللجنة...</option>
                <option value="لجنة المنطقة الأولى">لجنة المنطقة الأولى</option>
                <option value="لجنة المنطقة الثانية">لجنة المنطقة الثانية</option>
                <option value="لجنة الطوارئ والمناسبات">لجنة الطوارئ والمناسبات</option>
              </select>
              {errors.originatingCommittee && <span className="error-text">{errors.originatingCommittee}</span>}
            </div>
          </div>

          <div className="address-grid">
            <div className="form-group">
              <label>هل كان معكم كاهن في الزيارة؟</label>
              <select name="wasPriestPresent" value={formData.wasPriestPresent} onChange={handleChange}>
                <option value="no">لا</option>
                <option value="yes">نعم</option>
              </select>
            </div>
            {formData.wasPriestPresent === 'yes' && (
              <div className="form-group">
                <label>اسم الكاهن</label>
                <input type="text" name="priestName" value={formData.priestName} onChange={handleChange} className={errors.priestName ? 'input-error' : ''} />
                {errors.priestName && <span className="error-text">{errors.priestName}</span>}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>اسم جهة الاتصال (رب الأسرة)</label>
            <input type="text" name="primaryContactName" value={formData.primaryContactName} onChange={handleChange} className={errors.primaryContactName ? 'input-error' : ''} />
            {errors.primaryContactName && <span className="error-text">{errors.primaryContactName}</span>}
          </div>

          <div className="address-grid">
            <div className="form-group">
              <label>رقم الهاتف الأساسي</label>
              <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="01..." dir="ltr" className={errors.phoneNumber ? 'input-error' : ''} />
              {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
            </div>
            <div className="form-group">
              <label>رقم الواتساب (اختياري)</label>
              <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="01..." dir="ltr" />
            </div>
          </div>

          <div className="form-group" style={{marginTop: '1rem'}}>
            <label>عنوان الزيارة</label>
            <div className="address-grid">
              <div>
                <input type="text" name="address.area" placeholder="المنطقة *" value={formData.address.area} onChange={handleChange} className={errors['address.area'] ? 'input-error' : ''} style={{marginBottom: '0.5rem'}} />
                {errors['address.area'] && <span className="error-text">{errors['address.area']}</span>}
              </div>
              <div>
                <input type="text" name="address.street" placeholder="الشارع *" value={formData.address.street} onChange={handleChange} className={errors['address.street'] ? 'input-error' : ''} style={{marginBottom: '0.5rem'}} />
                {errors['address.street'] && <span className="error-text">{errors['address.street']}</span>}
              </div>
              <div>
                <input type="text" name="address.buildingNo" placeholder="رقم العمارة *" value={formData.address.buildingNo} onChange={handleChange} className={errors['address.buildingNo'] ? 'input-error' : ''} />
                {errors['address.buildingNo'] && <span className="error-text">{errors['address.buildingNo']}</span>}
              </div>
              <div>
                <input type="text" name="address.floor" placeholder="الدور (اختياري)" value={formData.address.floor} onChange={handleChange} />
              </div>
            </div>
            <input type="text" name="address.landmark" placeholder="علامة مميزة (اختياري)" value={formData.address.landmark} onChange={handleChange} style={{marginTop: '0.5rem'}} />
          </div>

          <div className="form-group" style={{marginTop: '1.5rem'}}>
            <label>نوع الاحتياج الأساسي (يمكن اختيار أكثر من احتياج)</label>
            {errors.primaryNeeds && <span className="error-text" style={{marginBottom: '0.5rem', display: 'block'}}>{errors.primaryNeeds}</span>}
            
            <div className="options-grid">
              {[
                { val: 'spiritual', label: 'احتياج روحي وكنسي' },
                { val: 'sunday_school', label: 'تربية كنسية (مدارس الأحد)' },
                { val: 'healthcare', label: 'رعاية خاصة ومرضى' },
                { val: 'social_support', label: 'دعم اجتماعي ورعائي' },
                { val: 'general_visit', label: 'زيارة تعارف واطمئنان فقط' }
              ].map(opt => (
                <label key={opt.val} className={`option-card ${formData.primaryNeeds.includes(opt.val) ? 'selected' : ''}`}>
                  <input type="checkbox" name="primaryNeeds" value={opt.val} checked={formData.primaryNeeds.includes(opt.val)} onChange={handleChange} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Spiritual Needs */}
        {formData.primaryNeeds.includes('spiritual') && (
          <div className="form-section">
            <h2 className="section-title">الاحتياجات الروحية والكنسية</h2>
            
            <div className="form-group">
              <label>نوع الخدمة</label>
              <div className="options-grid" style={{display: 'flex', flexWrap: 'wrap'}}>
                {['سر الاعتراف', 'تناول مرضى بالمنزل', 'افتقاد كاهن عام'].map(val => (
                  <label key={val} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                    <input type="radio" name="serviceType" value={val} checked={formData.serviceType === val} onChange={handleChange} /> {val}
                  </label>
                ))}
              </div>
            </div>

            <div className="address-grid">
              <div className="form-group">
                <label>هل يوجد أب اعتراف؟</label>
                <select name="hasConfessor" value={formData.hasConfessor} onChange={handleChange}>
                  <option value="">اختر...</option>
                  <option value="yes">نعم</option>
                  <option value="no">لا</option>
                </select>
              </div>
              
              {formData.hasConfessor === 'yes' && (
                <div className="form-group">
                  <label>اسم أب الاعتراف</label>
                  <input type="text" name="confessorName" value={formData.confessorName} onChange={handleChange} />
                </div>
              )}
            </div>

            <div className="address-grid">
              <div className="form-group">
                <label>هل الشخص طريح الفراش؟</label>
                <select name="isBedridden" value={formData.isBedridden} onChange={handleChange}>
                  <option value="">اختر...</option>
                  <option value="yes">نعم</option>
                  <option value="no">لا</option>
                </select>
              </div>

              <div className="form-group">
                <label>مستوى الأهمية (روحي)</label>
                <select name="spiritualUrgency" value={formData.spiritualUrgency} onChange={handleChange}>
                  <option value="">اختر الأهمية...</option>
                  <option value="🔴 عاجل خلال 24 ساعة">🔴 عاجل خلال 24 ساعة</option>
                  <option value="🟡 خلال أسبوع">🟡 خلال أسبوع</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Sunday School Needs */}
        {formData.primaryNeeds.includes('sunday_school') && (
          <div className="form-section">
            <h2 className="section-title">أفراد الأسرة (تربية كنسية)</h2>
            
            {formData.individualsList.map((ind, index) => (
              <div key={ind.id} className="dynamic-item">
                {formData.individualsList.length > 1 && (
                  <button type="button" className="remove-btn" onClick={() => removeIndividual(ind.id)}>X</button>
                )}
                <div className="address-grid">
                  <div className="form-group">
                    <label>اسم الفرد</label>
                    <input type="text" value={ind.childName} onChange={(e) => handleIndividualChange(ind.id, 'childName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>المرحلة الدراسية</label>
                    <select value={ind.educationalStage} onChange={(e) => handleIndividualChange(ind.id, 'educationalStage', e.target.value)}>
                      <option value="">اختر المرحلة...</option>
                      <option value="حضانة">حضانة</option>
                      <option value="ابتدائي">ابتدائي</option>
                      <option value="إعدادي">إعدادي</option>
                      <option value="ثانوي">ثانوي</option>
                      <option value="جامعي">جامعي</option>
                    </select>
                  </div>
                </div>

                <div className="address-grid">
                  <div className="form-group">
                    <label>اسم المدرسة / الكلية</label>
                    <input type="text" value={ind.schoolCollegeName} onChange={(e) => handleIndividualChange(ind.id, 'schoolCollegeName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>سبب الانقطاع أو الغياب</label>
                    <select value={ind.nonAttendanceReason} onChange={(e) => handleIndividualChange(ind.id, 'nonAttendanceReason', e.target.value)}>
                      <option value="">اختر السبب...</option>
                      <option value="مواعيد غير مناسبة">مواعيد غير مناسبة</option>
                      <option value="انقطاع/كسل">انقطاع/كسل</option>
                      <option value="أسباب نفسية/اجتماعية">أسباب نفسية/اجتماعية</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            
            <button type="button" className="add-btn" onClick={addIndividual}>+ إضافة فرد آخر</button>
          </div>
        )}

        {/* Healthcare Needs */}
        {formData.primaryNeeds.includes('healthcare') && (
          <div className="form-section">
            <h2 className="section-title">الرعاية الخاصة والمرضى</h2>
            
            <div className="form-group">
              <label>تصنيف الحالة الصحية</label>
              <select name="healthCategory" value={formData.healthCategory} onChange={handleChange}>
                <option value="">اختر التصنيف...</option>
                <option value="مريض فراش">مريض فراش</option>
                <option value="كبار سن">كبار سن</option>
                <option value="ذوي همم">ذوي همم</option>
                <option value="جراحة عاجلة">جراحة عاجلة</option>
              </select>
            </div>

            <div className="form-group">
              <label>نوع المساعدة المطلوبة</label>
              <div className="options-grid">
                {['زيارة مؤانسة', 'أجهزة طبية', 'زيارة طبيب متخصص'].map(val => (
                  <label key={val} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                    <input type="checkbox" name="assistanceType" value={val} checked={formData.assistanceType.includes(val)} onChange={handleChange} /> {val}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>هل يتوفر مرافق دائم للحالة؟</label>
              <select name="caregiverAvailable" value={formData.caregiverAvailable} onChange={handleChange}>
                <option value="">اختر...</option>
                <option value="yes">نعم</option>
                <option value="no">لا</option>
              </select>
            </div>
          </div>
        )}

        {/* Social Support */}
        {formData.primaryNeeds.includes('social_support') && (
          <div className="form-section">
            <h2 className="section-title">الدعم الاجتماعي والرعائي</h2>
            
            <div className="form-group">
              <label>مستوى الدعم المطلوب</label>
              <div className="options-grid" style={{display: 'flex', flexWrap: 'wrap'}}>
                {['🔴 عاجل جداً', '🟡 متوسط', '🟢 عادي'].map(val => (
                  <label key={val} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                    <input type="radio" name="supportLevel" value={val} checked={formData.supportLevel === val} onChange={handleChange} /> {val}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>نوع الدعم</label>
              <div className="options-grid">
                {['عيني (أغذية وملابس)', 'مادي (مساعدات مالية)', 'فرص عمل', 'استشارة أسرية'].map(val => (
                  <label key={val} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                    <input type="checkbox" name="supportCategory" value={val} checked={formData.supportCategory.includes(val)} onChange={handleChange} /> {val}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
          {isLoading ? 'جاري الإرسال...' : 'إرسال تقرير الزيارة 🚀'}
        </button>
      </form>

      {/* RESULT MODAL */}
      {showModal && submitResult && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>تم حفظ الزيارة بقاعدة البيانات! 🎉</h2>
            <p>التقييم الذكي للحالة:</p>
            
            <div className={`flag-badge flag-${submitResult.flag?.toLowerCase()}`}>
              {submitResult.flagAr}
            </div>

            <div style={{marginTop: '1.5rem', textAlign: 'right', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
              <h3 style={{fontSize: '1rem', marginBottom: '0.5rem'}}>الجهات الموجهة:</h3>
              <ul style={{listStylePosition: 'inside', color: '#475569', fontSize: '0.9rem'}}>
                {submitResult.targets?.map((t, idx) => <li key={idx}>{t}</li>)}
              </ul>
            </div>

            <button className="close-modal-btn" onClick={() => {
              setShowModal(false);
              setShowModal(false);
              setFormData(INITIAL_STATE);
              setSearchPhone('');
              setVisitHistory([]);
              window.scrollTo(0,0);
            }}>موافق وإغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}
