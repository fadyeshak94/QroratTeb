import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { useParams, useNavigate } from 'react-router-dom';

const INITIAL_STATE = {
  servantId: '',
  wasPriestPresent: 'no',
  priestName: '',
  originatingCommittee: '',
  primaryContactName: '',
  phoneNumber: '',
  whatsappNumber: '',
  husbandName: '',
  isHusbandDeceased: false,
  husbandPhoneNumber: '',
  husbandAge: '',
  husbandDateOfBirth: '',
  husbandConfessorName: '',
  husbandJob: '',
  wifeName: '',
  isWifeDeceased: false,
  wifePhoneNumber: '',
  wifeAge: '',
  wifeDateOfBirth: '',
  wifeConfessorName: '',
  wifeJob: '',
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
  // Section: Family Members
  individualsList: [{ id: Date.now(), childName: '', phoneNumber: '', age: '', dateOfBirth: '', relation: '', confessorName: '', educationalStage: '', schoolCollegeName: '', nonAttendanceReason: '', otherChurchName: '' }],
  // Section 2: Healthcare
  healthCategory: '',
  assistanceType: [],
  caregiverAvailable: '',
  patientName: '',
  // Section 2: Social
  supportLevel: '',
  supportCategory: []
};

export default function EditVisit() {
  const { id } = useParams();
  const navigate = useNavigate();

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
    // Fetch Servants from API
    fetchWithAuth('/api/servants')
      .then(res => res.json())
      .then(data => setServants(data))
      .catch(err => console.error("Error fetching servants", err));

    // Fetch Visit Details
    if (id) {
      fetchWithAuth(`/api/followup/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch visit');
          return res.json();
        })
        .then(data => {
          setVisitTime(new Date(data.visitDate).toLocaleString('ar-EG'));
          
          setFormData({
            servantId: data.servantId || '',
            wasPriestPresent: data.wasPriestPresent ? 'yes' : 'no',
            priestName: data.priestName || '',
            originatingCommittee: data.originatingCommittee || '',
            primaryContactName: data.family?.primaryContactName || '',
            phoneNumber: data.family?.phoneNumber || '',
            whatsappNumber: data.family?.whatsAppNumber || '',
            husbandName: data.family?.husbandName || '',
            isHusbandDeceased: data.family?.isHusbandDeceased || false,
            husbandPhoneNumber: data.family?.husbandPhoneNumber || '',
            husbandAge: data.family?.husbandAge || '',
            husbandDateOfBirth: data.family?.husbandDateOfBirth || '',
            husbandConfessorName: data.family?.husbandConfessorName || '',
            husbandJob: data.family?.husbandJob || '',
            wifeName: data.family?.wifeName || '',
            isWifeDeceased: data.family?.isWifeDeceased || false,
            wifePhoneNumber: data.family?.wifePhoneNumber || '',
            wifeAge: data.family?.wifeAge || '',
            wifeDateOfBirth: data.family?.wifeDateOfBirth || '',
            wifeConfessorName: data.family?.wifeConfessorName || '',
            wifeJob: data.family?.wifeJob || '',
            address: {
              area: data.family?.area || '',
              street: data.family?.street || '',
              buildingNo: data.family?.buildingNo || '',
              floor: data.family?.floor || '',
              landmark: data.family?.landmark || ''
            },
            primaryNeeds: data.needs?.map(n => n.needCategory) || [],
            serviceType: data.spiritualServiceType || '',
            hasConfessor: data.hasConfessor || '',
            confessorName: data.confessorName || '',
            isBedridden: data.isBedridden || '',
            spiritualUrgency: data.spiritualUrgency || '',
            individualsList: data.individuals?.length > 0 ? data.individuals.map(ind => ({
              id: ind.id,
              childName: ind.childName || '',
              phoneNumber: ind.phoneNumber || '',
              age: ind.age || '',
              dateOfBirth: ind.dateOfBirth || '',
              relation: ind.relation || '',
              confessorName: ind.confessorName || '',
              educationalStage: ind.educationalStage || '',
              schoolCollegeName: ind.schoolCollegeName || '',
              nonAttendanceReason: ind.nonAttendanceReason || '',
              otherChurchName: ind.otherChurchName || ''
            })) : [{ id: Date.now(), childName: '', phoneNumber: '', age: '', dateOfBirth: '', relation: '', confessorName: '', educationalStage: '', schoolCollegeName: '', nonAttendanceReason: '', otherChurchName: '' }],
            healthCategory: data.healthCategory || '',
            assistanceType: data.healthcareAssistanceTypes ? data.healthcareAssistanceTypes.split(',') : [],
            caregiverAvailable: data.caregiverAvailable || '',
            patientName: data.healthcarePatientName || '',
            supportLevel: data.supportLevel || '',
            supportCategory: data.socialSupportCategories ? data.socialSupportCategories.split(',') : []
          });
        })
        .catch(err => {
          console.error("Error fetching visit", err);
          alert("حدث خطأ أثناء جلب بيانات الزيارة");
        });
    }
  }, [id]);



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
      individualsList: [...prev.individualsList, { id: Date.now(), childName: '', phoneNumber: '', age: '', dateOfBirth: '', relation: '', confessorName: '', educationalStage: '', schoolCollegeName: '', nonAttendanceReason: '', otherChurchName: '' }]
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
          husbandName: formData.husbandName,
          isHusbandDeceased: formData.isHusbandDeceased,
          husbandPhoneNumber: formData.husbandPhoneNumber,
          husbandAge: formData.husbandAge,
          husbandDateOfBirth: formData.husbandDateOfBirth,
          husbandConfessorName: formData.husbandConfessorName,
          husbandJob: formData.husbandJob,
          wifeName: formData.wifeName,
          isWifeDeceased: formData.isWifeDeceased,
          wifePhoneNumber: formData.wifePhoneNumber,
          wifeAge: formData.wifeAge,
          wifeDateOfBirth: formData.wifeDateOfBirth,
          wifeConfessorName: formData.wifeConfessorName,
          wifeJob: formData.wifeJob,
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
          healthcarePatientName: formData.patientName,
          supportLevel: formData.supportLevel,
          supportCategory: formData.supportCategory
        };

        const response = await fetchWithAuth(`/api/followup/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          alert('تم تعديل الزيارة بنجاح');
          navigate('/reports');
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
      <h1>تعديل الزيارة</h1>
      <p className="subtitle">تعديل بيانات الافتقاد المسجلة مسبقاً</p>

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

          <div className="form-section" style={{ background: '#f8fafc', borderLeft: '4px solid #3b82f6', marginTop: '1.5rem', padding: '1rem' }}>
            <h3 style={{marginBottom: '1rem'}}>بيانات الوالدين</h3>
            
            <div className="address-grid">
              <div className="form-group">
                <label>اسم الزوج / الأب</label>
                <input type="text" name="husbandName" value={formData.husbandName} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                <label style={{ cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" name="isHusbandDeceased" checked={formData.isHusbandDeceased} onChange={(e) => handleChange({ target: { name: 'isHusbandDeceased', value: e.target.checked, type: 'checkbox' } })} />
                  متوفى
                </label>
              </div>
            </div>

            {!formData.isHusbandDeceased && (
              <>
                <div className="address-grid">
                  <div className="form-group">
                    <label>رقم التليفون (الزوج)</label>
                    <input type="tel" name="husbandPhoneNumber" value={formData.husbandPhoneNumber || ''} onChange={handleChange} dir="ltr" />
                  </div>
                  <div className="form-group">
                    <label>الوظيفة</label>
                    <input type="text" name="husbandJob" value={formData.husbandJob || ''} onChange={handleChange} />
                  </div>
                </div>
                <div className="address-grid">
                  <div className="form-group">
                    <label>تاريخ الميلاد</label>
                    <input type="date" name="husbandDateOfBirth" value={formData.husbandDateOfBirth || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>السن</label>
                    <input type="text" name="husbandAge" value={formData.husbandAge || ''} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group" style={{marginBottom: '1.5rem'}}>
                  <label>أب الاعتراف (الزوج)</label>
                  <input type="text" name="husbandConfessorName" value={formData.husbandConfessorName || ''} onChange={handleChange} />
                </div>
              </>
            )}
            
            <hr style={{borderColor: '#cbd5e1', marginBottom: '1.5rem'}} />

            <div className="address-grid">
              <div className="form-group">
                <label>اسم الزوجة / الأم</label>
                <input type="text" name="wifeName" value={formData.wifeName} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                <label style={{ cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" name="isWifeDeceased" checked={formData.isWifeDeceased} onChange={(e) => handleChange({ target: { name: 'isWifeDeceased', value: e.target.checked, type: 'checkbox' } })} />
                  متوفاة
                </label>
              </div>
            </div>

            {!formData.isWifeDeceased && (
              <>
                <div className="address-grid">
                  <div className="form-group">
                    <label>رقم التليفون (الزوجة)</label>
                    <input type="tel" name="wifePhoneNumber" value={formData.wifePhoneNumber || ''} onChange={handleChange} dir="ltr" />
                  </div>
                  <div className="form-group">
                    <label>الوظيفة</label>
                    <input type="text" name="wifeJob" value={formData.wifeJob || ''} onChange={handleChange} />
                  </div>
                </div>
                <div className="address-grid">
                  <div className="form-group">
                    <label>تاريخ الميلاد</label>
                    <input type="date" name="wifeDateOfBirth" value={formData.wifeDateOfBirth || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>السن</label>
                    <input type="text" name="wifeAge" value={formData.wifeAge || ''} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group" style={{marginBottom: '1.5rem'}}>
                  <label>أب الاعتراف (الزوجة)</label>
                  <input type="text" name="wifeConfessorName" value={formData.wifeConfessorName || ''} onChange={handleChange} />
                </div>
              </>
            )}
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

        {/* Family Members Section */}
        <div className="form-section">
          <h2 className="section-title">بيانات الأبناء (الأفراد)</h2>
          
          {formData.individualsList.map((ind, index) => (
            <div key={ind.id} className="dynamic-item">
              {formData.individualsList.length > 1 && (
                <button type="button" className="remove-btn" onClick={() => removeIndividual(ind.id)}>X</button>
              )}
              <div className="address-grid">
                <div className="form-group">
                  <label>اسم الفرد (الابن/الابنة)</label>
                  <input type="text" value={ind.childName} onChange={(e) => handleIndividualChange(ind.id, 'childName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>القرابة</label>
                  <select value={ind.relation || ''} onChange={(e) => handleIndividualChange(ind.id, 'relation', e.target.value)}>
                    <option value="">اختر...</option>
                    <option value="ابن">ابن</option>
                    <option value="ابنة">ابنة</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>

              <div className="address-grid">
                <div className="form-group">
                  <label>رقم التليفون (اختياري)</label>
                  <input type="tel" value={ind.phoneNumber || ''} onChange={(e) => handleIndividualChange(ind.id, 'phoneNumber', e.target.value)} dir="ltr" />
                </div>
                <div className="form-group">
                  <label>أب الاعتراف</label>
                  <input type="text" value={ind.confessorName || ''} onChange={(e) => handleIndividualChange(ind.id, 'confessorName', e.target.value)} placeholder="اسم أب الاعتراف إن وجد" />
                </div>
              </div>

              <div className="address-grid" style={{marginBottom: '1rem'}}>
                <div className="form-group">
                  <label>تاريخ الميلاد</label>
                  <input type="date" value={ind.dateOfBirth || ''} onChange={(e) => handleIndividualChange(ind.id, 'dateOfBirth', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>السن</label>
                  <input type="text" value={ind.age || ''} onChange={(e) => handleIndividualChange(ind.id, 'age', e.target.value)} placeholder="مثال: 10 سنوات" />
                </div>
              </div>
              
              {formData.primaryNeeds.includes('sunday_school') && (
                <div style={{padding: '1rem', background: '#f1f5f9', borderRadius: '8px'}}>
                  <h4 style={{marginBottom: '0.5rem'}}>بيانات مدارس الأحد والتربية الكنسية</h4>
                  <div className="address-grid">
                    <div className="form-group">
                      <label>المرحلة الدراسية</label>
                      <select value={ind.educationalStage || ''} onChange={(e) => handleIndividualChange(ind.id, 'educationalStage', e.target.value)}>
                        <option value="">اختر المرحلة...</option>
                        <option value="حضانة">حضانة</option>
                        <option value="ابتدائي">ابتدائي</option>
                        <option value="إعدادي">إعدادي</option>
                        <option value="ثانوي">ثانوي</option>
                        <option value="جامعي">جامعي</option>
                        <option value="خريج">خريج</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>اسم المدرسة / الكلية</label>
                      <input type="text" value={ind.schoolCollegeName || ''} onChange={(e) => handleIndividualChange(ind.id, 'schoolCollegeName', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>سبب الانقطاع أو الغياب</label>
                    <select value={ind.nonAttendanceReason || ''} onChange={(e) => handleIndividualChange(ind.id, 'nonAttendanceReason', e.target.value)}>
                      <option value="">اختر السبب...</option>
                      <option value="مواعيد غير مناسبة">مواعيد غير مناسبة</option>
                      <option value="انقطاع/كسل">انقطاع/كسل</option>
                      <option value="أسباب نفسية/اجتماعية">أسباب نفسية/اجتماعية</option>
                      <option value="كنيسة أخرى">يذهب لكنيسة أخرى</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>
                  
                  {ind.nonAttendanceReason === 'كنيسة أخرى' && (
                    <div className="form-group" style={{marginTop: '0.5rem'}}>
                      <label>اسم الكنيسة الأخرى</label>
                      <input type="text" value={ind.otherChurchName || ''} onChange={(e) => handleIndividualChange(ind.id, 'otherChurchName', e.target.value)} placeholder="أدخل اسم الكنيسة" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          <button type="button" className="add-btn" onClick={addIndividual}>+ إضافة فرد آخر</button>
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



        {/* Healthcare Needs */}
        {formData.primaryNeeds.includes('healthcare') && (
          <div className="form-section">
            <h2 className="section-title">الرعاية الخاصة والمرضى</h2>
            
            <div className="form-group">
              <label>اسم المريض (من أفراد الأسرة)</label>
              <select name="patientName" value={formData.patientName} onChange={handleChange}>
                <option value="">اختر المريض...</option>
                {formData.husbandName && !formData.isHusbandDeceased && <option value={formData.husbandName}>{formData.husbandName} (الزوج/الأب)</option>}
                {formData.wifeName && !formData.isWifeDeceased && <option value={formData.wifeName}>{formData.wifeName} (الزوجة/الأم)</option>}
                {formData.individualsList.map(ind => ind.childName ? <option key={ind.id} value={ind.childName}>{ind.childName} ({ind.relation || 'ابن/ابنة'})</option> : null)}
                <option value="other">شخص آخر...</option>
              </select>
              {formData.patientName === 'other' && (
                <input type="text" name="patientName" onChange={handleChange} placeholder="اكتب اسم المريض هنا" style={{marginTop: '0.5rem'}} />
              )}
            </div>

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
          {isLoading ? 'جاري الحفظ...' : 'تحديث تقرير الزيارة 🚀'}
        </button>
      </form>


    </div>
  );
}
