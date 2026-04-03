import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

const GENDERS = ['Female', 'Male', 'Other'];
const EMPTY_FORM = { name: '', age: '', gender: 'Female', symptoms: '', diagnosis: '', village: '', weight: '', temp: '', bp: '', spo2: '', duration: '', duration_unit: 'days' };
const EMPTY_ASHA = { worker_name: '', worker_id: '', phc_block: '', district: '', state: '', phone: '' };

const LANGUAGES = [
  { code: 'hi-IN', label: 'हिन्दी', name: 'Hindi' },
  { code: 'mr-IN', label: 'मराठी', name: 'Marathi' },
  { code: 'en-IN', label: 'English', name: 'English' },
  { code: 'bn-IN', label: 'বাংলা', name: 'Bengali' },
  { code: 'te-IN', label: 'తెలుగు', name: 'Telugu' },
  { code: 'ta-IN', label: 'தமிழ்', name: 'Tamil' },
  { code: 'gu-IN', label: 'ગુજરાતી', name: 'Gujarati' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ', name: 'Kannada' },
];

const T = {
  'hi-IN': { addPatient:'मरीज़ जोड़ें', search:'मरीज़, गाँव खोजें...', patientRecords:'मरीज़ों के रिकॉर्ड', name:'नाम', age:'उम्र', gender:'लिंग', village:'गाँव', symptoms:'लक्षण', diagnosis:'निदान', save:'रिकॉर्ड सेव करें', listening:'सुन रहे हैं...', tapToSpeak:'बोलने के लिए दबाएं', totalPatients:'कुल मरीज़', female:'महिला', male:'पुरुष', villages:'गाँव', allPatients:'सभी मरीज़', records:'रिकॉर्ड', noPatients:'अभी कोई मरीज़ नहीं।', saved:'रिकॉर्ड सफलतापूर्वक सेव हुआ!', deleted:'रिकॉर्ड हटाया गया', fillFields:'कृपया सभी ज़रूरी फ़ील्ड भरें', newRecord:'नया मरीज़ रिकॉर्ड', voiceHint:'माइक दबाएं और बोलें', home:'होम', reports:'रिपोर्ट', vaccinations:'टीकाकरण', reminders:'अनुस्मारक', settings:'सेटिंग्स', patients:'मरीज़', voiceInput:'आवाज़ से दर्ज करें' },
  'mr-IN': { addPatient:'रुग्ण जोडा', search:'रुग्ण, गाव शोधा...', patientRecords:'रुग्णांचे रेकॉर्ड', name:'नाव', age:'वय', gender:'लिंग', village:'गाव', symptoms:'लक्षणे', diagnosis:'निदान', save:'रेकॉर्ड जतन करा', listening:'ऐकत आहे...', tapToSpeak:'बोलण्यासाठी दाबा', totalPatients:'एकूण रुग्ण', female:'महिला', male:'पुरुष', villages:'गावे', allPatients:'सर्व रुग्ण', records:'नोंदी', noPatients:'अद्याप कोणतेही रुग्ण नाहीत.', saved:'रेकॉर्ड जतन झाला!', deleted:'रेकॉर्ड हटवला', fillFields:'सर्व आवश्यक फील्ड भरा', newRecord:'नवीन रुग्ण नोंद', voiceHint:'माइक दाबा आणि बोला', home:'होम', reports:'अहवाल', vaccinations:'लसीकरण', reminders:'स्मरणपत्रे', settings:'सेटिंग्ज', patients:'रुग्ण', voiceInput:'आवाजाने नोंद करा' },
  'en-IN': { addPatient:'Add Patient', search:'Search patients, village...', patientRecords:'Patient Records', name:'Name', age:'Age', gender:'Gender', village:'Village', symptoms:'Symptoms', diagnosis:'Diagnosis', save:'Save Record', listening:'Listening...', tapToSpeak:'Tap to speak', totalPatients:'Total Patients', female:'Female', male:'Male', villages:'Villages', allPatients:'All Patients', records:'records', noPatients:'No patients yet. Add your first record!', saved:'Saved successfully!', deleted:'Record deleted', fillFields:'Please fill all required fields', newRecord:'New Patient Record', voiceHint:'Press mic and speak', home:'Home', reports:'Reports', vaccinations:'Vaccinations', reminders:'Reminders', settings:'Settings', patients:'Patients', voiceInput:'Voice Entry' },
  'bn-IN': { addPatient:'রোগী যোগ করুন', search:'রোগী, গ্রাম খুঁজুন...', patientRecords:'রোগীর রেকর্ড', name:'নাম', age:'বয়স', gender:'লিঙ্গ', village:'গ্রাম', symptoms:'উপসর্গ', diagnosis:'রোগ নির্ণয়', save:'সেভ করুন', listening:'শুনছি...', tapToSpeak:'বলতে চাপুন', totalPatients:'মোট রোগী', female:'মহিলা', male:'পুরুষ', villages:'গ্রাম', allPatients:'সকল রোগী', records:'রেকর্ড', noPatients:'এখনো কোনো রোগী নেই।', saved:'সফলভাবে সেভ হয়েছে!', deleted:'মুছে ফেলা হয়েছে', fillFields:'সকল তথ্য পূরণ করুন', newRecord:'নতুন রোগীর রেকর্ড', voiceHint:'মাইক চাপুন এবং বলুন', home:'হোম', reports:'রিপোর্ট', vaccinations:'টিকা', reminders:'অনুস্মারক', settings:'সেটিংস', patients:'রোগী', voiceInput:'ভয়েস এন্ট্রি' },
  'te-IN': { addPatient:'రోగిని జోడించు', search:'రోగి వెతకండి...', patientRecords:'రోగుల రికార్డులు', name:'పేరు', age:'వయసు', gender:'లింగం', village:'గ్రామం', symptoms:'లక్షణాలు', diagnosis:'నిర్ధారణ', save:'సేవ్ చేయి', listening:'వింటున్నాను...', tapToSpeak:'నొక్కండి', totalPatients:'మొత్తం రోగులు', female:'స్త్రీ', male:'పురుషుడు', villages:'గ్రామాలు', allPatients:'అందరు రోగులు', records:'రికార్డులు', noPatients:'ఇంకా రోగులు లేరు.', saved:'సేవ్ అయింది!', deleted:'తొలగించబడింది', fillFields:'అన్ని ఫీల్డ్‌లు పూరించండి', newRecord:'కొత్త రోగి రికార్డు', voiceHint:'మైక్ నొక్కి చెప్పండి', home:'హోమ్', reports:'నివేదికలు', vaccinations:'వ్యాక్సినేషన్', reminders:'రిమైండర్లు', settings:'సెట్టింగ్లు', patients:'రోగులు', voiceInput:'వాయిస్ ఎంట్రీ' },
  'ta-IN': { addPatient:'சேர்க்கவும்', search:'தேடுங்கள்...', patientRecords:'நோயாளி பதிவுகள்', name:'பெயர்', age:'வயது', gender:'பாலினம்', village:'கிராமம்', symptoms:'அறிகுறிகள்', diagnosis:'நோய் கண்டறிதல்', save:'சேமிக்கவும்', listening:'கேட்கிறேன்...', tapToSpeak:'அழுத்தவும்', totalPatients:'மொத்த நோயாளிகள்', female:'பெண்', male:'ஆண்', villages:'கிராமங்கள்', allPatients:'அனைத்து நோயாளிகள்', records:'பதிவுகள்', noPatients:'நோயாளிகள் இல்லை.', saved:'சேமிக்கப்பட்டது!', deleted:'நீக்கப்பட்டது', fillFields:'அனைத்து புலங்களையும் நிரப்பவும்', newRecord:'புதிய பதிவு', voiceHint:'மைக்கை அழுத்தி பேசுங்கள்', home:'முகப்பு', reports:'அறிக்கைகள்', vaccinations:'தடுப்பூசி', reminders:'நினைவூட்டல்கள்', settings:'அமைப்புகள்', patients:'நோயாளிகள்', voiceInput:'குரல் உள்ளீடு' },
  'gu-IN': { addPatient:'દર્દી ઉમેરો', search:'શોધો...', patientRecords:'દર્દીઓના રેકોર્ડ', name:'નામ', age:'ઉંમર', gender:'જાતિ', village:'ગામ', symptoms:'લક્ષણો', diagnosis:'નિદાન', save:'સેવ કરો', listening:'સાંભળી રહ્યા...', tapToSpeak:'દબાવો', totalPatients:'કુલ દર્દીઓ', female:'સ્ત્રી', male:'પુરુષ', villages:'ગામો', allPatients:'તમામ દર્દીઓ', records:'રેકોર્ડ', noPatients:'હજુ કોઈ દર્દી નથી.', saved:'સેવ થયો!', deleted:'કાઢ્યો', fillFields:'બધા ફીલ્ડ ભરો', newRecord:'નવો દર્દી રેકોર્ડ', voiceHint:'માઇક દબાવો', home:'હોમ', reports:'રિપોર્ટ', vaccinations:'રસીકરણ', reminders:'રિમાઇન્ડર', settings:'સેટિંગ', patients:'દર્દીઓ', voiceInput:'અવાજ નોંધ' },
  'kn-IN': { addPatient:'ಸೇರಿಸಿ', search:'ಹುಡುಕಿ...', patientRecords:'ರೋಗಿಗಳ ದಾಖಲೆಗಳು', name:'ಹೆಸರು', age:'ವಯಸ್ಸು', gender:'ಲಿಂಗ', village:'ಗ್ರಾಮ', symptoms:'ರೋಗಲಕ್ಷಣಗಳು', diagnosis:'ರೋಗನಿರ್ಣಯ', save:'ಉಳಿಸಿ', listening:'ಕೇಳುತ್ತಿದ್ದೇನೆ...', tapToSpeak:'ಒತ್ತಿರಿ', totalPatients:'ಒಟ್ಟು ರೋಗಿಗಳು', female:'ಮಹಿಳೆ', male:'ಪುರುಷ', villages:'ಗ್ರಾಮಗಳು', allPatients:'ಎಲ್ಲಾ ರೋಗಿಗಳು', records:'ದಾಖಲೆಗಳು', noPatients:'ಇನ್ನೂ ರೋಗಿಗಳಿಲ್ಲ.', saved:'ಉಳಿಸಲಾಗಿದೆ!', deleted:'ಅಳಿಸಲಾಗಿದೆ', fillFields:'ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ತುಂಬಿಸಿ', newRecord:'ಹೊಸ ದಾಖಲೆ', voiceHint:'ಮೈಕ್ ಒತ್ತಿ ಹೇಳಿ', home:'ಮನೆ', reports:'ವರದಿಗಳು', vaccinations:'ಲಸಿಕೆ', reminders:'ರಿಮೈಂಡರ್', settings:'ಸೆಟ್ಟಿಂಗ್ಸ್', patients:'ರೋಗಿಗಳು', voiceInput:'ಧ್ವನಿ ನಮೂದು' },
};

export default function Dashboard() {
  const [patients, setPatients]         = useState([]);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [ashaForm, setAshaForm]         = useState(EMPTY_ASHA);
  const [ashaId, setAshaId]             = useState(null); // existing record id
  const [ashaLoading, setAshaLoading]   = useState(false);
  const [ashaFetching, setAshaFetching] = useState(true);
  const [loading, setLoading]           = useState(false);
  const [fetching, setFetching]         = useState(true);
  const [toast, setToast]               = useState(null);
  const [search, setSearch]             = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [selected, setSelected]         = useState(null);
  const [lang, setLang]                 = useState('hi-IN');
  const [page, setPage]                 = useState('patients');
  const [listening, setListening]       = useState(false);
  const [activeField, setActiveField]   = useState(null);
  const [transcript, setTranscript]     = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceField, setVoiceField]     = useState('symptoms');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── AI DIAGNOSIS STATE ──
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiResult, setAiResult]     = useState(null);
  const [aiError, setAiError]       = useState('');
  const t = T[lang] || T['en-IN'];
  const currentLang = LANGUAGES.find(l => l.code === lang);

  useEffect(() => {
    loadPatients();
    loadAshaWorker();
    if (typeof window !== 'undefined') {
      setVoiceSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
    }
  }, []);

  // ── PATIENTS ──
  async function loadPatients() {
    setFetching(true);
    const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (!error) setPatients(data || []);
    setFetching(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.age || !form.village) { showToast(t.fillFields, 'error'); return; }
    setLoading(true);
    const row = { ...form, age: Number(form.age), weight: form.weight ? Number(form.weight) : null, temp: form.temp ? Number(form.temp) : null, spo2: form.spo2 ? Number(form.spo2) : null, duration: form.duration || null, duration_unit: form.duration_unit || 'days', bp: form.bp || null };
    const { data, error } = await supabase.from('patients').insert([row]).select().single();
    setLoading(false);
    if (error) { showToast(error.message, 'error'); return; }
    setPatients(prev => [data, ...prev]);
    setForm(EMPTY_FORM);
    setShowForm(false);
    showToast(t.saved, 'success');
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (!error) { setPatients(prev => prev.filter(p => p.id !== id)); if (selected?.id === id) setSelected(null); showToast(t.deleted, 'info'); }
  }

  // ── ASHA WORKER ──
  async function loadAshaWorker() {
    setAshaFetching(true);
    const { data, error } = await supabase.from('asha_workers').select('*').order('created_at', { ascending: true }).limit(1);
    if (!error && data && data.length > 0) {
      const w = data[0];
      setAshaId(w.id);
      setAshaForm({
        worker_name: w.worker_name || '',
        worker_id:   w.worker_id   || '',
        phc_block:   w.phc_block   || '',
        district:    w.district    || '',
        state:       w.state       || '',
        phone:       w.phone       || '',
      });
    }
    setAshaFetching(false);
  }

  async function saveAshaWorker(e) {
    e.preventDefault();
    if (!ashaForm.worker_name) { showToast('Please enter worker name', 'error'); return; }
    setAshaLoading(true);

    let error;
    if (ashaId) {
      // Update existing record
      ({ error } = await supabase.from('asha_workers').update(ashaForm).eq('id', ashaId));
    } else {
      // Insert new record
      const { data, error: insertError } = await supabase.from('asha_workers').insert([ashaForm]).select().single();
      error = insertError;
      if (!insertError && data) setAshaId(data.id);
    }

    setAshaLoading(false);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('ASHA worker profile saved! ✅', 'success');
  }

  // ── VOICE ──
  function startVoice(fieldName) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast('Use Chrome or Edge for voice', 'error'); return; }
    if (recognitionRef.current) recognitionRef.current.stop();
    const r = new SR();
    r.lang = lang; r.continuous = false; r.interimResults = true;
    r.onstart = () => { setListening(true); setActiveField(fieldName); setTranscript(''); };
    r.onresult = (e) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const txt = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += txt; else interim += txt;
      }
      setTranscript(interim || final);
      if (final) setForm(prev => ({ ...prev, [fieldName]: prev[fieldName] ? prev[fieldName] + ', ' + final : final }));
    };
    r.onerror = (e) => { setListening(false); setActiveField(null); if (e.error !== 'aborted') showToast('Voice: ' + e.error, 'error'); };
    r.onend = () => { setListening(false); setActiveField(null); setTranscript(''); };
    recognitionRef.current = r;
    r.start();
  }

  function stopVoice() { if (recognitionRef.current) recognitionRef.current.stop(); setListening(false); setActiveField(null); }

  function startVoicePage() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast('Use Chrome or Edge', 'error'); return; }
    if (recognitionRef.current) recognitionRef.current.stop();
    const r = new SR();
    r.lang = lang; r.continuous = true; r.interimResults = true;
    r.onstart = () => { setListening(true); setVoiceTranscript(''); };
    r.onresult = (e) => {
      let full = '';
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript + ' ';
      setVoiceTranscript(full.trim());
    };
    r.onerror = (e) => { setListening(false); if (e.error !== 'aborted') showToast('Error: ' + e.error, 'error'); };
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
  }

  function stopVoicePage() { if (recognitionRef.current) recognitionRef.current.stop(); setListening(false); }

  function applyVoiceToForm() {
    if (!voiceTranscript) return;
    setForm(prev => ({ ...prev, [voiceField]: prev[voiceField] ? prev[voiceField] + ', ' + voiceTranscript : voiceTranscript }));
    showToast(`Added to ${voiceField}!`, 'success');
    setVoiceTranscript('');
  }

  function showToast(msg, type = 'success') { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); }

  // ── AI DIAGNOSIS ──
  async function runAIDiagnosis() {
    if (!form.symptoms?.trim()) { setAiError('Please enter symptoms first.'); return; }
    setAiLoading(true); setAiError(''); setAiResult(null);
    const vitalsInfo = [form.weight && `Weight: ${form.weight}kg`, form.temp && `Temp: ${form.temp}°F`, form.bp && `BP: ${form.bp}`, form.spo2 && `SpO2: ${form.spo2}%`, form.duration && `Illness duration: ${form.duration} ${form.duration_unit}`].filter(Boolean).join(', ');
    const prompt = `You are a clinical decision support assistant for ASHA (Accredited Social Health Activist) workers in rural India.
Patient: Age ${form.age || 'unknown'}, Gender ${form.gender || 'unknown'}${vitalsInfo ? `\nVitals: ${vitalsInfo}` : ''}
Symptoms: ${form.symptoms}
Respond ONLY with a valid JSON object, no markdown, no extra text:
{"conditions":[{"name":"Condition","likelihood":70}],"action":{"type":"treat","label":"Treat at home","summary":"One sentence for ASHA worker."},"medicines":["Paracetamol 500mg every 6 hrs"],"warning_signs":["High fever above 104F"],"diagnosis_text":"Short plain diagnosis, e.g. Likely viral fever — treat at home with paracetamol. Refer if fever persists 3 days."}
Rules: conditions 2-4 items likelihood<=100 total; action.type must be treat/refer/urgent; medicines OTC only; warning_signs 2-4 items.`;
    try {
      const res = await fetch('/api/diagnose', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }) });
      const data = await res.json();
      const raw = (data.content || []).map(b => b.text || '').join('');
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      setAiResult(parsed);
      if (parsed.diagnosis_text) setForm(prev => ({ ...prev, diagnosis: parsed.diagnosis_text }));
    } catch(e) { setAiError('AI analysis failed. Please fill diagnosis manually.'); }
    finally { setAiLoading(false); }
  }

  function resetAI() { setAiResult(null); setAiError(''); }

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.village.toLowerCase().includes(search.toLowerCase()) ||
    (p.symptoms || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: patients.length,
    female: patients.filter(p => p.gender === 'Female').length,
    male: patients.filter(p => p.gender === 'Male').length,
    villages: [...new Set(patients.map(p => p.village))].length,
  };

  const MicBtn = ({ field, isTextarea }) => !voiceSupported ? null : (
    <button type="button"
      className={`mic-btn${activeField === field && listening ? ' listening' : ''}${isTextarea ? ' ta' : ''}`}
      onClick={() => activeField === field && listening ? stopVoice() : startVoice(field)}
      title={t.tapToSpeak}>
      {activeField === field && listening ? '🔴' : '🎙'}
    </button>
  );

  const navItems = [
    { id: 'patients',      icon: '🩺', label: t.patients },
    { id: 'voice',         icon: '🎙', label: t.voiceInput, badge: 'NEW' },
    { id: 'reports',       icon: '📊', label: t.reports },
    { id: 'vaccinations',  icon: '💉', label: t.vaccinations },
    { id: 'reminders',     icon: '🔔', label: t.reminders },
    { id: 'settings',      icon: '⚙️', label: t.settings },
  ];

  return (
    <>
      <Head>
        <title>SwasthyaSathi · Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--g1:#0a4d2e;--g2:#1a7a4a;--g3:#2ecc71;--gpale:#d4f5e2;--gcards:#f0faf4;--saf:#e67e22;--safl:#fdecd2;--ink:#0d1f14;--muted:#5a7366;--border:#c8e6d4;--red:#e74c3c;}
        body{font-family:'DM Sans',sans-serif;background:#f4f9f6;color:var(--ink);}
        .shell{display:flex;flex-direction:column;min-height:100vh;}
        /* ── TOP NAVBAR ── */
        .topnav{background:var(--g1);color:white;position:sticky;top:0;z-index:80;}
        .topnav-inner{display:flex;align-items:center;padding:0 1.5rem;height:56px;gap:1rem;}
        .topnav-logo{font-family:'Sora',sans-serif;font-weight:800;font-size:1.1rem;white-space:nowrap;}
        .topnav-logo span{color:var(--g3);}
        .topnav-links{display:flex;align-items:center;gap:0.15rem;margin-left:1.5rem;flex:1;overflow-x:auto;}
        .topnav-link{display:flex;align-items:center;gap:0.45rem;padding:0.45rem 0.85rem;border-radius:8px;font-size:0.82rem;font-weight:500;color:rgba(255,255,255,0.6);cursor:pointer;transition:all .2s;text-decoration:none;border:none;background:none;white-space:nowrap;}
        .topnav-link:hover{background:rgba(255,255,255,0.09);color:white;}
        .topnav-link.active{background:var(--g2);color:white;font-weight:600;}
        .topnav-badge{background:rgba(46,204,113,0.25);color:var(--g3);font-size:0.55rem;font-weight:700;border-radius:4px;padding:0.1rem 0.35rem;margin-left:0.2rem;}
        .topnav-right{display:flex;align-items:center;gap:0.6rem;margin-left:auto;}
        .asha-chip{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:50px;padding:0.3rem 0.8rem;font-size:0.75rem;font-weight:600;white-space:nowrap;}
        .lang-select-nav{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:white;border-radius:8px;padding:0.35rem 0.5rem;font-size:0.78rem;font-family:'DM Sans',sans-serif;cursor:pointer;outline:none;}
        .lang-select-nav option{background:#0a4d2e;color:white;}
        .hamburger{display:none;background:none;border:none;color:white;font-size:1.5rem;cursor:pointer;padding:0.2rem;}
        .ham-dropdown{display:none;flex-direction:column;background:var(--g1);border-top:1px solid rgba(255,255,255,0.08);padding:0.5rem 0.8rem 0.8rem;gap:0.15rem;}
        .ham-dropdown.open{display:flex;}
        .ham-dropdown .topnav-link{width:100%;justify-content:flex-start;padding:0.6rem 0.9rem;font-size:0.88rem;}
        .ham-lang{padding:0.6rem 0.9rem;display:flex;flex-direction:column;gap:0.3rem;}
        .ham-lang label{font-size:0.65rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.06em;}
        .lang-select-ham{width:100%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:white;border-radius:8px;padding:0.5rem 0.6rem;font-size:0.83rem;font-family:'DM Sans',sans-serif;cursor:pointer;outline:none;}
        .lang-select-ham option{background:#0a4d2e;}
        @media(max-width:768px){.topnav-links{display:none;}.asha-chip{display:none;}.lang-select-nav{display:none;}.hamburger{display:block;}}

        .main{flex:1;display:flex;flex-direction:column;}
        .topbar{background:white;border-bottom:1px solid var(--border);padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:40;}
        .topbar h1{font-family:'Sora',sans-serif;font-weight:700;font-size:1.1rem;}
        .topbar-right{display:flex;align-items:center;gap:0.8rem;}
        .search-box{display:flex;align-items:center;gap:0.5rem;background:var(--gcards);border:1px solid var(--border);border-radius:50px;padding:0.45rem 1rem;}
        .search-box input{border:none;background:none;outline:none;font-size:0.85rem;width:180px;font-family:'DM Sans',sans-serif;}
        .btn-add{display:flex;align-items:center;gap:0.4rem;background:var(--g2);color:white;padding:0.55rem 1.1rem;border-radius:50px;border:none;cursor:pointer;font-weight:600;font-size:0.85rem;font-family:'DM Sans',sans-serif;transition:all .2s;}
        .btn-add:hover{background:var(--g1);}
        .btn-voice-top{display:flex;align-items:center;gap:0.4rem;background:var(--safl);color:var(--saf);padding:0.55rem 1rem;border-radius:50px;border:none;cursor:pointer;font-weight:600;font-size:0.85rem;font-family:'DM Sans',sans-serif;}
        .content{padding:2rem;flex:1;}

        .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:1.2rem;margin-bottom:2rem;}
        .stat-card{background:white;border-radius:16px;padding:1.3rem 1.4rem;border:1px solid var(--border);display:flex;align-items:center;gap:1rem;transition:all .2s;}
        .stat-card:hover{box-shadow:0 4px 20px #1a7a4a12;transform:translateY(-1px);}
        .stat-icon{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;}
        .si-g{background:var(--gpale);} .si-o{background:var(--safl);} .si-b{background:#e8f4fd;} .si-p{background:#fde8f0;}
        .stat-num{font-family:'Sora',sans-serif;font-weight:800;font-size:1.8rem;line-height:1;}
        .stat-label{font-size:0.76rem;color:var(--muted);margin-top:0.15rem;}

        .table-card{background:white;border-radius:16px;border:1px solid var(--border);overflow:hidden;}
        .table-head{padding:1.1rem 1.4rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
        .table-head h2{font-family:'Sora',sans-serif;font-weight:700;font-size:0.98rem;}
        .count-badge{background:var(--gpale);color:var(--g2);border-radius:50px;padding:0.2rem 0.7rem;font-size:0.73rem;font-weight:700;}
        table{width:100%;border-collapse:collapse;}
        thead tr{background:#f8fdf9;}
        th{padding:0.7rem 1.1rem;text-align:left;font-size:0.7rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border);}
        tbody tr{border-bottom:1px solid #f0f7f3;cursor:pointer;transition:background .15s;}
        tbody tr:hover{background:var(--gcards);}
        tbody tr:last-child{border-bottom:none;}
        td{padding:0.85rem 1.1rem;font-size:0.87rem;vertical-align:middle;}
        .name-cell{font-weight:600;}
        .village-cell{color:var(--muted);font-size:0.82rem;}
        .gender-badge{display:inline-block;border-radius:50px;padding:0.2rem 0.6rem;font-size:0.7rem;font-weight:600;}
        .gb-female{background:#fde8f0;color:#c0145a;} .gb-male{background:#e8f0fd;color:#144ec0;} .gb-other{background:var(--safl);color:var(--saf);}
        .symptom-cell{max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:0.8rem;}
        .date-cell{color:var(--muted);font-size:0.76rem;}
        .action-btn{background:none;border:none;cursor:pointer;padding:0.3rem 0.4rem;border-radius:6px;font-size:0.85rem;}
        .action-btn:hover{background:#fee;}
        .empty-state{text-align:center;padding:4rem 2rem;color:var(--muted);}
        .empty-state .emoji{font-size:3rem;margin-bottom:1rem;}

        .overlay{position:fixed;inset:0;background:rgba(10,30,20,0.5);z-index:100;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);animation:fadeIn .2s;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .modal{background:white;border-radius:24px;padding:2rem;width:100%;max-width:540px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.25);animation:slideUp .25s ease;}
        @keyframes slideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
        .modal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem;}
        .modal-header h2{font-family:'Sora',sans-serif;font-weight:700;font-size:1.05rem;}
        .close-btn{background:#f0f0f0;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;}

        .voice-banner{background:linear-gradient(135deg,var(--g1),var(--g2));border-radius:14px;padding:0.9rem 1.1rem;margin-bottom:1.2rem;display:flex;align-items:center;gap:0.8rem;}
        .vb-title{color:white;font-size:0.85rem;font-weight:600;margin-bottom:0.1rem;}
        .vb-sub{font-size:0.75rem;color:rgba(255,255,255,0.65);}
        .vb-badge{background:rgba(255,255,255,0.15);border-radius:8px;padding:0.3rem 0.7rem;font-size:0.82rem;color:white;font-weight:700;white-space:nowrap;}
        .wave{display:flex;align-items:center;gap:2px;}
        .wave .b{width:3px;background:var(--g3);border-radius:3px;animation:wv .8s ease-in-out infinite;}
        .wave .b:nth-child(1){height:6px} .wave .b:nth-child(2){height:14px;animation-delay:.1s} .wave .b:nth-child(3){height:10px;animation-delay:.2s} .wave .b:nth-child(4){height:18px;animation-delay:.3s} .wave .b:nth-child(5){height:8px;animation-delay:.4s}
        @keyframes wv{0%,100%{transform:scaleY(1)}50%{transform:scaleY(0.3)}}

        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
        .fg{display:flex;flex-direction:column;gap:0.35rem;}
        .fg.full{grid-column:1/-1;}
        label{font-size:0.75rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;}
        .req{color:var(--saf);}
        .iw{position:relative;}
        input,select,textarea{width:100%;padding:0.65rem 0.9rem;border:1.5px solid var(--border);border-radius:10px;font-size:0.88rem;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s;background:var(--gcards);color:var(--ink);}
        input:focus,select:focus,textarea:focus{border-color:var(--g2);background:white;}
        textarea{resize:vertical;min-height:72px;}
        .has-mic input,.has-mic textarea{padding-right:2.8rem;}
        .mic-btn{position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0.3rem;border-radius:8px;font-size:1rem;line-height:1;transition:all .2s;}
        .mic-btn.ta{top:0.65rem;transform:none;}
        .mic-btn:hover{background:var(--gpale);}
        .mic-btn.listening{background:var(--gpale);animation:mp 1s infinite;}
        @keyframes mp{0%,100%{box-shadow:0 0 0 0 rgba(46,204,113,0.4)}50%{box-shadow:0 0 0 8px rgba(46,204,113,0)}}
        .tc-box{background:var(--gpale);border-radius:8px;padding:0.4rem 0.8rem;font-size:0.78rem;color:var(--g1);margin-top:0.25rem;font-style:italic;}
        .btn-submit{width:100%;padding:0.85rem;border-radius:12px;background:var(--g2);color:white;border:none;font-weight:700;font-size:0.92rem;font-family:'DM Sans',sans-serif;cursor:pointer;margin-top:1rem;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:0.5rem;}
        .btn-submit:hover:not(:disabled){background:var(--g1);}
        .btn-submit:disabled{opacity:0.6;cursor:not-allowed;}

        /* SETTINGS */
        .settings-page{max-width:620px;}
        .settings-card{background:white;border-radius:20px;border:1px solid var(--border);padding:1.8rem;margin-bottom:1.5rem;}
        .settings-card-title{font-family:'Sora',sans-serif;font-weight:700;font-size:1rem;margin-bottom:0.3rem;display:flex;align-items:center;gap:0.5rem;}
        .settings-card-sub{font-size:0.82rem;color:var(--muted);margin-bottom:1.4rem;line-height:1.6;}
        .saved-indicator{display:inline-flex;align-items:center;gap:0.3rem;background:var(--gpale);color:var(--g2);border-radius:50px;padding:0.25rem 0.8rem;font-size:0.75rem;font-weight:700;margin-bottom:1rem;}
        .lang-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0.8rem;}
        .lang-card{background:var(--gcards);border:1.5px solid var(--border);border-radius:12px;padding:0.9rem 0.5rem;text-align:center;cursor:pointer;transition:all .2s;}
        .lang-card:hover{border-color:var(--g2);}
        .lang-card.active{background:var(--g2);border-color:var(--g2);color:white;}
        .lc-label{font-family:'Sora',sans-serif;font-size:0.95rem;font-weight:700;margin-bottom:0.2rem;}
        .lc-name{font-size:0.68rem;opacity:0.7;}

        /* VOICE PAGE */
        .voice-page{max-width:680px;}
        .vp-card{background:white;border-radius:20px;border:1px solid var(--border);padding:2rem;margin-bottom:1.5rem;}
        .vp-title{font-family:'Sora',sans-serif;font-weight:700;font-size:1rem;margin-bottom:0.3rem;display:flex;align-items:center;gap:0.5rem;}
        .vp-sub{font-size:0.82rem;color:var(--muted);margin-bottom:1.4rem;line-height:1.6;}
        .mic-big{width:96px;height:96px;border-radius:50%;background:var(--g2);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:2.5rem;transition:all .25s;margin:0 auto 1.2rem;box-shadow:0 8px 30px #1a7a4a30;}
        .mic-big:hover{background:var(--g1);transform:scale(1.05);}
        .mic-big.active{background:var(--red);animation:bigPulse 1s infinite;}
        @keyframes bigPulse{0%,100%{box-shadow:0 0 0 0 rgba(231,76,60,0.4)}50%{box-shadow:0 0 0 20px rgba(231,76,60,0)}}
        .mic-status{text-align:center;font-size:0.9rem;font-weight:600;color:var(--muted);margin-bottom:1rem;}
        .mic-status.active{color:var(--red);}
        .wave-big{display:flex;align-items:center;justify-content:center;gap:4px;height:50px;margin-bottom:1rem;}
        .wave-big .b{width:5px;background:var(--g2);border-radius:5px;animation:wv .7s ease-in-out infinite;}
        .wave-big .b:nth-child(1){height:10px} .wave-big .b:nth-child(2){height:24px;animation-delay:.08s} .wave-big .b:nth-child(3){height:18px;animation-delay:.16s} .wave-big .b:nth-child(4){height:36px;animation-delay:.24s} .wave-big .b:nth-child(5){height:28px;animation-delay:.32s} .wave-big .b:nth-child(6){height:20px;animation-delay:.4s} .wave-big .b:nth-child(7){height:14px;animation-delay:.48s}
        .transcript-area{background:var(--gcards);border:1.5px solid var(--border);border-radius:12px;padding:1rem;min-height:100px;font-size:0.92rem;line-height:1.7;color:var(--ink);margin-bottom:1rem;}
        .transcript-area.active{border-color:var(--g2);background:white;}
        .transcript-placeholder{color:var(--muted);font-style:italic;}
        .field-chips{display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:1rem;}
        .field-chip{padding:0.35rem 0.9rem;border-radius:50px;border:1.5px solid var(--border);background:white;font-size:0.8rem;font-weight:600;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;}
        .field-chip.active{background:var(--g2);color:white;border-color:var(--g2);}
        .vp-actions{display:flex;gap:0.8rem;}
        .btn-apply{flex:1;padding:0.75rem;border-radius:10px;background:var(--g2);color:white;border:none;font-weight:700;font-size:0.88rem;font-family:'DM Sans',sans-serif;cursor:pointer;}
        .btn-apply:disabled{opacity:0.5;cursor:not-allowed;}
        .btn-apply:hover:not(:disabled){background:var(--g1);}
        .btn-clear{padding:0.75rem 1.2rem;border-radius:10px;background:white;color:var(--muted);border:1.5px solid var(--border);font-weight:600;font-size:0.88rem;font-family:'DM Sans',sans-serif;cursor:pointer;}
        .btn-clear:hover{border-color:var(--red);color:var(--red);}

        /* AI DIAGNOSIS PANEL */
        .ai-btn{width:100%;padding:0.72rem;border-radius:10px;background:#1D9E75;color:white;border:none;font-weight:700;font-size:0.88rem;font-family:'DM Sans',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.5rem;transition:background .2s;margin-bottom:0.75rem;}
        .ai-btn:hover:not(:disabled){background:#0f6e56;}
        .ai-btn:disabled{background:#a8d5c2;cursor:not-allowed;}
        .ai-error{background:#FCEBEB;color:#791F1F;border-radius:8px;padding:0.5rem 0.9rem;font-size:0.78rem;margin-bottom:0.75rem;}
        .ai-panel{background:#f3faf5;border:1px solid #b8ddcc;border-radius:14px;padding:1rem 1.1rem;margin-bottom:0.75rem;display:flex;flex-direction:column;gap:0.9rem;}
        .ai-section-label{font-size:0.65rem;font-weight:700;color:#1D5C38;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:0.4rem;}
        .ai-action-row{display:flex;align-items:flex-start;gap:0.7rem;}
        .ai-badge{display:inline-flex;align-items:center;gap:5px;padding:0.3rem 0.75rem;border-radius:20px;font-size:0.72rem;font-weight:700;flex-shrink:0;}
        .ai-badge-dot{width:7px;height:7px;border-radius:50%;display:inline-block;}
        .ai-action-summary{font-size:0.78rem;color:#333;line-height:1.5;padding-top:3px;}
        .ai-cond-row{display:flex;align-items:center;gap:8px;margin-bottom:5px;}
        .ai-cond-name{font-size:0.78rem;color:#1a3a2a;width:150px;flex-shrink:0;}
        .ai-bar-bg{flex:1;height:5px;background:#d4e8d8;border-radius:4px;}
        .ai-bar-fill{height:100%;background:#1D9E75;border-radius:4px;}
        .ai-pct{font-size:0.7rem;color:#666;width:30px;text-align:right;flex-shrink:0;}
        .ai-chips{display:flex;flex-wrap:wrap;gap:5px;}
        .ai-chip-green{font-size:0.7rem;padding:3px 9px;background:#E1F5EE;color:#085041;border-radius:20px;}
        .ai-chip-red{font-size:0.7rem;padding:3px 9px;background:#FCEBEB;color:#791F1F;border-radius:20px;}
        .ai-disclaimer{font-size:0.67rem;color:#999;line-height:1.5;margin:0;}
        .ai-filled-note{font-size:0.65rem;color:#1D9E75;font-weight:600;margin-left:0.5rem;}
        .placeholder-page{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5rem 2rem;text-align:center;color:var(--muted);}
        .placeholder-page .big-icon{font-size:4rem;margin-bottom:1.2rem;}
        .placeholder-page h2{font-family:'Sora',sans-serif;font-weight:700;font-size:1.3rem;color:var(--ink);margin-bottom:0.5rem;}
        .placeholder-page p{font-size:0.9rem;line-height:1.7;max-width:380px;}
        .coming-soon{display:inline-block;background:var(--safl);color:var(--saf);border-radius:50px;padding:0.3rem 0.9rem;font-size:0.75rem;font-weight:700;margin-top:1rem;}

        .detail-modal{background:white;border-radius:24px;padding:2rem;width:100%;max-width:460px;box-shadow:0 20px 60px rgba(0,0,0,0.25);animation:slideUp .25s ease;}
        .detail-avatar{width:54px;height:54px;border-radius:50%;background:var(--gpale);display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:0.8rem;}
        .detail-name{font-family:'Sora',sans-serif;font-weight:800;font-size:1.25rem;margin-bottom:0.15rem;}
        .detail-meta{color:var(--muted);font-size:0.83rem;margin-bottom:1.3rem;}
        .dr{display:flex;flex-direction:column;gap:0.2rem;margin-bottom:0.9rem;}
        .dlabel{font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--muted);}
        .dval{font-size:0.9rem;color:var(--ink);background:var(--gcards);border-radius:8px;padding:0.45rem 0.8rem;}
        .dval.green{background:var(--gpale);color:var(--g1);}
        .btn-delete{width:100%;padding:0.72rem;border-radius:12px;background:#fff0f0;color:var(--red);border:1.5px solid #fdd;font-weight:700;font-size:0.86rem;font-family:'DM Sans',sans-serif;cursor:pointer;margin-top:0.8rem;}
        .btn-delete:hover{background:#fee;}

        .toast{position:fixed;bottom:2rem;right:2rem;z-index:200;padding:0.9rem 1.4rem;border-radius:14px;font-size:0.87rem;font-weight:600;box-shadow:0 8px 30px rgba(0,0,0,0.15);animation:toastIn .3s ease;display:flex;align-items:center;gap:0.5rem;}
        @keyframes toastIn{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        .toast.success{background:var(--g1);color:white;} .toast.error{background:var(--red);color:white;} .toast.info{background:var(--ink);color:white;}
        .spinner{width:18px;height:18px;border:2.5px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .skeleton{background:linear-gradient(90deg,#f0f7f3 25%,#e0f0e8 50%,#f0f7f3 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px;height:48px;}
        @keyframes shimmer{to{background-position:-200% 0;}}
        @media(max-width:900px){.stats-row{grid-template-columns:repeat(2,1fr);}.form-grid{grid-template-columns:1fr;}.lang-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:480px){.stats-row{grid-template-columns:1fr;}.topbar{padding:0.8rem 1rem;}.topbar h1{font-size:0.95rem;}.content{padding:1rem;}.search-box input{width:100px;}.btn-voice-top{display:none;}}
      `}</style>

      <div className="shell">
        {/* ── HORIZONTAL TOP NAVBAR ── */}
        <nav className="topnav">
          <div className="topnav-inner">
            <div className="topnav-logo">🌿 Swasthya<span>Sathi</span></div>
            <div className="topnav-links">
              <a href="/" className="topnav-link"><span>🏠</span> {t.home}</a>
              {navItems.map(n => (
                <button key={n.id} className={`topnav-link${page === n.id ? ' active' : ''}`} onClick={() => setPage(n.id)}>
                  <span>{n.icon}</span> {n.label}
                  {n.badge && <span className="topnav-badge">{n.badge}</span>}
                </button>
              ))}
            </div>
            <div className="topnav-right">
              {ashaForm.worker_name && <div className="asha-chip">👩‍⚕️ {ashaForm.worker_name}</div>}
              <select className="lang-select-nav" value={lang} onChange={e => setLang(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
              <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
                {sidebarOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
          <div className={`ham-dropdown${sidebarOpen ? ' open' : ''}`}>
            <a href="/" className="topnav-link" onClick={() => setSidebarOpen(false)}><span>🏠</span> {t.home}</a>
            {navItems.map(n => (
              <button key={n.id} className={`topnav-link${page === n.id ? ' active' : ''}`} onClick={() => { setPage(n.id); setSidebarOpen(false); }}>
                <span>{n.icon}</span> {n.label}
                {n.badge && <span className="topnav-badge">{n.badge}</span>}
              </button>
            ))}
            <div className="ham-lang">
              <label>🌐 भाषा</label>
              <select className="lang-select-ham" value={lang} onChange={e => setLang(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label} — {l.name}</option>)}
              </select>
            </div>
          </div>
        </nav>

        {/* ── MAIN ── */}
        <div className="main">
          <header className="topbar">
            <h1>
              {page === 'patients'     && t.patientRecords}
              {page === 'voice'        && `🎙 ${t.voiceInput}`}
              {page === 'reports'      && t.reports}
              {page === 'vaccinations' && t.vaccinations}
              {page === 'reminders'    && t.reminders}
              {page === 'settings'     && t.settings}
            </h1>
            <div className="topbar-right">
              {page === 'patients' && <>
                <div className="search-box"><span>🔍</span><input placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} /></div>
                <button className="btn-voice-top" onClick={() => setPage('voice')}>🎙 {t.voiceInput}</button>
                <button className="btn-add" onClick={() => setShowForm(true)}>+ {t.addPatient}</button>
              </>}
            </div>
          </header>

          <main className="content">

            {/* ══ PATIENTS ══ */}
            {page === 'patients' && <>
              <div className="stats-row">
                <div className="stat-card"><div className="stat-icon si-g">🧑‍⚕️</div><div><div className="stat-num">{stats.total}</div><div className="stat-label">{t.totalPatients}</div></div></div>
                <div className="stat-card"><div className="stat-icon si-p">👩</div><div><div className="stat-num">{stats.female}</div><div className="stat-label">{t.female}</div></div></div>
                <div className="stat-card"><div className="stat-icon si-b">👨</div><div><div className="stat-num">{stats.male}</div><div className="stat-label">{t.male}</div></div></div>
                <div className="stat-card"><div className="stat-icon si-o">🏘</div><div><div className="stat-num">{stats.villages}</div><div className="stat-label">{t.villages}</div></div></div>
              </div>
              <div className="table-card">
                <div className="table-head"><h2>{t.allPatients}</h2><span className="count-badge">{filtered.length} {t.records}</span></div>
                {fetching ? <div style={{padding:'1.5rem',display:'flex',flexDirection:'column',gap:'0.8rem'}}>{[1,2,3].map(i=><div key={i} className="skeleton"/>)}</div>
                : filtered.length === 0 ? <div className="empty-state"><div className="emoji">🏥</div><p>{t.noPatients}</p></div>
                : <table>
                    <thead><tr><th>{t.name}</th><th>{t.age}</th><th>{t.gender}</th><th>{t.village}</th><th>{t.symptoms}</th><th>Date</th><th></th></tr></thead>
                    <tbody>{filtered.map(p=>(
                      <tr key={p.id} onClick={()=>setSelected(p)}>
                        <td className="name-cell">{p.name}</td>
                        <td>{p.age} yrs</td>
                        <td><span className={`gender-badge gb-${p.gender.toLowerCase()}`}>{p.gender}</span></td>
                        <td className="village-cell">📍 {p.village}</td>
                        <td><div className="symptom-cell">{p.symptoms||'—'}</div></td>
                        <td className="date-cell">{new Date(p.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}</td>
                        <td><button className="action-btn" onClick={e=>{e.stopPropagation();handleDelete(p.id);}}>🗑</button></td>
                      </tr>
                    ))}</tbody>
                  </table>}
              </div>
            </>}

            {/* ══ VOICE PAGE ══ */}
            {page === 'voice' && (
              <div className="voice-page">
                <div className="vp-card">
                  <div className="vp-title">🌐 Select Language</div>
                  <div className="vp-sub">Choose the language you want to speak in.</div>
                  <div className="lang-grid">
                    {LANGUAGES.map(l=>(
                      <div key={l.code} className={`lang-card${lang===l.code?' active':''}`} onClick={()=>setLang(l.code)}>
                        <div className="lc-label">{l.label}</div><div className="lc-name">{l.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="vp-card">
                  <div className="vp-title">🎙 Voice Recorder</div>
                  <div className="vp-sub">Speaking in: <strong>{currentLang?.name}</strong> ({currentLang?.label}) · {!voiceSupported && '⚠ Use Chrome/Edge for voice'}</div>
                  <div style={{marginBottom:'0.8rem'}}>
                    <label style={{marginBottom:'0.5rem',display:'block'}}>Record into field:</label>
                    <div className="field-chips">
                      {['symptoms','diagnosis','name','village'].map(f=>(
                        <button key={f} className={`field-chip${voiceField===f?' active':''}`} onClick={()=>setVoiceField(f)}>
                          {f.charAt(0).toUpperCase()+f.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button className={`mic-big${listening?' active':''}`} onClick={()=>listening?stopVoicePage():startVoicePage()}>
                    {listening?'⏹':'🎙'}
                  </button>
                  <div className={`mic-status${listening?' active':''}`}>{listening?`🔴 ${t.listening}`:t.tapToSpeak}</div>
                  {listening&&<div className="wave-big">{[1,2,3,4,5,6,7].map(i=><div key={i} className="b"/>)}</div>}
                  <div className={`transcript-area${listening?' active':''}`}>
                    {voiceTranscript?voiceTranscript:<span className="transcript-placeholder">Your speech will appear here...</span>}
                  </div>
                  <div className="vp-actions">
                    <button className="btn-apply" onClick={applyVoiceToForm} disabled={!voiceTranscript}>✅ Add to {voiceField}</button>
                    <button className="btn-clear" onClick={()=>setVoiceTranscript('')}>🗑 Clear</button>
                  </div>
                </div>
                <div className="vp-card" style={{textAlign:'center'}}>
                  <div className="vp-title" style={{justifyContent:'center'}}>📋 Ready to Save?</div>
                  <p style={{fontSize:'0.85rem',color:'var(--muted)',marginBottom:'1.2rem',lineHeight:1.6}}>Voice data recorded. Open the patient form to complete and save.</p>
                  <button className="btn-add" style={{margin:'0 auto',borderRadius:'12px',padding:'0.8rem 2rem'}} onClick={()=>{setPage('patients');setShowForm(true);}}>🩺 Open Patient Form</button>
                </div>
              </div>
            )}

            {/* ══ SETTINGS ══ */}
            {page === 'settings' && (
              <div className="settings-page">

                {/* ASHA Worker Profile */}
                <div className="settings-card">
                  <div className="settings-card-title">👩‍⚕️ ASHA Worker Profile</div>
                  <div className="settings-card-sub">
                    Your profile is saved to the database and used for report generation.
                    {ashaId && <span style={{marginLeft:'0.5rem'}}>✅ Profile saved in database.</span>}
                  </div>
                  {ashaFetching ? (
                    <div style={{display:'flex',flexDirection:'column',gap:'0.8rem'}}>{[1,2,3].map(i=><div key={i} className="skeleton"/>)}</div>
                  ) : (
                    <form onSubmit={saveAshaWorker}>
                      <div className="form-grid">
                        <div className="fg full">
                          <label>Worker Name <span className="req">*</span></label>
                          <input value={ashaForm.worker_name} onChange={e=>setAshaForm(f=>({...f,worker_name:e.target.value}))} placeholder="Your full name" required />
                        </div>
                        <div className="fg">
                          <label>Worker ID</label>
                          <input value={ashaForm.worker_id} onChange={e=>setAshaForm(f=>({...f,worker_id:e.target.value}))} placeholder="ASHA-001" />
                        </div>
                        <div className="fg">
                          <label>Phone Number</label>
                          <input value={ashaForm.phone} onChange={e=>setAshaForm(f=>({...f,phone:e.target.value}))} placeholder="+91 98765 43210" />
                        </div>
                        <div className="fg full">
                          <label>PHC / Block Name</label>
                          <input value={ashaForm.phc_block} onChange={e=>setAshaForm(f=>({...f,phc_block:e.target.value}))} placeholder="Primary Health Centre name" />
                        </div>
                        <div className="fg">
                          <label>District</label>
                          <input value={ashaForm.district} onChange={e=>setAshaForm(f=>({...f,district:e.target.value}))} placeholder="e.g. Nagpur" />
                        </div>
                        <div className="fg">
                          <label>State</label>
                          <input value={ashaForm.state} onChange={e=>setAshaForm(f=>({...f,state:e.target.value}))} placeholder="e.g. Maharashtra" />
                        </div>
                      </div>
                      <button className="btn-submit" type="submit" disabled={ashaLoading}>
                        {ashaLoading ? <><span className="spinner"/> Saving...</> : ashaId ? '💾 Update Profile' : '💾 Save Profile'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Language Settings */}
                <div className="settings-card">
                  <div className="settings-card-title">🌐 Language / भाषा</div>
                  <div className="settings-card-sub">Select display and voice input language.</div>
                  <div className="lang-grid">
                    {LANGUAGES.map(l=>(
                      <div key={l.code} className={`lang-card${lang===l.code?' active':''}`} onClick={()=>setLang(l.code)}>
                        <div className="lc-label">{l.label}</div><div className="lc-name">{l.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ PLACEHOLDER PAGES ══ */}
            {page === 'reports' && <div className="placeholder-page"><div className="big-icon">📊</div><h2>{t.reports}</h2><p>Monthly health reports and government-format summaries will be auto-generated here.</p><span className="coming-soon">Coming Soon</span></div>}
            {page === 'vaccinations' && <div className="placeholder-page"><div className="big-icon">💉</div><h2>{t.vaccinations}</h2><p>Track immunisation schedules and upcoming due dates for children and pregnant women.</p><span className="coming-soon">Coming Soon</span></div>}
            {page === 'reminders' && <div className="placeholder-page"><div className="big-icon">🔔</div><h2>{t.reminders}</h2><p>Smart reminders for follow-up visits, antenatal care, and vaccination due dates.</p><span className="coming-soon">Coming Soon</span></div>}

          </main>
        </div>
      </div>

      {/* ── ADD PATIENT MODAL ── */}
      {showForm && (
        <div className="overlay" onClick={()=>{setShowForm(false);stopVoice();resetAI();}}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2>🩺 {t.newRecord}</h2>
              <button className="close-btn" onClick={()=>{setShowForm(false);stopVoice();resetAI();}}>✕</button>
            </div>
            <div className="voice-banner">
              <span style={{fontSize:'1.4rem'}}>🎙</span>
              <div style={{flex:1}}><div className="vb-title">{listening?t.listening:t.voiceHint}</div><div className="vb-sub">{currentLang?.label} · {currentLang?.name}</div></div>
              {listening&&<div className="wave"><div className="b"/><div className="b"/><div className="b"/><div className="b"/><div className="b"/></div>}
              <span className="vb-badge">{currentLang?.label}</span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="fg full"><label>{t.name} <span className="req">*</span></label><div className="iw has-mic"><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Meena Devi" required/><MicBtn field="name"/></div>{activeField==='name'&&transcript&&<div className="tc-box">🎙 {transcript}</div>}</div>
                <div className="fg"><label>{t.age} <span className="req">*</span></label><input type="number" min="1" max="120" value={form.age} onChange={e=>setForm(f=>({...f,age:e.target.value}))} placeholder="34" required/></div>
                <div className="fg"><label>{t.gender} <span className="req">*</span></label><select value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))}>{GENDERS.map(g=><option key={g}>{g}</option>)}</select></div>
                <div className="fg full"><label>{t.village} <span className="req">*</span></label><div className="iw has-mic"><input value={form.village} onChange={e=>setForm(f=>({...f,village:e.target.value}))} placeholder="e.g. Rampur, UP" required/><MicBtn field="village"/></div>{activeField==='village'&&transcript&&<div className="tc-box">🎙 {transcript}</div>}</div>

                {/* ── VITALS SECTION ── */}
                <div className="fg full" style={{gridColumn:'1/-1',marginTop:'0.5rem'}}>
                  <label style={{fontSize:'0.7rem',fontWeight:700,color:'var(--g2)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'0.3rem'}}>⚕️ Vitals (optional)</label>
                </div>
                <div className="fg"><label>{t.weight || 'Weight (kg)'}</label><input type="number" step="0.1" min="0" max="300" value={form.weight} onChange={e=>setForm(f=>({...f,weight:e.target.value}))} placeholder="e.g. 55"/></div>
                <div className="fg"><label>{t.temp || 'Temp (°F)'}</label><input type="number" step="0.1" min="90" max="110" value={form.temp} onChange={e=>setForm(f=>({...f,temp:e.target.value}))} placeholder="e.g. 101.2"/></div>
                <div className="fg"><label>{t.bp || 'BP (mmHg)'}</label><input value={form.bp} onChange={e=>setForm(f=>({...f,bp:e.target.value}))} placeholder="e.g. 120/80"/></div>
                <div className="fg"><label>{t.spo2 || 'SpO₂ (%)'}</label><input type="number" min="0" max="100" value={form.spo2} onChange={e=>setForm(f=>({...f,spo2:e.target.value}))} placeholder="e.g. 97"/></div>
                <div className="fg"><label>{t.durationLabel || 'Duration of Illness'}</label><input type="number" min="0" value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} placeholder="e.g. 3"/></div>
                <div className="fg"><label>&nbsp;</label><select value={form.duration_unit} onChange={e=>setForm(f=>({...f,duration_unit:e.target.value}))}><option value="hours">{t.hours || 'hours'}</option><option value="days">{t.days || 'days'}</option><option value="weeks">{t.weeks || 'weeks'}</option></select></div>

                <div className="fg full"><label>{t.symptoms}</label><div className="iw has-mic"><textarea value={form.symptoms} onChange={e=>{setForm(f=>({...f,symptoms:e.target.value}));resetAI();}} placeholder="e.g. बुखार, सिरदर्द / Fever, Headache"/><MicBtn field="symptoms" isTextarea/></div>{activeField==='symptoms'&&transcript&&<div className="tc-box">🎙 {transcript}</div>}</div>

                {/* ── AI DIAGNOSIS PANEL ── */}
                <div className="fg full">
                  <button type="button" className="ai-btn" onClick={runAIDiagnosis} disabled={aiLoading}>
                    {aiLoading ? <><span className="spinner"/>Analysing symptoms...</> : '✦  AI Symptom Analysis'}
                  </button>
                  {aiError && <div className="ai-error">{aiError}</div>}
                  {aiResult && (
                    <div className="ai-panel">
                      {aiResult.action && (()=>{
                        const ac={urgent:{bg:'#FCEBEB',color:'#791F1F',dot:'#E24B4A'},refer:{bg:'#FFF3CD',color:'#633806',dot:'#EF9F27'},treat:{bg:'#EAF3DE',color:'#1D5C38',dot:'#639922'}};
                        const s=ac[aiResult.action.type]||ac.treat;
                        return(<div><div className="ai-section-label">Recommended Action</div><div className="ai-action-row"><span className="ai-badge" style={{background:s.bg,color:s.color}}><span className="ai-badge-dot" style={{background:s.dot}}/>{aiResult.action.label}</span><span className="ai-action-summary">{aiResult.action.summary}</span></div></div>);
                      })()}
                      {aiResult.conditions?.length>0&&(
                        <div><div className="ai-section-label">Possible Conditions</div>
                          {aiResult.conditions.map((c,i)=>(
                            <div key={i} className="ai-cond-row"><span className="ai-cond-name">{c.name}</span><div className="ai-bar-bg"><div className="ai-bar-fill" style={{width:`${c.likelihood}%`}}/></div><span className="ai-pct">{c.likelihood}%</span></div>
                          ))}
                        </div>
                      )}
                      {aiResult.medicines?.length>0&&(
                        <div><div className="ai-section-label">Suggested Medicines</div><div className="ai-chips">{aiResult.medicines.map((m,i)=><span key={i} className="ai-chip-green">{m}</span>)}</div></div>
                      )}
                      {aiResult.warning_signs?.length>0&&(
                        <div><div className="ai-section-label">Escalate to Doctor If</div><div className="ai-chips">{aiResult.warning_signs.map((s,i)=><span key={i} className="ai-chip-red">{s}</span>)}</div></div>
                      )}
                      <p className="ai-disclaimer">AI output is a clinical aid only. Always use your judgment. Refer when in doubt.</p>
                    </div>
                  )}
                </div>

                <div className="fg full">
                  <label>{t.diagnosis}{aiResult&&<span className="ai-filled-note">✦ AI filled · you can edit</span>}</label>
                  <div className="iw has-mic"><textarea value={form.diagnosis} onChange={e=>setForm(f=>({...f,diagnosis:e.target.value}))} placeholder="e.g. Viral Fever — refer PHC"/><MicBtn field="diagnosis" isTextarea/></div>
                  {activeField==='diagnosis'&&transcript&&<div className="tc-box">🎙 {transcript}</div>}
                </div>
              </div>
              <button className="btn-submit" type="submit" disabled={loading}>{loading?<><span className="spinner"/> Saving...</>:`✅ ${t.save}`}</button>
            </form>
          </div>
        </div>
      )}

      {/* ── DETAIL PANEL ── */}
      {selected && (
        <div className="overlay" onClick={()=>setSelected(null)}>
          <div className="detail-modal" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div className="detail-avatar">{selected.gender==='Female'?'👩':selected.gender==='Male'?'👨':'🧑'}</div>
              <button className="close-btn" onClick={()=>setSelected(null)}>✕</button>
            </div>
            <div className="detail-name">{selected.name}</div>
            <div className="detail-meta">{selected.age} yrs · {selected.gender} · 📍 {selected.village}</div>
            {(selected.weight || selected.temp || selected.bp || selected.spo2) && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(100px,1fr))',gap:'0.5rem',marginBottom:'1rem'}}>
                {selected.weight && <div className="dr"><div className="dlabel">Weight</div><div className="dval">{selected.weight} kg</div></div>}
                {selected.temp && <div className="dr"><div className="dlabel">Temp</div><div className="dval">{selected.temp} °F</div></div>}
                {selected.bp && <div className="dr"><div className="dlabel">BP</div><div className="dval">{selected.bp}</div></div>}
                {selected.spo2 && <div className="dr"><div className="dlabel">SpO₂</div><div className="dval">{selected.spo2}%</div></div>}
              </div>
            )}
            {selected.duration && <div className="dr"><div className="dlabel">Duration</div><div className="dval">{selected.duration} {selected.duration_unit || 'days'}</div></div>}
            <div className="dr"><div className="dlabel">{t.symptoms}</div><div className="dval">{selected.symptoms||'—'}</div></div>
            <div className="dr"><div className="dlabel">{t.diagnosis}</div><div className="dval green">{selected.diagnosis||'Pending'}</div></div>
            <div className="dr"><div className="dlabel">Date</div><div className="dval">{new Date(selected.created_at).toLocaleString('en-IN')}</div></div>
            <button className="btn-delete" onClick={()=>handleDelete(selected.id)}>🗑 Delete Record</button>
          </div>
        </div>
      )}

      {toast&&<div className={`toast ${toast.type}`}>{toast.type==='success'?'✅':toast.type==='error'?'❌':'ℹ️'} {toast.msg}</div>}
    </>
  );
}