import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

const GENDERS = ['Female', 'Male', 'Other'];
const EMPTY_FORM = { name: '', age: '', gender: 'Female', symptoms: '', diagnosis: '', village: '' };

const LANGUAGES = [
  { code: 'hi-IN', label: 'हिन्दी', name: 'Hindi', flag: '🇮🇳' },
  { code: 'mr-IN', label: 'मराठी', name: 'Marathi', flag: '🇮🇳' },
  { code: 'en-IN', label: 'English', name: 'English', flag: '🇬🇧' },
  { code: 'bn-IN', label: 'বাংলা', name: 'Bengali', flag: '🇮🇳' },
  { code: 'te-IN', label: 'తెలుగు', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ta-IN', label: 'தமிழ்', name: 'Tamil', flag: '🇮🇳' },
  { code: 'gu-IN', label: 'ગુજરાતી', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ', name: 'Kannada', flag: '🇮🇳' },
];

const T = {
  'hi-IN': { addPatient:'मरीज़ जोड़ें', search:'मरीज़, गाँव खोजें...', patientRecords:'मरीज़ों के रिकॉर्ड', name:'नाम', age:'उम्र', gender:'लिंग', village:'गाँव', symptoms:'लक्षण', diagnosis:'निदान', save:'रिकॉर्ड सेव करें', listening:'सुन रहे हैं...', tapToSpeak:'बोलने के लिए दबाएं', totalPatients:'कुल मरीज़', female:'महिला', male:'पुरुष', villages:'गाँव', allPatients:'सभी मरीज़', records:'रिकॉर्ड', noPatients:'अभी कोई मरीज़ नहीं।', saved:'रिकॉर्ड सफलतापूर्वक सेव हुआ!', deleted:'रिकॉर्ड हटाया गया', fillFields:'कृपया सभी ज़रूरी फ़ील्ड भरें', newRecord:'नया मरीज़ रिकॉर्ड', voiceHint:'माइक दबाएं और बोलें', home:'होम', reports:'रिपोर्ट', vaccinations:'टीकाकरण', reminders:'अनुस्मारक', settings:'सेटिंग्स', patients:'मरीज़', voiceInput:'आवाज़ से दर्ज करें' },
  'mr-IN': { addPatient:'रुग्ण जोडा', search:'रुग्ण, गाव शोधा...', patientRecords:'रुग्णांचे रेकॉर्ड', name:'नाव', age:'वय', gender:'लिंग', village:'गाव', symptoms:'लक्षणे', diagnosis:'निदान', save:'रेकॉर्ड जतन करा', listening:'ऐकत आहे...', tapToSpeak:'बोलण्यासाठी दाबा', totalPatients:'एकूण रुग्ण', female:'महिला', male:'पुरुष', villages:'गावे', allPatients:'सर्व रुग्ण', records:'नोंदी', noPatients:'अद्याप कोणतेही रुग्ण नाहीत.', saved:'रेकॉर्ड यशस्वीरित्या जतन झाला!', deleted:'रेकॉर्ड हटवला', fillFields:'कृपया सर्व आवश्यक फील्ड भरा', newRecord:'नवीन रुग्ण नोंद', voiceHint:'माइक दाबा आणि बोला', home:'होम', reports:'अहवाल', vaccinations:'लसीकरण', reminders:'स्मरणपत्रे', settings:'सेटिंग्ज', patients:'रुग्ण', voiceInput:'आवाजाने नोंद करा' },
  'en-IN': { addPatient:'Add Patient', search:'Search patients, village...', patientRecords:'Patient Records', name:'Name', age:'Age', gender:'Gender', village:'Village', symptoms:'Symptoms', diagnosis:'Diagnosis', save:'Save Patient Record', listening:'Listening...', tapToSpeak:'Tap to speak', totalPatients:'Total Patients', female:'Female', male:'Male', villages:'Villages', allPatients:'All Patients', records:'records', noPatients:'No patients yet. Add your first record!', saved:'Patient saved successfully!', deleted:'Record deleted', fillFields:'Please fill all required fields', newRecord:'New Patient Record', voiceHint:'Press mic and speak', home:'Home', reports:'Reports', vaccinations:'Vaccinations', reminders:'Reminders', settings:'Settings', patients:'Patients', voiceInput:'Voice Entry' },
  'bn-IN': { addPatient:'রোগী যোগ করুন', search:'রোগী, গ্রাম খুঁজুন...', patientRecords:'রোগীর রেকর্ড', name:'নাম', age:'বয়স', gender:'লিঙ্গ', village:'গ্রাম', symptoms:'উপসর্গ', diagnosis:'রোগ নির্ণয়', save:'রেকর্ড সেভ করুন', listening:'শুনছি...', tapToSpeak:'বলতে চাপুন', totalPatients:'মোট রোগী', female:'মহিলা', male:'পুরুষ', villages:'গ্রাম', allPatients:'সকল রোগী', records:'রেকর্ড', noPatients:'এখনো কোনো রোগী নেই।', saved:'রেকর্ড সফলভাবে সেভ হয়েছে!', deleted:'রেকর্ড মুছে ফেলা হয়েছে', fillFields:'সকল প্রয়োজনীয় তথ্য পূরণ করুন', newRecord:'নতুন রোগীর রেকর্ড', voiceHint:'মাইক চাপুন এবং বলুন', home:'হোম', reports:'রিপোর্ট', vaccinations:'টিকা', reminders:'অনুস্মারক', settings:'সেটিংস', patients:'রোগী', voiceInput:'ভয়েস এন্ট্রি' },
  'te-IN': { addPatient:'రోగిని జోడించు', search:'రోగి, గ్రామం వెతకండి...', patientRecords:'రోగుల రికార్డులు', name:'పేరు', age:'వయసు', gender:'లింగం', village:'గ్రామం', symptoms:'లక్షణాలు', diagnosis:'నిర్ధారణ', save:'రికార్డు సేవ్ చేయి', listening:'వింటున్నాను...', tapToSpeak:'నొక్కండి', totalPatients:'మొత్తం రోగులు', female:'స్త్రీ', male:'పురుషుడు', villages:'గ్రామాలు', allPatients:'అందరు రోగులు', records:'రికార్డులు', noPatients:'ఇంకా రోగులు లేరు.', saved:'రికార్డు సేవ్ అయింది!', deleted:'రికార్డు తొలగించబడింది', fillFields:'అన్ని ఫీల్డ్‌లు పూరించండి', newRecord:'కొత్త రోగి రికార్డు', voiceHint:'మైక్ నొక్కి చెప్పండి', home:'హోమ్', reports:'నివేదికలు', vaccinations:'వ్యాక్సినేషన్', reminders:'రిమైండర్లు', settings:'సెట్టింగ్లు', patients:'రోగులు', voiceInput:'వాయిస్ ఎంట్రీ' },
  'ta-IN': { addPatient:'நோயாளியை சேர்க்கவும்', search:'நோயாளி, கிராமம் தேடுங்கள்...', patientRecords:'நோயாளி பதிவுகள்', name:'பெயர்', age:'வயது', gender:'பாலினம்', village:'கிராமம்', symptoms:'அறிகுறிகள்', diagnosis:'நோய் கண்டறிதல்', save:'பதிவை சேமிக்கவும்', listening:'கேட்கிறேன்...', tapToSpeak:'அழுத்தவும்', totalPatients:'மொத்த நோயாளிகள்', female:'பெண்', male:'ஆண்', villages:'கிராமங்கள்', allPatients:'அனைத்து நோயாளிகள்', records:'பதிவுகள்', noPatients:'இன்னும் நோயாளிகள் இல்லை.', saved:'பதிவு சேமிக்கப்பட்டது!', deleted:'பதிவு நீக்கப்பட்டது', fillFields:'அனைத்து புலங்களையும் நிரப்பவும்', newRecord:'புதிய நோயாளி பதிவு', voiceHint:'மைக்கை அழுத்தி பேசுங்கள்', home:'முகப்பு', reports:'அறிக்கைகள்', vaccinations:'தடுப்பூசி', reminders:'நினைவூட்டல்கள்', settings:'அமைப்புகள்', patients:'நோயாளிகள்', voiceInput:'குரல் உள்ளீடு' },
  'gu-IN': { addPatient:'દર્દી ઉમેરો', search:'દર્દી, ગામ શોધો...', patientRecords:'દર્દીઓના રેકોર્ડ', name:'નામ', age:'ઉંમર', gender:'જાતિ', village:'ગામ', symptoms:'લક્ષણો', diagnosis:'નિદાન', save:'રેકોર્ડ સેવ કરો', listening:'સાંભળી રહ્યા...', tapToSpeak:'દબાવો', totalPatients:'કુલ દર્દીઓ', female:'સ્ત્રી', male:'પુરુષ', villages:'ગામો', allPatients:'તમામ દર્દીઓ', records:'રેકોર્ડ', noPatients:'હજુ કોઈ દર્દી નથી.', saved:'રેકોર્ડ સેવ થયો!', deleted:'રેકોર્ડ કાઢ્યો', fillFields:'બધા ફીલ્ડ ભરો', newRecord:'નવો દર્દી રેકોર્ડ', voiceHint:'માઇક દબાવો અને બોલો', home:'હોમ', reports:'રિપોર્ટ', vaccinations:'રસીકરણ', reminders:'રિમાઇન્ડર', settings:'સેટિંગ', patients:'દર્દીઓ', voiceInput:'અવાજ નોંધ' },
  'kn-IN': { addPatient:'ರೋಗಿಯನ್ನು ಸೇರಿಸಿ', search:'ರೋಗಿ, ಗ್ರಾಮ ಹುಡುಕಿ...', patientRecords:'ರೋಗಿಗಳ ದಾಖಲೆಗಳು', name:'ಹೆಸರು', age:'ವಯಸ್ಸು', gender:'ಲಿಂಗ', village:'ಗ್ರಾಮ', symptoms:'ರೋಗಲಕ್ಷಣಗಳು', diagnosis:'ರೋಗನಿರ್ಣಯ', save:'ದಾಖಲೆ ಉಳಿಸಿ', listening:'ಕೇಳುತ್ತಿದ್ದೇನೆ...', tapToSpeak:'ಒತ್ತಿರಿ', totalPatients:'ಒಟ್ಟು ರೋಗಿಗಳು', female:'ಮಹಿಳೆ', male:'ಪುರುಷ', villages:'ಗ್ರಾಮಗಳು', allPatients:'ಎಲ್ಲಾ ರೋಗಿಗಳು', records:'ದಾಖಲೆಗಳು', noPatients:'ಇನ್ನೂ ರೋಗಿಗಳಿಲ್ಲ.', saved:'ದಾಖಲೆ ಉಳಿಸಲಾಗಿದೆ!', deleted:'ದಾಖಲೆ ಅಳಿಸಲಾಗಿದೆ', fillFields:'ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ತುಂಬಿಸಿ', newRecord:'ಹೊಸ ರೋಗಿ ದಾಖಲೆ', voiceHint:'ಮೈಕ್ ಒತ್ತಿ ಹೇಳಿ', home:'ಮನೆ', reports:'ವರದಿಗಳು', vaccinations:'ಲಸಿಕೆ', reminders:'ರಿಮೈಂಡರ್', settings:'ಸೆಟ್ಟಿಂಗ್ಸ್', patients:'ರೋಗಿಗಳು', voiceInput:'ಧ್ವನಿ ನಮೂದು' },
};

const PAGES = ['patients', 'voice', 'reports', 'vaccinations', 'reminders', 'settings'];

export default function Dashboard() {
  const [patients, setPatients]       = useState([]);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [loading, setLoading]         = useState(false);
  const [fetching, setFetching]       = useState(true);
  const [toast, setToast]             = useState(null);
  const [search, setSearch]           = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [selected, setSelected]       = useState(null);
  const [lang, setLang]               = useState('hi-IN');
  const [page, setPage]               = useState('patients');
  const [listening, setListening]     = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [transcript, setTranscript]   = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceField, setVoiceField]   = useState('symptoms');
  const [voiceResult, setVoiceResult] = useState('');
  const recognitionRef = useRef(null);
  const t = T[lang] || T['en-IN'];
  const currentLang = LANGUAGES.find(l => l.code === lang);

  useEffect(() => {
    loadPatients();
    if (typeof window !== 'undefined') {
      setVoiceSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
    }
  }, []);

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
    const { data, error } = await supabase.from('patients').insert([{ ...form, age: Number(form.age) }]).select().single();
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

  function showToast(msg, type = 'success') { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); }

  function startVoice(fieldName, onResult) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast('Use Chrome or Edge for voice input', 'error'); return; }
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
      if (final && onResult) onResult(final);
      if (final) setForm(prev => ({ ...prev, [fieldName]: prev[fieldName] ? prev[fieldName] + ', ' + final : final }));
    };
    r.onerror = (e) => { setListening(false); setActiveField(null); if (e.error !== 'aborted') showToast('Voice: ' + e.error, 'error'); };
    r.onend = () => { setListening(false); setActiveField(null); setTranscript(''); };
    recognitionRef.current = r;
    r.start();
  }

  function stopVoice() { if (recognitionRef.current) recognitionRef.current.stop(); setListening(false); setActiveField(null); }

  // Voice page dedicated recorder
  function startVoicePage() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast('Use Chrome or Edge', 'error'); return; }
    if (recognitionRef.current) recognitionRef.current.stop();
    const r = new SR();
    r.lang = lang; r.continuous = true; r.interimResults = true;
    r.onstart = () => { setListening(true); setTranscript(''); };
    r.onresult = (e) => {
      let full = '';
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript + ' ';
      setTranscript(full.trim());
    };
    r.onerror = (e) => { setListening(false); if (e.error !== 'aborted') showToast('Error: ' + e.error, 'error'); };
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
  }

  function stopVoicePage() { if (recognitionRef.current) recognitionRef.current.stop(); setListening(false); }

  function applyVoiceToForm() {
    if (!transcript) return;
    setForm(prev => ({ ...prev, [voiceField]: prev[voiceField] ? prev[voiceField] + ', ' + transcript : transcript }));
    setVoiceResult(transcript);
    setTranscript('');
    showToast('Added to ' + voiceField + ' field!', 'success');
  }

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
    { id: 'patients', icon: '🩺', label: t.patients },
    { id: 'voice',    icon: '🎙', label: t.voiceInput },
    { id: 'reports',  icon: '📊', label: t.reports },
    { id: 'vaccinations', icon: '💉', label: t.vaccinations },
    { id: 'reminders', icon: '🔔', label: t.reminders },
    { id: 'settings', icon: '⚙️', label: t.settings },
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
        .shell{display:flex;min-height:100vh;}

        /* SIDEBAR */
        .sidebar{width:240px;flex-shrink:0;background:var(--g1);color:white;display:flex;flex-direction:column;padding:0;position:fixed;top:0;left:0;bottom:0;z-index:50;overflow-y:auto;}
        .sb-logo{font-family:'Sora',sans-serif;font-weight:800;font-size:1.15rem;padding:1.4rem 1.2rem 1rem;border-bottom:1px solid rgba(255,255,255,0.1);}
        .sb-logo span{color:var(--g3);}
        .lang-section{padding:0.8rem 1rem;border-bottom:1px solid rgba(255,255,255,0.08);}
        .lang-section label{font-size:0.63rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.07em;display:block;margin-bottom:0.35rem;}
        .lang-select{width:100%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:white;border-radius:8px;padding:0.5rem 0.6rem;font-size:0.83rem;font-family:'DM Sans',sans-serif;cursor:pointer;outline:none;appearance:none;}
        .lang-select option{background:#0a4d2e;}
        .sb-nav{display:flex;flex-direction:column;gap:0.2rem;padding:0.8rem 0.7rem;flex:1;}
        .sb-link{display:flex;align-items:center;gap:0.75rem;padding:0.7rem 0.9rem;border-radius:10px;font-size:0.88rem;font-weight:500;color:rgba(255,255,255,0.6);cursor:pointer;transition:all .2s;text-decoration:none;border:none;background:none;width:100%;text-align:left;}
        .sb-link:hover{background:rgba(255,255,255,0.09);color:white;}
        .sb-link.active{background:var(--g2);color:white;font-weight:600;}
        .sb-link .sb-icon{font-size:1rem;width:22px;text-align:center;flex-shrink:0;}
        .sb-voice-badge{background:rgba(46,204,113,0.2);color:var(--g3);font-size:0.6rem;font-weight:700;border-radius:4px;padding:0.1rem 0.4rem;margin-left:auto;}
        .sb-footer{font-size:0.7rem;color:rgba(255,255,255,0.3);padding:1rem 1.2rem;border-top:1px solid rgba(255,255,255,0.08);}

        /* MAIN */
        .main{margin-left:240px;flex:1;display:flex;flex-direction:column;min-height:100vh;}
        .topbar{background:white;border-bottom:1px solid var(--border);padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:40;}
        .topbar h1{font-family:'Sora',sans-serif;font-weight:700;font-size:1.1rem;}
        .topbar-right{display:flex;align-items:center;gap:0.8rem;}
        .search-box{display:flex;align-items:center;gap:0.5rem;background:var(--gcards);border:1px solid var(--border);border-radius:50px;padding:0.45rem 1rem;}
        .search-box input{border:none;background:none;outline:none;font-size:0.85rem;width:180px;font-family:'DM Sans',sans-serif;}
        .btn-add{display:flex;align-items:center;gap:0.4rem;background:var(--g2);color:white;padding:0.55rem 1.1rem;border-radius:50px;border:none;cursor:pointer;font-weight:600;font-size:0.85rem;font-family:'DM Sans',sans-serif;transition:all .2s;}
        .btn-add:hover{background:var(--g1);}
        .btn-voice-entry{display:flex;align-items:center;gap:0.4rem;background:var(--safl);color:var(--saf);padding:0.55rem 1rem;border-radius:50px;border:none;cursor:pointer;font-weight:600;font-size:0.85rem;font-family:'DM Sans',sans-serif;transition:all .2s;}
        .btn-voice-entry:hover{background:#f5d9b0;}
        .content{padding:2rem;flex:1;}

        /* STATS */
        .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:1.2rem;margin-bottom:2rem;}
        .stat-card{background:white;border-radius:16px;padding:1.3rem 1.4rem;border:1px solid var(--border);display:flex;align-items:center;gap:1rem;transition:all .2s;cursor:default;}
        .stat-card:hover{box-shadow:0 4px 20px #1a7a4a12;transform:translateY(-1px);}
        .stat-icon{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;}
        .si-green{background:var(--gpale);} .si-orange{background:var(--safl);} .si-blue{background:#e8f4fd;} .si-pink{background:#fde8f0;}
        .stat-num{font-family:'Sora',sans-serif;font-weight:800;font-size:1.8rem;line-height:1;}
        .stat-label{font-size:0.76rem;color:var(--muted);margin-top:0.15rem;}

        /* TABLE */
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

        /* MODAL */
        .overlay{position:fixed;inset:0;background:rgba(10,30,20,0.5);z-index:100;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);animation:fadeIn .2s;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .modal{background:white;border-radius:24px;padding:2rem;width:100%;max-width:540px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.25);animation:slideUp .25s ease;}
        @keyframes slideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
        .modal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem;}
        .modal-header h2{font-family:'Sora',sans-serif;font-weight:700;font-size:1.05rem;}
        .close-btn{background:#f0f0f0;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;}
        .close-btn:hover{background:#e0e0e0;}

        /* VOICE BANNER IN FORM */
        .voice-banner{background:linear-gradient(135deg,var(--g1),var(--g2));border-radius:14px;padding:0.9rem 1.1rem;margin-bottom:1.2rem;display:flex;align-items:center;gap:0.8rem;}
        .vb-right{flex:1;}
        .vb-title{color:white;font-size:0.85rem;font-weight:600;margin-bottom:0.1rem;}
        .vb-sub{font-size:0.75rem;color:rgba(255,255,255,0.65);}
        .vb-badge{background:rgba(255,255,255,0.15);border-radius:8px;padding:0.3rem 0.7rem;font-size:0.82rem;color:white;font-weight:700;white-space:nowrap;}
        .wave{display:flex;align-items:center;gap:2px;}
        .wave .b{width:3px;background:var(--g3);border-radius:3px;animation:wv .8s ease-in-out infinite;}
        .wave .b:nth-child(1){height:6px;animation-delay:0s} .wave .b:nth-child(2){height:14px;animation-delay:.1s} .wave .b:nth-child(3){height:10px;animation-delay:.2s} .wave .b:nth-child(4){height:18px;animation-delay:.3s} .wave .b:nth-child(5){height:8px;animation-delay:.4s}
        @keyframes wv{0%,100%{transform:scaleY(1)}50%{transform:scaleY(0.3)}}

        /* FORM */
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
        .mic-btn{position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0.3rem;border-radius:8px;font-size:1rem;transition:all .2s;line-height:1;}
        .mic-btn.ta{top:0.65rem;transform:none;}
        .mic-btn:hover{background:var(--gpale);}
        .mic-btn.listening{background:var(--gpale);animation:mp 1s infinite;}
        @keyframes mp{0%,100%{box-shadow:0 0 0 0 rgba(46,204,113,0.4)}50%{box-shadow:0 0 0 8px rgba(46,204,113,0)}}
        .tc-box{background:var(--gpale);border-radius:8px;padding:0.4rem 0.8rem;font-size:0.78rem;color:var(--g1);margin-top:0.25rem;font-style:italic;}
        .btn-submit{width:100%;padding:0.85rem;border-radius:12px;background:var(--g2);color:white;border:none;font-weight:700;font-size:0.92rem;font-family:'DM Sans',sans-serif;cursor:pointer;margin-top:1rem;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:0.5rem;}
        .btn-submit:hover:not(:disabled){background:var(--g1);}
        .btn-submit:disabled{opacity:0.6;cursor:not-allowed;}

        /* DETAIL */
        .detail-modal{background:white;border-radius:24px;padding:2rem;width:100%;max-width:460px;box-shadow:0 20px 60px rgba(0,0,0,0.25);animation:slideUp .25s ease;}
        .detail-avatar{width:54px;height:54px;border-radius:50%;background:var(--gpale);display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:0.8rem;}
        .detail-name{font-family:'Sora',sans-serif;font-weight:800;font-size:1.25rem;margin-bottom:0.15rem;}
        .detail-meta{color:var(--muted);font-size:0.83rem;margin-bottom:1.3rem;}
        .dr{display:flex;flex-direction:column;gap:0.2rem;margin-bottom:0.9rem;}
        .dlabel{font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--muted);}
        .dval{font-size:0.9rem;color:var(--ink);background:var(--gcards);border-radius:8px;padding:0.45rem 0.8rem;}
        .dval.green{background:var(--gpale);color:var(--g1);}
        .btn-delete{width:100%;padding:0.72rem;border-radius:12px;background:#fff0f0;color:var(--red);border:1.5px solid #fdd;font-weight:700;font-size:0.86rem;font-family:'DM Sans',sans-serif;cursor:pointer;margin-top:0.8rem;transition:all .2s;}
        .btn-delete:hover{background:#fee;}

        /* VOICE PAGE */
        .voice-page{max-width:680px;margin:0 auto;}
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
        .wave-big .b:nth-child(1){height:10px;animation-delay:0s} .wave-big .b:nth-child(2){height:24px;animation-delay:.08s} .wave-big .b:nth-child(3){height:18px;animation-delay:.16s} .wave-big .b:nth-child(4){height:36px;animation-delay:.24s} .wave-big .b:nth-child(5){height:28px;animation-delay:.32s} .wave-big .b:nth-child(6){height:20px;animation-delay:.4s} .wave-big .b:nth-child(7){height:14px;animation-delay:.48s}
        .transcript-area{background:var(--gcards);border:1.5px solid var(--border);border-radius:12px;padding:1rem;min-height:100px;font-size:0.92rem;line-height:1.7;color:var(--ink);margin-bottom:1rem;position:relative;}
        .transcript-area.active{border-color:var(--g2);background:white;}
        .transcript-placeholder{color:var(--muted);font-style:italic;}
        .field-select-row{display:flex;align-items:center;gap:0.8rem;margin-bottom:1rem;flex-wrap:wrap;}
        .field-select-row label{font-size:0.78rem;font-weight:600;color:var(--muted);text-transform:uppercase;white-space:nowrap;}
        .field-chips{display:flex;gap:0.4rem;flex-wrap:wrap;}
        .field-chip{padding:0.35rem 0.8rem;border-radius:50px;border:1.5px solid var(--border);background:white;font-size:0.8rem;font-weight:600;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;}
        .field-chip.active{background:var(--g2);color:white;border-color:var(--g2);}
        .field-chip:hover:not(.active){border-color:var(--g2);color:var(--g2);}
        .vp-actions{display:flex;gap:0.8rem;}
        .btn-apply{flex:1;padding:0.75rem;border-radius:10px;background:var(--g2);color:white;border:none;font-weight:700;font-size:0.88rem;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s;}
        .btn-apply:hover{background:var(--g1);}
        .btn-clear{padding:0.75rem 1.2rem;border-radius:10px;background:white;color:var(--muted);border:1.5px solid var(--border);font-weight:600;font-size:0.88rem;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s;}
        .btn-clear:hover{border-color:var(--red);color:var(--red);}
        .lang-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0.8rem;}
        .lang-card{background:var(--gcards);border:1.5px solid var(--border);border-radius:12px;padding:0.9rem;text-align:center;cursor:pointer;transition:all .2s;}
        .lang-card:hover{border-color:var(--g2);background:var(--gpale);}
        .lang-card.active{background:var(--g2);border-color:var(--g2);color:white;}
        .lang-card .lc-label{font-family:'Sora',sans-serif;font-size:1rem;font-weight:700;margin-bottom:0.2rem;}
        .lang-card .lc-name{font-size:0.72rem;opacity:0.7;}
        .result-saved{background:var(--gpale);border-radius:10px;padding:0.8rem 1rem;font-size:0.85rem;color:var(--g1);border-left:3px solid var(--g2);}

        /* PLACEHOLDER PAGES */
        .placeholder-page{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5rem 2rem;text-align:center;color:var(--muted);}
        .placeholder-page .big-icon{font-size:4rem;margin-bottom:1.2rem;}
        .placeholder-page h2{font-family:'Sora',sans-serif;font-weight:700;font-size:1.3rem;color:var(--ink);margin-bottom:0.5rem;}
        .placeholder-page p{font-size:0.9rem;line-height:1.7;max-width:380px;}
        .coming-soon{display:inline-block;background:var(--safl);color:var(--saf);border-radius:50px;padding:0.3rem 0.9rem;font-size:0.75rem;font-weight:700;margin-top:1rem;}

        /* TOAST */
        .toast{position:fixed;bottom:2rem;right:2rem;z-index:200;padding:0.9rem 1.4rem;border-radius:14px;font-size:0.87rem;font-weight:600;box-shadow:0 8px 30px rgba(0,0,0,0.15);animation:toastIn .3s ease;display:flex;align-items:center;gap:0.5rem;}
        @keyframes toastIn{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        .toast.success{background:var(--g1);color:white;} .toast.error{background:var(--red);color:white;} .toast.info{background:var(--ink);color:white;}
        .spinner{width:18px;height:18px;border:2.5px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .skeleton{background:linear-gradient(90deg,#f0f7f3 25%,#e0f0e8 50%,#f0f7f3 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px;height:48px;}
        @keyframes shimmer{to{background-position:-200% 0;}}

        @media(max-width:900px){
          .sidebar{display:none;} .main{margin-left:0;}
          .stats-row{grid-template-columns:repeat(2,1fr);}
          .form-grid{grid-template-columns:1fr;}
          .lang-grid{grid-template-columns:repeat(2,1fr);}
        }
      `}</style>

      <div className="shell">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sb-logo">🌿 Swasthya<span>Sathi</span></div>
          <div className="lang-section">
            <label>🌐 Language / भाषा</label>
            <select className="lang-select" value={lang} onChange={e => setLang(e.target.value)}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label} — {l.name}</option>)}
            </select>
          </div>
          <nav className="sb-nav">
            <a href="/" className="sb-link">
              <span className="sb-icon">🏠</span> {t.home}
            </a>
            {navItems.map(n => (
              <button key={n.id} className={`sb-link${page === n.id ? ' active' : ''}`} onClick={() => setPage(n.id)}>
                <span className="sb-icon">{n.icon}</span>
                {n.label}
                {n.id === 'voice' && <span className="sb-voice-badge">NEW</span>}
              </button>
            ))}
          </nav>
          <div className="sb-footer">ASHA Worker Portal · v1.0</div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">
          <header className="topbar">
            <h1>
              {page === 'patients' && t.patientRecords}
              {page === 'voice' && `🎙 ${t.voiceInput}`}
              {page === 'reports' && t.reports}
              {page === 'vaccinations' && t.vaccinations}
              {page === 'reminders' && t.reminders}
              {page === 'settings' && t.settings}
            </h1>
            <div className="topbar-right">
              {page === 'patients' && <>
                <div className="search-box">
                  <span>🔍</span>
                  <input placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button className="btn-voice-entry" onClick={() => setPage('voice')}>🎙 {t.voiceInput}</button>
                <button className="btn-add" onClick={() => setShowForm(true)}>+ {t.addPatient}</button>
              </>}
            </div>
          </header>

          <main className="content">

            {/* ══ PATIENTS PAGE ══ */}
            {page === 'patients' && <>
              <div className="stats-row">
                <div className="stat-card"><div className="stat-icon si-green">🧑‍⚕️</div><div><div className="stat-num">{stats.total}</div><div className="stat-label">{t.totalPatients}</div></div></div>
                <div className="stat-card"><div className="stat-icon si-pink">👩</div><div><div className="stat-num">{stats.female}</div><div className="stat-label">{t.female}</div></div></div>
                <div className="stat-card"><div className="stat-icon si-blue">👨</div><div><div className="stat-num">{stats.male}</div><div className="stat-label">{t.male}</div></div></div>
                <div className="stat-card"><div className="stat-icon si-orange">🏘</div><div><div className="stat-num">{stats.villages}</div><div className="stat-label">{t.villages}</div></div></div>
              </div>
              <div className="table-card">
                <div className="table-head">
                  <h2>{t.allPatients}</h2>
                  <span className="count-badge">{filtered.length} {t.records}</span>
                </div>
                {fetching ? (
                  <div style={{padding:'1.5rem',display:'flex',flexDirection:'column',gap:'0.8rem'}}>{[1,2,3].map(i=><div key={i} className="skeleton"/>)}</div>
                ) : filtered.length === 0 ? (
                  <div className="empty-state"><div className="emoji">🏥</div><p>{t.noPatients}</p></div>
                ) : (
                  <table>
                    <thead><tr><th>{t.name}</th><th>{t.age}</th><th>{t.gender}</th><th>{t.village}</th><th>{t.symptoms}</th><th>Date</th><th></th></tr></thead>
                    <tbody>
                      {filtered.map(p => (
                        <tr key={p.id} onClick={() => setSelected(p)}>
                          <td className="name-cell">{p.name}</td>
                          <td>{p.age} yrs</td>
                          <td><span className={`gender-badge gb-${p.gender.toLowerCase()}`}>{p.gender}</span></td>
                          <td className="village-cell">📍 {p.village}</td>
                          <td><div className="symptom-cell">{p.symptoms || '—'}</div></td>
                          <td className="date-cell">{new Date(p.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}</td>
                          <td><button className="action-btn" onClick={e=>{e.stopPropagation();handleDelete(p.id);}}>🗑</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>}

            {/* ══ VOICE PAGE ══ */}
            {page === 'voice' && (
              <div className="voice-page">
                {/* Language Picker */}
                <div className="vp-card">
                  <div className="vp-title">🌐 Select Language / भाषा चुनें</div>
                  <div className="vp-sub">Choose the language you want to speak in. The AI will recognise your voice in that language.</div>
                  <div className="lang-grid">
                    {LANGUAGES.map(l => (
                      <div key={l.code} className={`lang-card${lang === l.code ? ' active' : ''}`} onClick={() => setLang(l.code)}>
                        <div className="lc-label">{l.label}</div>
                        <div className="lc-name">{l.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recorder */}
                <div className="vp-card">
                  <div className="vp-title">🎙 Voice Recorder</div>
                  <div className="vp-sub">{t.voiceHint} · Speaking in: <strong>{currentLang?.name}</strong> ({currentLang?.label})</div>

                  {/* Field selector */}
                  <div className="field-select-row">
                    <label>Record into:</label>
                    <div className="field-chips">
                      {['symptoms','diagnosis','name','village'].map(f => (
                        <button key={f} className={`field-chip${voiceField===f?' active':''}`} onClick={() => setVoiceField(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
                      ))}
                    </div>
                  </div>

                  {/* Big mic */}
                  <button className={`mic-big${listening?' active':''}`}
                    onClick={() => listening ? stopVoicePage() : startVoicePage()}>
                    {listening ? '⏹' : '🎙'}
                  </button>
                  <div className={`mic-status${listening?' active':''}`}>
                    {listening ? `🔴 ${t.listening}` : t.tapToSpeak}
                  </div>

                  {listening && (
                    <div className="wave-big">
                      {[1,2,3,4,5,6,7].map(i=><div key={i} className="b"/>)}
                    </div>
                  )}

                  {/* Transcript */}
                  <div className={`transcript-area${listening?' active':''}`}>
                    {transcript ? transcript : <span className="transcript-placeholder">Your speech will appear here...</span>}
                  </div>

                  <div className="vp-actions">
                    <button className="btn-apply" onClick={applyVoiceToForm} disabled={!transcript}>
                      ✅ Add to {voiceField} field
                    </button>
                    <button className="btn-clear" onClick={() => { setTranscript(''); setVoiceResult(''); }}>
                      🗑 Clear
                    </button>
                  </div>

                  {voiceResult && (
                    <div className="result-saved" style={{marginTop:'1rem'}}>
                      ✅ Added to <strong>{voiceField}</strong>: "{voiceResult}"
                    </div>
                  )}
                </div>

                {/* Open Form */}
                <div className="vp-card" style={{textAlign:'center'}}>
                  <div className="vp-title" style={{justifyContent:'center'}}>📋 Ready to Save?</div>
                  <p style={{fontSize:'0.85rem',color:'var(--muted)',marginBottom:'1.2rem',lineHeight:1.6}}>
                    Voice data has been recorded. Open the patient form to complete and save the record.
                  </p>
                  <button className="btn-add" style={{margin:'0 auto',borderRadius:'12px',padding:'0.8rem 2rem'}}
                    onClick={() => { setPage('patients'); setShowForm(true); }}>
                    🩺 Open Patient Form
                  </button>
                </div>
              </div>
            )}

            {/* ══ REPORTS PAGE ══ */}
            {page === 'reports' && (
              <div className="placeholder-page">
                <div className="big-icon">📊</div>
                <h2>{t.reports}</h2>
                <p>Monthly health reports, government-format summaries, and village-level analytics will be auto-generated here.</p>
                <span className="coming-soon">Coming Soon</span>
              </div>
            )}

            {/* ══ VACCINATIONS PAGE ══ */}
            {page === 'vaccinations' && (
              <div className="placeholder-page">
                <div className="big-icon">💉</div>
                <h2>{t.vaccinations}</h2>
                <p>Track immunisation schedules, upcoming due dates for children and pregnant women, and pending vaccination records.</p>
                <span className="coming-soon">Coming Soon</span>
              </div>
            )}

            {/* ══ REMINDERS PAGE ══ */}
            {page === 'reminders' && (
              <div className="placeholder-page">
                <div className="big-icon">🔔</div>
                <h2>{t.reminders}</h2>
                <p>Smart reminders for follow-up visits, antenatal care, vaccination due dates, and medicine refills.</p>
                <span className="coming-soon">Coming Soon</span>
              </div>
            )}

            {/* ══ SETTINGS PAGE ══ */}
            {page === 'settings' && (
              <div style={{maxWidth:540}}>
                <div className="vp-card">
                  <div className="vp-title">🌐 Language / भाषा</div>
                  <div className="vp-sub">Select the display and voice input language for this device.</div>
                  <div className="lang-grid">
                    {LANGUAGES.map(l => (
                      <div key={l.code} className={`lang-card${lang===l.code?' active':''}`} onClick={()=>setLang(l.code)}>
                        <div className="lc-label">{l.label}</div>
                        <div className="lc-name">{l.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="vp-card">
                  <div className="vp-title">🩺 ASHA Worker Info</div>
                  <div className="vp-sub">Your profile details for report generation.</div>
                  <div className="form-grid" style={{marginTop:'0.5rem'}}>
                    <div className="fg"><label>Worker Name</label><input placeholder="Your name" /></div>
                    <div className="fg"><label>Worker ID</label><input placeholder="ASHA ID" /></div>
                    <div className="fg full"><label>PHC / Block</label><input placeholder="Primary Health Centre name" /></div>
                    <div className="fg full"><label>District</label><input placeholder="e.g. Nagpur, Maharashtra" /></div>
                  </div>
                  <button className="btn-submit" style={{marginTop:'1rem'}} onClick={()=>showToast('Settings saved!','success')}>
                    💾 Save Settings
                  </button>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ── ADD PATIENT MODAL ── */}
      {showForm && (
        <div className="overlay" onClick={()=>{setShowForm(false);stopVoice();}}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2>🩺 {t.newRecord}</h2>
              <button className="close-btn" onClick={()=>{setShowForm(false);stopVoice();}}>✕</button>
            </div>
            <div className="voice-banner">
              <span style={{fontSize:'1.4rem'}}>🎙</span>
              <div className="vb-right">
                <div className="vb-title">{listening ? t.listening : t.voiceHint}</div>
                <div className="vb-sub">{currentLang?.label} · {currentLang?.name}{!voiceSupported && ' · Use Chrome for voice'}</div>
              </div>
              {listening && <div className="wave"><div className="b"/><div className="b"/><div className="b"/><div className="b"/><div className="b"/></div>}
              <span className="vb-badge">{currentLang?.label}</span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="fg full">
                  <label>{t.name} <span className="req">*</span></label>
                  <div className="iw has-mic">
                    <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Meena Devi" required />
                    <MicBtn field="name" />
                  </div>
                  {activeField==='name'&&transcript&&<div className="tc-box">🎙 {transcript}</div>}
                </div>
                <div className="fg">
                  <label>{t.age} <span className="req">*</span></label>
                  <input type="number" min="1" max="120" value={form.age} onChange={e=>setForm(f=>({...f,age:e.target.value}))} placeholder="34" required />
                </div>
                <div className="fg">
                  <label>{t.gender} <span className="req">*</span></label>
                  <select value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))}>
                    {GENDERS.map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="fg full">
                  <label>{t.village} <span className="req">*</span></label>
                  <div className="iw has-mic">
                    <input value={form.village} onChange={e=>setForm(f=>({...f,village:e.target.value}))} placeholder="e.g. Rampur, UP" required />
                    <MicBtn field="village" />
                  </div>
                  {activeField==='village'&&transcript&&<div className="tc-box">🎙 {transcript}</div>}
                </div>
                <div className="fg full">
                  <label>{t.symptoms}</label>
                  <div className="iw has-mic">
                    <textarea value={form.symptoms} onChange={e=>setForm(f=>({...f,symptoms:e.target.value}))} placeholder="e.g. बुखार, सिरदर्द / Fever, Headache" />
                    <MicBtn field="symptoms" isTextarea />
                  </div>
                  {activeField==='symptoms'&&transcript&&<div className="tc-box">🎙 {transcript}</div>}
                </div>
                <div className="fg full">
                  <label>{t.diagnosis}</label>
                  <div className="iw has-mic">
                    <textarea value={form.diagnosis} onChange={e=>setForm(f=>({...f,diagnosis:e.target.value}))} placeholder="e.g. Viral Fever — refer PHC" />
                    <MicBtn field="diagnosis" isTextarea />
                  </div>
                  {activeField==='diagnosis'&&transcript&&<div className="tc-box">🎙 {transcript}</div>}
                </div>
              </div>
              <button className="btn-submit" type="submit" disabled={loading}>
                {loading?<><span className="spinner"/> Saving...</>:`✅ ${t.save}`}
              </button>
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
            <div className="dr"><div className="dlabel">{t.symptoms}</div><div className="dval">{selected.symptoms||'—'}</div></div>
            <div className="dr"><div className="dlabel">{t.diagnosis}</div><div className="dval green">{selected.diagnosis||'Pending'}</div></div>
            <div className="dr"><div className="dlabel">Date</div><div className="dval">{new Date(selected.created_at).toLocaleString('en-IN')}</div></div>
            <button className="btn-delete" onClick={()=>handleDelete(selected.id)}>🗑 Delete Record</button>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.type==='success'?'✅':toast.type==='error'?'❌':'ℹ️'} {toast.msg}</div>}
    </>
  );
}