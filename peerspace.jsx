import { useState, useEffect, useRef } from "react";

// ─── Mock Data ───────────────────────────────────────────────
const USER = { name: "Davide", email: "davide.rossi@supsi.ch", credits: 14, avatar: "D", isTutor: true, subject: "Machine Learning", price: 3, stars: 4.7, bio: "Studente magistrale, appassionato di AI e MLOps." };
const SUBJECTS = ["Analisi Matematica","Programmazione","Fisica","Machine Learning","Algoritmi","Reti","Basi di Dati","Statistica","Elettronica","Sistemi Operativi"];
const TUTORS = [
  { id:1, name:"Marco Bernasconi", subject:"Machine Learning", stars:4.9, avatar:"MB", bio:"Dottorando in AI, 3 anni di esperienza.", price:3, sessions:87 },
  { id:2, name:"Elena Bentivoglio", subject:"Analisi Matematica", stars:4.8, avatar:"EB", bio:"Laureata magistrale, appassionata di didattica.", price:2, sessions:124 },
  { id:3, name:"Luca Ferretti", subject:"Programmazione", stars:4.7, avatar:"LF", bio:"Full-stack developer e tutor part-time.", price:3, sessions:56 },
  { id:4, name:"Sara Colombo", subject:"Fisica", stars:4.6, avatar:"SC", bio:"Ricercatrice in fisica delle particelle.", price:2, sessions:93 },
  { id:5, name:"Andrea Rizzi", subject:"Algoritmi", stars:4.5, avatar:"AR", bio:"Competitive programmer, medaglia IOI.", price:4, sessions:41 },
  { id:6, name:"Giulia Moretti", subject:"Statistica", stars:4.9, avatar:"GM", bio:"Data scientist, focus metodi bayesiani.", price:3, sessions:68 },
  { id:7, name:"Tommaso Sala", subject:"Reti", stars:4.3, avatar:"TS", bio:"Network engineer certificato Cisco.", price:2, sessions:35 },
  { id:8, name:"Chiara Bianchi", subject:"Basi di Dati", stars:4.7, avatar:"CB", bio:"DBA con esperienza PostgreSQL e MongoDB.", price:3, sessions:72 },
  { id:9, name:"Matteo Galli", subject:"Elettronica", stars:4.4, avatar:"MG", bio:"Ingegnere elettronico, specializzato embedded.", price:2, sessions:49 },
  { id:10, name:"Valentina Conti", subject:"Sistemi Operativi", stars:4.6, avatar:"VC", bio:"Linux kernel contributor.", price:3, sessions:58 },
  { id:11, name:"Federico Rossi", subject:"Machine Learning", stars:4.5, avatar:"FR", bio:"MLOps engineer, focus su deployment.", price:3, sessions:44 },
  { id:12, name:"Alessia Marchetti", subject:"Analisi Matematica", stars:4.2, avatar:"AM", bio:"Tutor dal primo anno, paziente e metodica.", price:2, sessions:110 },
];
const SESSIONS = [
  { id:1, tutor:"Marco Bernasconi", tutorId:1, avatar:"MB", subject:"Machine Learning", date:"12 Mar 2026", time:"14:00", room:"A.1.04", price:3, duration:"1h", rated:false,
    chatHistory:[
      {from:"user",text:"Ciao Marco, avrei bisogno di una ripetizione sulle CNN.",time:"10:15"},
      {from:"tutor",text:"Ciao Davide! Certo, quando ti andrebbe bene?",time:"10:16"},
      {from:"user",text:"Domani pomeriggio? Tipo alle 14?",time:"10:18"},
      {from:"tutor",text:"Perfetto, prenoto l'aula A.1.04. Porta gli appunti sulle convoluzioni!",time:"10:20"},
      {from:"user",text:"Super, a domani! 🙏",time:"10:21"},
      {from:"tutor",text:"A domani! Se hai dubbi specifici mandameli prima così preparo degli esempi.",time:"10:22"},
    ]},
  { id:2, tutor:"Elena Bentivoglio", tutorId:2, avatar:"EB", subject:"Analisi Matematica", date:"08 Mar 2026", time:"10:30", room:"B.2.12", price:2, duration:"1h 30min", rated:true, ratedStars:5,
    chatHistory:[
      {from:"user",text:"Ciao Elena, ho difficoltà con gli integrali doppi.",time:"09:00"},
      {from:"tutor",text:"Ciao! Possiamo vederci sabato mattina?",time:"09:05"},
      {from:"user",text:"Perfetto! Aula B.2.12 è libera alle 10:30.",time:"09:12"},
      {from:"tutor",text:"Ok ci vediamo lì. Porta il Bramanti!",time:"09:14"},
    ]},
  { id:3, tutor:"Luca Ferretti", tutorId:3, avatar:"LF", subject:"Programmazione", date:"01 Mar 2026", time:"16:00", room:"C.0.01", price:3, duration:"1h", rated:true, ratedStars:4,
    chatHistory:[
      {from:"user",text:"Luca, mi servirebbe aiuto con i design pattern.",time:"14:30"},
      {from:"tutor",text:"Quale pattern in particolare?",time:"14:35"},
      {from:"user",text:"Observer e Strategy, non mi sono chiari.",time:"14:36"},
      {from:"tutor",text:"Ci vediamo alle 16 in C.0.01, ti faccio vedere con esempi pratici.",time:"14:40"},
    ]},
  { id:4, tutor:"Sara Colombo", tutorId:4, avatar:"SC", subject:"Fisica", date:"22 Feb 2026", time:"09:00", room:"A.3.08", price:2, duration:"2h", rated:true, ratedStars:5,
    chatHistory:[
      {from:"user",text:"Ciao Sara, devo ripassare termodinamica per l'esame.",time:"16:00"},
      {from:"tutor",text:"Ciao! Quanto è fra l'esame?",time:"16:10"},
      {from:"user",text:"Due settimane, ma ho parecchie lacune...",time:"16:12"},
      {from:"tutor",text:"Facciamo una sessione lunga da 2h così copriamo tutto. Sabato mattina?",time:"16:15"},
      {from:"user",text:"Perfetto, grazie!",time:"16:16"},
    ]},
  { id:5, tutor:"Giulia Moretti", tutorId:6, avatar:"GM", subject:"Statistica", date:"15 Feb 2026", time:"11:00", room:"B.1.05", price:3, duration:"1h", rated:true, ratedStars:5,
    chatHistory:[
      {from:"user",text:"Giulia, mi aiuteresti con le distribuzioni di probabilità?",time:"08:30"},
      {from:"tutor",text:"Certo! Poisson e binomiale?",time:"08:45"},
      {from:"user",text:"Sì, e anche la normale. Non capisco quando usare quale.",time:"08:47"},
      {from:"tutor",text:"Perfetto, preparo degli esercizi. Ci vediamo alle 11 in B.1.05.",time:"08:50"},
    ]},
  { id:6, tutor:"Andrea Rizzi", tutorId:5, avatar:"AR", subject:"Algoritmi", date:"10 Feb 2026", time:"15:30", room:"C.2.03", price:4, duration:"1h 30min", rated:true, ratedStars:4,
    chatHistory:[
      {from:"user",text:"Andrea, avrei bisogno di aiuto con la complessità computazionale.",time:"12:00"},
      {from:"tutor",text:"Big-O, Theta, Omega? O problemi NP?",time:"12:15"},
      {from:"user",text:"Un po' di tutto in realtà 😅",time:"12:16"},
      {from:"tutor",text:"Haha ok, facciamo 1h30 allora. Oggi pomeriggio?",time:"12:18"},
      {from:"user",text:"Sì, C.2.03 alle 15:30?",time:"12:20"},
      {from:"tutor",text:"Ci sono! 💪",time:"12:21"},
    ]},
];
const PACKS = [
  { amount:5, price:"CHF 25", per:"5.00", pop:false },
  { amount:10, price:"CHF 45", per:"4.50", pop:true },
  { amount:20, price:"CHF 80", per:"4.00", pop:false },
  { amount:50, price:"CHF 175", per:"3.50", pop:false },
];
const MSGS = [
  { from:"tutor", text:"Ciao! Come posso aiutarti?", time:"14:02" },
  { from:"user", text:"Ciao, avrei bisogno di una ripetizione sulle CNN.", time:"14:03" },
  { from:"tutor", text:"Certo! Possiamo vederci domani alle 14? Aula A.1.04 è libera.", time:"14:04" },
  { from:"user", text:"Perfetto, ci vediamo lì!", time:"14:05" },
];

// Tutor-side mock data
const TUTOR_REQUESTS = [
  { id:1, student:"Anna Volpe", avatar:"AV", subject:"Machine Learning", message:"Ciao! Ho bisogno di aiuto con le reti neurali ricorrenti, possibilmente questa settimana.", date:"Oggi", status:"new" },
  { id:2, student:"Pietro Luzi", avatar:"PL", subject:"Machine Learning", message:"Avrei bisogno di ripassare backpropagation prima dell'esame di giovedì.", date:"Oggi", status:"new" },
  { id:3, student:"Marta Frei", avatar:"MF", subject:"Machine Learning", message:"Possiamo fare una sessione su transfer learning?", date:"Ieri", status:"accepted" },
  { id:4, student:"Liam Brun", avatar:"LB", subject:"Machine Learning", message:"Cerco aiuto per il progetto finale, classificazione immagini.", date:"2 giorni fa", status:"accepted" },
];
const TUTOR_SESSIONS = [
  { student:"Marta Frei", subject:"Machine Learning", date:"20 Mar 2026", time:"15:00", room:"A.1.04", earned:3, duration:"1h", topic:"Transfer Learning" },
  { student:"Liam Brun", subject:"Machine Learning", date:"18 Mar 2026", time:"10:00", room:"B.2.12", earned:3, duration:"1h 30min", topic:"CNN per classificazione" },
  { student:"Anna Volpe", subject:"Machine Learning", date:"14 Mar 2026", time:"14:00", room:"C.0.01", earned:3, duration:"1h", topic:"RNN e LSTM" },
  { student:"Sofia Keller", subject:"Machine Learning", date:"10 Mar 2026", time:"16:30", room:"A.3.08", earned:3, duration:"2h", topic:"Preprocessing dati" },
  { student:"Noah Wyss", subject:"Machine Learning", date:"06 Mar 2026", time:"09:00", room:"B.1.05", earned:3, duration:"1h", topic:"Gradient descent" },
  { student:"Pietro Luzi", subject:"Machine Learning", date:"02 Mar 2026", time:"11:00", room:"A.1.04", earned:3, duration:"1h", topic:"Backpropagation" },
  { student:"Emma Bianchi", subject:"Machine Learning", date:"27 Feb 2026", time:"14:00", room:"C.2.03", earned:3, duration:"1h 30min", topic:"Overfitting e regolarizzazione" },
];
const TUTOR_CHATS = [
  { id:1, student:"Anna Volpe", avatar:"AV", lastMsg:"Grazie mille, ci vediamo!", time:"14:32", unread:0 },
  { id:2, student:"Pietro Luzi", avatar:"PL", lastMsg:"Perfetto, porto gli appunti.", time:"12:15", unread:2 },
  { id:3, student:"Marta Frei", avatar:"MF", lastMsg:"A domani!", time:"Ieri", unread:0 },
  { id:4, student:"Liam Brun", avatar:"LB", lastMsg:"Ho caricato il notebook su Drive.", time:"Ieri", unread:1 },
  { id:5, student:"Sofia Keller", avatar:"SK", lastMsg:"Possiamo spostare a giovedì?", time:"2 giorni fa", unread:0 },
];
const STUDENT_CHATS = [
  { id:101, name:"Marco Bernasconi", avatar:"MB", subject:"Machine Learning", price:3, lastMsg:"Se hai dubbi specifici mandameli prima!", time:"10:22", unread:1 },
  { id:102, name:"Elena Bentivoglio", avatar:"EB", subject:"Analisi Matematica", price:2, lastMsg:"Ok ci vediamo lì. Porta il Bramanti!", time:"Ieri", unread:0 },
  { id:103, name:"Luca Ferretti", avatar:"LF", subject:"Programmazione", price:3, lastMsg:"Ci vediamo alle 16, ti faccio vedere con esempi.", time:"Ieri", unread:0 },
  { id:104, name:"Sara Colombo", avatar:"SC", subject:"Fisica", price:2, lastMsg:"Facciamo 2h così copriamo tutto.", time:"3 giorni fa", unread:0 },
  { id:105, name:"Giulia Moretti", avatar:"GM", subject:"Statistica", price:3, lastMsg:"Preparo degli esercizi. Ci vediamo alle 11!", time:"1 settimana fa", unread:0 },
  { id:106, name:"Andrea Rizzi", avatar:"AR", subject:"Algoritmi", price:4, lastMsg:"Ci sono! 💪", time:"2 settimane fa", unread:0 },
];

// Helpers
const hue = id => (id * 47 + 15) % 360;
const Stars = ({r, s=13}) => (
  <span className="stars">
    {[1,2,3,4,5].map(i=>(
      <svg key={i} width={s} height={s} viewBox="0 0 24 24" fill={i<=Math.round(r)?"currentColor":"none"} stroke="currentColor" strokeWidth="2.2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
    <em>{r}</em>
  </span>
);
const Av = ({t, id, sz=46}) => (
  <div className="av" style={{width:sz,height:sz,fontSize:sz*.32, background:`hsl(${hue(id||7)} 42% 88%)`, color:`hsl(${hue(id||7)} 40% 38%)`}}>{t}</div>
);
const Ic = ({d, s=20}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html:d}}/>;
const ic = {
  home:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  search:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  coins:'<circle cx="12" cy="12" r="8"/><path d="M12 8v8m-4-4h8"/>',
  user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  send:'<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  back:'<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  pin:'<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  check:'<polyline points="20 6 9 17 4 12"/>',
  inbox:'<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  list:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  swap:'<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>',
  dollar:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  trending:'<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  checkCircle:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  x:'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  starFull:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  msgSquare:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
};

// ─── LOGIN ──────────────────────────────────────────────────
function Login({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [load, setLoad] = useState(false);
  const [err, setErr] = useState(false);
  const go = () => {
    if (!email || !pw || (tab==="reg" && !name)) { setErr(true); setTimeout(()=>setErr(false),600); return; }
    setLoad(true); setTimeout(onLogin, 900);
  };
  return (
    <div className="login-wrap">
      <div className="login-bg-orb login-bg-orb--1"/><div className="login-bg-orb login-bg-orb--2"/><div className="login-bg-orb login-bg-orb--3"/>
      <div className="login-inner fadeUp">
        <div className="login-logo"><div className="login-logo-mark">P</div><span className="login-logo-text">PeerSpace</span></div>
        <p className="login-sub">Ripetizioni peer-to-peer per la tua università</p>
        <div className={`login-card${err?" shake":""}`}>
          <div className="login-tabs">
            <button className={tab==="login"?"active":""} onClick={()=>setTab("login")}>Accedi</button>
            <button className={tab==="reg"?"active":""} onClick={()=>setTab("reg")}>Registrati</button>
            <div className="login-tab-pill" style={{transform:`translateX(${tab==="login"?0:100}%)`}}/>
          </div>
          {tab==="reg" && <div className="field fadeUp"><label>Nome completo</label><input placeholder="Mario Rossi" value={name} onChange={e=>setName(e.target.value)}/></div>}
          <div className="field"><label>Email universitaria</label><input type="email" placeholder="nome.cognome@supsi.ch" value={email} onChange={e=>setEmail(e.target.value)}/></div>
          <div className="field"><label>Password</label><input type="password" placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)}/></div>
          <button className="btn-primary login-btn" onClick={go} disabled={load}>{load?"Caricamento...":tab==="login"?"Accedi":"Crea account"}</button>
          <div className="login-divider"><span>oppure</span></div>
          <button className="btn-switch" onClick={()=>{setLoad(true);setTimeout(onLogin,1200)}} disabled={load}>
            <Ic d={ic.shield} s={18}/> Accedi con <strong>SWITCHedu</strong>
          </button>
          <p className="login-fed">Accesso federato tramite il portale universitario svizzero</p>
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT: HOME ──────────────────────────────────────────
function Home({ nav }) {
  const top = [...TUTORS].sort((a,b)=>b.stars-a.stars).slice(0,6);
  return (
    <div className="page fadeUp">
      <div className="home-greet"><h1>Ciao, {USER.name} <span className="wave">👋</span></h1><p>Pronto per la prossima sessione?</p></div>
      <div className="credit-card" onClick={()=>nav("credits")}>
        <div className="credit-card-bg"/><div className="credit-card-ring credit-card-ring--1"/><div className="credit-card-ring credit-card-ring--2"/>
        <div className="credit-label">I TUOI CREDITI</div>
        <div className="credit-val"><span className="credit-num">{USER.credits}</span><span className="credit-unit">crediti disponibili</span></div>
        <button className="credit-btn">Ricarica crediti →</button>
      </div>
      <div className="section-head"><h2>Migliori tutor</h2><button className="link-btn" onClick={()=>nav("search")}>Vedi tutti →</button></div>
      <div className="tutor-list">
        {top.map((t,i)=>(
          <div key={t.id} className="tutor-row" onClick={()=>nav("chat",t)} style={{animationDelay:`${i*60}ms`}}>
            <Av t={t.avatar} id={t.id}/><div className="tutor-row-info"><strong>{t.name}</strong><span>{t.subject}</span></div>
            <div className="tutor-row-right"><Stars r={t.stars} s={11}/><span className="tutor-price">{t.price} cred/h</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STUDENT: SEARCH ────────────────────────────────────────
function Search({ nav }) {
  const [q, setQ] = useState(""); const [sub, setSub] = useState(""); const [ms, setMs] = useState(0);
  const list = TUTORS.filter(t => {
    if (q && !t.name.toLowerCase().includes(q.toLowerCase()) && !t.subject.toLowerCase().includes(q.toLowerCase())) return false;
    if (sub && t.subject!==sub) return false;
    if (ms && t.stars<ms) return false;
    return true;
  });
  return (
    <div className="page fadeUp">
      <h1 className="page-title">Cerca tutor</h1>
      <div className="search-bar"><Ic d={ic.search} s={18}/><input placeholder="Cerca per nome o materia..." value={q} onChange={e=>setQ(e.target.value)}/></div>
      <div className="filter-row"><div className="filter-chips">
        <button className={`chip${sub===""?" active":""}`} onClick={()=>setSub("")}>Tutte</button>
        {SUBJECTS.map(s=><button key={s} className={`chip${sub===s?" active":""}`} onClick={()=>setSub(sub===s?"":s)}>{s.split(" ")[0]}</button>)}
      </div></div>
      <div className="filter-row" style={{marginTop:8}}>
        {[0,4,4.5,4.8].map(v=><button key={v} className={`chip chip--star${ms===v?" active":""}`} onClick={()=>setMs(ms===v?0:v)}>{v===0?"Qualsiasi":"★ "+v+"+"}</button>)}
      </div>
      <p className="result-count">{list.length} tutor trovati</p>
      <div className="tutor-grid">
        {list.map((t,i)=>(
          <div key={t.id} className="tutor-card fadeUp" onClick={()=>nav("chat",t)} style={{animationDelay:`${i*40}ms`}}>
            <div className="tutor-card-head"><Av t={t.avatar} id={t.id} sz={50}/><div><strong>{t.name}</strong><em>{t.subject}</em></div></div>
            <p className="tutor-card-bio">{t.bio}</p>
            <div className="tutor-card-foot"><Stars r={t.stars} s={12}/><span><b>{t.price}</b> cred/h · {t.sessions} sessioni</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SHARED: CHAT ───────────────────────────────────────────
function Chat({ tutor, setTutor, nav, mode }) {
  const [msgs, setMsgs] = useState(MSGS);
  const [inp, setInp] = useState("");
  const end = useRef(null);
  useEffect(()=>{end.current?.scrollIntoView({behavior:"smooth"})},[msgs]);
  // Reset messages when switching contacts
  useEffect(()=>{ if(tutor) setMsgs(MSGS); },[tutor?.id]);

  const send = () => {
    if (!inp.trim()) return;
    const now = new Date();
    const t = `${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`;
    setMsgs(p=>[...p,{from:"user",text:inp,time:t}]);
    setInp("");
    setTimeout(()=>{
      const t2 = `${now.getHours()}:${String(now.getMinutes()+1).padStart(2,"0")}`;
      setMsgs(p=>[...p,{from:"tutor",text:"Ricevuto! Ti confermo a breve 👍",time:t2}]);
    },1200);
  };

  const openChat = (contact) => {
    setTutor(contact);
  };
  const backToList = () => {
    setTutor(null);
  };

  // ── Contact list view (no tutor selected)
  if (!tutor) {
    const contacts = mode === "tutor" ? TUTOR_CHATS : STUDENT_CHATS;
    return (
      <div className="page fadeUp">
        <h1 className="page-title">{mode==="tutor" ? "Chat studenti" : "Chat"}</h1>
        {contacts.length === 0 ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"40vh",flexDirection:"column",gap:12}}>
            <Ic d={ic.chat} s={48}/><h2 style={{opacity:.5}}>Nessuna chat</h2>
          </div>
        ) : (
          <div className="chat-list">
            {contacts.map((c,i) => {
              const isStudent = mode === "tutor";
              const contactName = isStudent ? c.student : c.name;
              const contactAvatar = c.avatar;
              const contactId = c.id;
              return (
                <div key={c.id} className="chat-row fadeUp" style={{animationDelay:`${i*50}ms`}}
                  onClick={() => openChat(isStudent
                    ? {id:c.id, name:c.student, avatar:c.avatar, subject:USER.subject, price:USER.price}
                    : {id:c.id, name:c.name, avatar:c.avatar, subject:c.subject, price:c.price}
                  )}>
                  <Av t={contactAvatar} id={contactId} sz={48}/>
                  <div className="chat-row-info">
                    <div className="chat-row-top">
                      <strong>{contactName}</strong>
                      <span>{c.time}</span>
                    </div>
                    <p className={c.unread>0?"chat-row-msg unread":"chat-row-msg"}>{c.lastMsg}</p>
                    {!isStudent && c.subject && <span className="chat-row-subject">{c.subject}</span>}
                  </div>
                  {c.unread>0 && <div className="unread-badge">{c.unread}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Conversation view (tutor selected)
  return (
    <div className="chat-wrap fadeUp">
      <div className="chat-header">
        <button className="icon-btn" onClick={backToList}><Ic d={ic.back} s={20}/></button>
        <Av t={tutor.avatar} id={tutor.id} sz={36}/>
        <div className="chat-header-info"><strong>{tutor.name}</strong><span>{tutor.subject} · {tutor.price} cred/h</span></div>
      </div>
      <div className="chat-body">
        {msgs.map((m,i)=>(
          <div key={i} className={`msg msg--${m.from}`}><div className="msg-bubble">{m.text}</div><span className="msg-time">{m.time}</span></div>
        ))}
        <div ref={end}/>
      </div>
      <div className="chat-input">
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Scrivi un messaggio..."/>
        <button className="send-btn" onClick={send}><Ic d={ic.send} s={18}/></button>
      </div>
    </div>
  );
}

// ─── RATING MODAL ──────────────────────────────────────────
function RatingModal({ session, onClose, onSubmit }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (stars === 0) return;
    setSubmitted(true);
    setTimeout(() => { onSubmit(session.id, stars, comment); }, 1200);
  };

  return (
    <div className="modal-overlay fadeIn" onClick={onClose}>
      <div className="modal-card slideUp" onClick={e => e.stopPropagation()}>
        {!submitted ? <>
          <div className="modal-header">
            <h3>Valuta la lezione</h3>
            <button className="icon-btn" onClick={onClose}><Ic d={ic.x} s={18}/></button>
          </div>
          <div className="modal-tutor">
            <Av t={session.avatar} id={session.tutorId} sz={48}/>
            <div>
              <strong>{session.tutor}</strong>
              <span>{session.subject} · {session.date}</span>
            </div>
          </div>
          <div className="rating-stars">
            {[1,2,3,4,5].map(i => (
              <button key={i} className={`rating-star${i <= (hover || stars) ? " filled" : ""}`}
                onClick={() => setStars(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}>
                <svg width={36} height={36} viewBox="0 0 24 24" fill={i <= (hover || stars) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            ))}
          </div>
          <p className="rating-label">{["","Pessima","Scarsa","Buona","Ottima","Eccellente"][stars] || "Seleziona un voto"}</p>
          <textarea className="rating-comment" placeholder="Lascia un commento (opzionale)..." value={comment} onChange={e => setComment(e.target.value)} rows={3}/>
          <button className={`btn-primary${stars === 0 ? " disabled" : ""}`} onClick={handleSubmit}>
            {stars > 0 ? `Invia valutazione · ${stars} stell${stars === 1 ? "a" : "e"}` : "Seleziona un voto"}
          </button>
        </> : <>
          <div className="rating-success">
            <div className="rating-success-icon"><Ic d={ic.check} s={28}/></div>
            <h3>Grazie per la valutazione!</h3>
            <p>Il tuo feedback aiuta gli altri studenti.</p>
          </div>
        </>}
      </div>
    </div>
  );
}

// ─── PAST CHAT VIEWER ──────────────────────────────────────
function PastChatView({ session, nav }) {
  return (
    <div className="chat-wrap fadeUp">
      <div className="chat-header">
        <button className="icon-btn" onClick={() => nav("account")}><Ic d={ic.back} s={20}/></button>
        <Av t={session.avatar} id={session.tutorId} sz={36}/>
        <div className="chat-header-info">
          <strong>{session.tutor}</strong>
          <span>{session.subject} · {session.date}</span>
        </div>
        <span className="past-chat-badge">Archivio</span>
      </div>
      <div className="chat-body">
        {session.chatHistory.map((m, i) => (
          <div key={i} className={`msg msg--${m.from}`}>
            <div className="msg-bubble">{m.text}</div>
            <span className="msg-time">{m.time}</span>
          </div>
        ))}
      </div>
      <div className="past-chat-footer">
        <Ic d={ic.clock} s={14}/>
        <span>Conversazione del {session.date} · Lezione di {session.duration}</span>
      </div>
    </div>
  );
}

// ─── STUDENT: ACCOUNT ───────────────────────────────────────
function Account({ nav, onSwitch }) {
  const [ratingSession, setRatingSession] = useState(null);
  const [sessions, setSessions] = useState(SESSIONS);

  const handleRate = (sessionId, stars, comment) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, rated: true, ratedStars: stars } : s));
    setRatingSession(null);
  };

  return (
    <div className="page fadeUp">
      <div className="profile-head">
        <div className="profile-av">{USER.avatar}</div>
        <div><h1>{USER.name}</h1><p>{USER.email}</p></div>
      </div>
      <div className="stat-row">
        {[{v:USER.credits,l:"Crediti",c:"var(--accent)"},{v:sessions.length,l:"Sessioni",c:"#3aab7b"},{v:new Set(sessions.map(s=>s.tutor)).size,l:"Tutor",c:"#8b6cc1"}].map((s,i)=>(
          <div key={i} className="stat-card"><strong style={{color:s.c}}>{s.v}</strong><span>{s.l}</span></div>
        ))}
      </div>
      <h2 className="section-label">Ripetizioni passate</h2>
      <div className="session-list">
        {sessions.map((s,i)=>(
          <div key={s.id} className="session-card fadeUp" style={{animationDelay:`${i*50}ms`}}>
            <div className="session-top">
              <div><strong>{s.tutor}</strong><em>{s.subject}</em></div>
              <span className="badge">{s.price} crediti</span>
            </div>
            <div className="session-meta">
              <span><Ic d={ic.cal} s={13}/>{s.date}</span>
              <span><Ic d={ic.clock} s={13}/>{s.time} · {s.duration}</span>
              <span><Ic d={ic.pin} s={13}/>Aula {s.room}</span>
            </div>
            <div className="session-actions">
              <button className="session-btn" onClick={() => nav("past-chat", s)}>
                <Ic d={ic.msgSquare} s={13}/> Vedi chat
              </button>
              {!s.rated ? (
                <button className="session-btn session-btn--rate" onClick={() => setRatingSession(s)}>
                  <Ic d={ic.starFull} s={13}/> Valuta
                </button>
              ) : (
                <span className="session-rated">
                  <Stars r={s.ratedStars} s={10}/>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {USER.isTutor && <button className="btn-mode" onClick={onSwitch}><Ic d={ic.swap} s={16}/> Passa a modalità Tutor</button>}
      <button className="btn-logout" onClick={()=>nav("logout")}><Ic d={ic.logout} s={16}/> Esci dall'account</button>

      {ratingSession && <RatingModal session={ratingSession} onClose={() => setRatingSession(null)} onSubmit={handleRate}/>}
    </div>
  );
}

// ─── STUDENT: CREDITS ───────────────────────────────────────
function Credits() {
  const [sel, setSel] = useState(null);
  const [ok, setOk] = useState(false);
  const buy = () => { if(sel===null) return; setOk(true); setSel(null); setTimeout(()=>setOk(false),2500); };
  return (
    <div className="page fadeUp">
      <h1 className="page-title">Acquista crediti</h1>
      <p className="page-sub">Saldo attuale: <strong>{USER.credits} crediti</strong></p>
      {ok && <div className="toast fadeUp"><Ic d={ic.check} s={16}/> Crediti acquistati con successo!</div>}
      <div className="pack-list">
        {PACKS.map((p,i)=>(
          <div key={i} className={`pack-card${sel===i?" selected":""}`} onClick={()=>setSel(i)}>
            {p.pop && <div className="pack-pop">Più scelto</div>}
            <div className="pack-left"><strong>{p.amount} <span>crediti</span></strong><em>CHF {p.per} / credito</em></div>
            <div className="pack-price">{p.price}</div>
          </div>
        ))}
      </div>
      <button className={`btn-primary buy-btn${sel===null?" disabled":""}`} onClick={buy}>
        {sel!==null?`Acquista ${PACKS[sel].amount} crediti per ${PACKS[sel].price}`:"Seleziona un pacchetto"}
      </button>
      <div className="pay-methods"><span className="pay-label">Metodi accettati</span>
        <div className="pay-row">{["TWINT","Visa","Mastercard","PostFinance"].map(m=><span key={m} className="pay-chip">{m}</span>)}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TUTOR PAGES
// ═══════════════════════════════════════════════════════════════

// ─── TUTOR: DASHBOARD ───────────────────────────────────────
function TutorDashboard({ nav }) {
  const totalEarned = TUTOR_SESSIONS.reduce((a,s)=>a+s.earned,0);
  const pendingRequests = TUTOR_REQUESTS.filter(r=>r.status==="new").length;
  return (
    <div className="page fadeUp">
      <div className="home-greet">
        <div className="mode-badge">Modalità Tutor</div>
        <h1>Ciao, {USER.name} <span className="wave">👋</span></h1>
        <p>Ecco la tua attività come tutor</p>
      </div>
      {/* Earnings card */}
      <div className="earnings-card">
        <div className="credit-card-bg"/>
        <div className="credit-card-ring credit-card-ring--1"/><div className="credit-card-ring credit-card-ring--2"/>
        <div className="credit-label">CREDITI GUADAGNATI</div>
        <div className="credit-val"><span className="credit-num">{totalEarned}</span><span className="credit-unit">crediti totali</span></div>
        <div className="earnings-sub">~ CHF {(totalEarned * 4.5).toFixed(0)} di valore</div>
      </div>
      {/* Stats */}
      <div className="stat-row" style={{marginBottom:24}}>
        {[
          {v:TUTOR_SESSIONS.length,l:"Lezioni",c:"var(--accent)",i:ic.list},
          {v:"4.7",l:"Voto medio",c:"#e6a817",i:null},
          {v:pendingRequests,l:"Richieste",c:"#3aab7b",i:ic.inbox},
        ].map((s,i)=>(
          <div key={i} className="stat-card"><strong style={{color:s.c}}>{s.v}</strong><span>{s.l}</span></div>
        ))}
      </div>
      {/* Pending requests preview */}
      <div className="section-head"><h2>Nuove richieste</h2><button className="link-btn" onClick={()=>nav("t-requests")}>Vedi tutte →</button></div>
      <div className="tutor-list">
        {TUTOR_REQUESTS.filter(r=>r.status==="new").slice(0,3).map((r,i)=>(
          <div key={r.id} className="request-row fadeUp" style={{animationDelay:`${i*60}ms`}}>
            <Av t={r.avatar} id={r.id+20} sz={44}/>
            <div className="request-info">
              <strong>{r.student}</strong>
              <span className="request-msg">{r.message}</span>
              <span className="request-date">{r.date}</span>
            </div>
            <div className="request-actions">
              <button className="req-btn req-btn--accept" onClick={e=>{e.stopPropagation()}}><Ic d={ic.check} s={14}/></button>
              <button className="req-btn req-btn--reject" onClick={e=>{e.stopPropagation()}}><Ic d={ic.x} s={14}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TUTOR: REQUESTS ────────────────────────────────────────
function TutorRequests() {
  const [reqs, setReqs] = useState(TUTOR_REQUESTS);
  const accept = (id) => setReqs(r=>r.map(x=>x.id===id?{...x,status:"accepted"}:x));
  const reject = (id) => setReqs(r=>r.filter(x=>x.id!==id));
  return (
    <div className="page fadeUp">
      <h1 className="page-title">Richieste studenti</h1>
      <p className="page-sub">{reqs.filter(r=>r.status==="new").length} nuove · {reqs.filter(r=>r.status==="accepted").length} accettate</p>
      <div className="request-list">
        {reqs.map((r,i)=>(
          <div key={r.id} className={`request-card fadeUp${r.status==="accepted"?" accepted":""}`} style={{animationDelay:`${i*50}ms`}}>
            <div className="request-card-head">
              <Av t={r.avatar} id={r.id+20} sz={48}/>
              <div>
                <strong>{r.student}</strong>
                <em>{r.subject}</em>
              </div>
              {r.status==="accepted" && <span className="badge badge--green"><Ic d={ic.checkCircle} s={12}/> Accettata</span>}
              {r.status==="new" && <span className="badge">Nuova</span>}
            </div>
            <p className="request-card-msg">{r.message}</p>
            <div className="request-card-foot">
              <span className="request-date">{r.date}</span>
              {r.status==="new" && (
                <div className="request-actions">
                  <button className="req-btn req-btn--accept" onClick={()=>accept(r.id)}><Ic d={ic.check} s={14}/> Accetta</button>
                  <button className="req-btn req-btn--reject" onClick={()=>reject(r.id)}><Ic d={ic.x} s={14}/> Rifiuta</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TUTOR: SESSIONS ────────────────────────────────────────
function TutorSessions() {
  const totalEarned = TUTOR_SESSIONS.reduce((a,s)=>a+s.earned,0);
  return (
    <div className="page fadeUp">
      <h1 className="page-title">Lezioni svolte</h1>
      <p className="page-sub">Totale guadagnato: <strong>{totalEarned} crediti</strong></p>
      <div className="session-list">
        {TUTOR_SESSIONS.map((s,i)=>(
          <div key={i} className="session-card fadeUp" style={{animationDelay:`${i*50}ms`}}>
            <div className="session-top">
              <div><strong>{s.student}</strong><em>{s.topic}</em></div>
              <span className="badge badge--green">+{s.earned} crediti</span>
            </div>
            <div className="session-meta">
              <span><Ic d={ic.cal} s={13}/>{s.date}</span>
              <span><Ic d={ic.clock} s={13}/>{s.time} · {s.duration}</span>
              <span><Ic d={ic.pin} s={13}/>Aula {s.room}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TUTOR: ACCOUNT ─────────────────────────────────────────
function TutorAccount({ nav, onSwitch }) {
  const totalEarned = TUTOR_SESSIONS.reduce((a,s)=>a+s.earned,0);
  return (
    <div className="page fadeUp">
      <div className="profile-head">
        <div className="profile-av profile-av--tutor">{USER.avatar}</div>
        <div><h1>{USER.name}</h1><p>{USER.email}</p><span className="tutor-tag">Tutor · {USER.subject}</span></div>
      </div>
      <div className="stat-row">
        {[{v:totalEarned,l:"Guadagnati",c:"#3aab7b"},{v:TUTOR_SESSIONS.length,l:"Lezioni",c:"var(--accent)"},{v:USER.stars,l:"Voto",c:"#e6a817"}].map((s,i)=>(
          <div key={i} className="stat-card"><strong style={{color:s.c}}>{s.v}</strong><span>{s.l}</span></div>
        ))}
      </div>
      {/* Tutor profile card */}
      <h2 className="section-label">Il tuo profilo tutor</h2>
      <div className="tutor-profile-card">
        <div className="tp-row"><span>Materia</span><strong>{USER.subject}</strong></div>
        <div className="tp-row"><span>Prezzo</span><strong>{USER.price} crediti/h</strong></div>
        <div className="tp-row"><span>Bio</span><strong>{USER.bio}</strong></div>
        <div className="tp-row"><span>Valutazione</span><Stars r={USER.stars} s={14}/></div>
      </div>
      <button className="btn-mode btn-mode--student" onClick={onSwitch}><Ic d={ic.swap} s={16}/> Torna a modalità Studente</button>
      <button className="btn-logout" onClick={()=>nav("logout")}><Ic d={ic.logout} s={16}/> Esci dall'account</button>
    </div>
  );
}

// ─── APP ────────────────────────────────────────────────────
export default function App() {
  const [logged, setLogged] = useState(false);
  const [page, setPage] = useState("home");
  const [tutor, setTutor] = useState(null);
  const [trans, setTrans] = useState(false);
  const [mode, setMode] = useState("student");
  const [pastChat, setPastChat] = useState(null);

  const nav = (p, d) => {
    if (p==="logout"){setLogged(false);setPage("home");setMode("student");setTutor(null);return;}
    if (p==="past-chat" && d) { setPastChat(d); }
    setTrans(true);
    setTimeout(()=>{
      if (p==="chat"&&d) setTutor(d);
      else if (p==="t-chats"&&d) setTutor(d);
      else if (p!=="chat"&&p!=="t-chats") setTutor(null);
      setPage(p);
      setTrans(false);
    },150);
  };

  const switchMode = () => {
    setTrans(true);
    setTimeout(()=>{
      const next = mode==="student"?"tutor":"student";
      setMode(next);
      setPage(next==="tutor"?"t-dash":"home");
      setTrans(false);
    },200);
  };

  const studentTabs = [
    {id:"home",label:"Home",icon:ic.home},
    {id:"search",label:"Cerca",icon:ic.search},
    {id:"chat",label:"Chat",icon:ic.chat},
    {id:"credits",label:"Crediti",icon:ic.coins},
    {id:"account",label:"Account",icon:ic.user},
  ];
  const tutorTabs = [
    {id:"t-dash",label:"Dashboard",icon:ic.home},
    {id:"t-requests",label:"Richieste",icon:ic.inbox},
    {id:"t-chats",label:"Chat",icon:ic.chat},
    {id:"t-sessions",label:"Lezioni",icon:ic.list},
    {id:"t-account",label:"Account",icon:ic.user},
  ];
  const tabs = mode==="tutor" ? tutorTabs : studentTabs;

  if (!logged) return <><style>{CSS}</style><Login onLogin={()=>setLogged(true)}/></>;

  return (
    <>
      <style>{CSS}</style>
      <div className={`app-shell${mode==="tutor"?" tutor-mode":""}`}>
        <div className={`page-content${trans?" fading":""}`}>
          {/* Student pages */}
          {page==="home"&&<Home nav={nav}/>}
          {page==="search"&&<Search nav={nav}/>}
          {page==="chat"&&<Chat tutor={tutor} setTutor={setTutor} nav={nav} mode={mode}/>}
          {page==="credits"&&<Credits/>}
          {page==="account"&&<Account nav={nav} onSwitch={switchMode}/>}
          {page==="past-chat"&&pastChat&&<PastChatView session={pastChat} nav={nav}/>}
          {/* Tutor pages */}
          {page==="t-dash"&&<TutorDashboard nav={nav}/>}
          {page==="t-requests"&&<TutorRequests/>}
          {page==="t-chats"&&<Chat tutor={tutor} setTutor={setTutor} nav={nav} mode="tutor"/>}
          {page==="t-sessions"&&<TutorSessions/>}
          {page==="t-account"&&<TutorAccount nav={nav} onSwitch={switchMode}/>}
        </div>
        <nav className={`tab-bar${mode==="tutor"?" tab-bar--tutor":""}`}>
          {tabs.map(t=>(
            <button key={t.id} className={`tab${page===t.id?" active":""}`} onClick={()=>nav(t.id)}>
              <Ic d={t.icon} s={20}/><span>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

// ─── STYLES ─────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
:root{--font-d:'Sora',sans-serif;--font-b:'DM Sans',sans-serif;--bg:#F3F5F9;--card:#FFFFFF;--glass:rgba(255,255,255,0.72);--border:#E0E4ED;--border2:#D0D5E0;--text:#151820;--muted:#8A90A0;--accent:#F28A2A;--accent2:#D96A00;--accent-g:rgba(242,138,42,0.20);--accent-l:#FFF2E4;--green:#2D9B6A;--green-l:#e8f7ef;--danger:#D44;--r:16px}
@media(prefers-color-scheme:dark){:root{--bg:#0D0F14;--card:#161922;--glass:rgba(22,25,34,0.78);--border:#242836;--border2:#2F3444;--text:#E8ECF4;--muted:#717A90;--accent:#FFB261;--accent2:#F28A2A;--accent-g:rgba(255,178,97,0.24);--accent-l:rgba(255,178,97,0.14);--green-l:rgba(45,155,106,0.12);--danger:#F06060}}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--bg);font-family:var(--font-b);color:var(--text);-webkit-font-smoothing:antialiased;overflow-x:hidden}
body::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.028;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:128px 128px}

@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes wave{0%,100%{transform:rotate(0)}20%{transform:rotate(18deg)}40%{transform:rotate(-8deg)}60%{transform:rotate(14deg)}80%{transform:rotate(-4deg)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@keyframes slideIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
.fadeUp{animation:fadeUp .5s ease both}.shake{animation:shake .5s ease}.wave{display:inline-block;animation:wave 1.8s ease infinite}

.av{border-radius:14px;display:flex;align-items:center;justify-content:center;font-family:var(--font-d);font-weight:800;flex-shrink:0;letter-spacing:-.02em}
.stars{display:inline-flex;align-items:center;gap:2px;color:var(--accent)}.stars em{font-style:normal;font-size:12px;font-weight:700;color:var(--text);margin-left:3px}
.btn-primary{width:100%;padding:15px 0;border:none;border-radius:14px;background:var(--accent);color:#fff;font-size:15px;font-weight:700;font-family:var(--font-b);cursor:pointer;transition:all .2s;box-shadow:0 6px 24px var(--accent-g)}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 32px var(--accent-g)}.btn-primary:active{transform:translateY(0)}
.btn-primary.disabled{background:var(--border2);box-shadow:none;cursor:default}.btn-primary.disabled:hover{transform:none}
.icon-btn{background:none;border:none;color:var(--muted);cursor:pointer;padding:6px;border-radius:10px;transition:all .15s;display:flex;align-items:center}.icon-btn:hover{background:var(--border);color:var(--text)}
.link-btn{background:none;border:none;color:var(--accent);font-size:14px;font-weight:600;font-family:var(--font-b);cursor:pointer}
input::placeholder{color:var(--muted);opacity:.65}

.app-shell{min-height:100vh;display:flex;flex-direction:column}
.page-content{flex:1;padding-bottom:80px;transition:opacity .15s}.page-content.fading{opacity:0;transform:scale(.99)}
.page{padding:20px 20px 24px;max-width:680px;margin:0 auto;width:100%}

.tab-bar{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:center;padding:0 4px env(safe-area-inset-bottom,8px);background:var(--glass);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-top:1px solid var(--border);z-index:100}
.tab-bar--tutor{border-top-color:var(--green)}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 0 10px;border:none;background:none;cursor:pointer;color:var(--muted);transition:color .2s;position:relative;max-width:90px}
.tab span{font-size:10.5px;font-weight:600;font-family:var(--font-b)}.tab.active{color:var(--accent)}
.tab.active::before{content:'';position:absolute;top:0;width:24px;height:3px;border-radius:0 0 3px 3px;background:var(--accent)}
.tab-bar--tutor .tab.active{color:var(--green)}.tab-bar--tutor .tab.active::before{background:var(--green)}

/* LOGIN */
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:20px;position:relative;overflow:hidden}
.login-bg-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}
.login-bg-orb--1{width:320px;height:320px;background:var(--accent);top:-80px;right:-60px;opacity:.12}
.login-bg-orb--2{width:240px;height:240px;background:#FFC083;bottom:-40px;left:-60px;opacity:.10}
.login-bg-orb--3{width:160px;height:160px;background:var(--accent2);top:50%;left:50%;opacity:.06}
.login-inner{width:100%;max-width:420px;position:relative;z-index:1}
.login-logo{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:8px}
.login-logo-mark{width:50px;height:50px;border-radius:16px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-d);font-size:24px;font-weight:800;color:#fff;box-shadow:0 6px 28px var(--accent-g)}
.login-logo-text{font-family:var(--font-d);font-size:30px;font-weight:800;letter-spacing:-.04em}
.login-sub{text-align:center;color:var(--muted);font-size:14px;margin-bottom:36px}
.login-card{background:var(--card);border-radius:24px;padding:32px 28px;border:1px solid var(--border);box-shadow:0 12px 48px rgba(0,0,0,0.07),0 2px 8px rgba(0,0,0,0.03)}
.login-tabs{display:flex;position:relative;background:var(--bg);border-radius:12px;padding:4px;margin-bottom:24px;overflow:hidden}
.login-tabs button{flex:1;padding:10px 0;border:none;background:none;cursor:pointer;font-family:var(--font-b);font-size:14px;font-weight:600;color:var(--muted);position:relative;z-index:1;transition:color .25s}
.login-tabs button.active{color:var(--text)}
.login-tab-pill{position:absolute;top:4px;left:4px;width:calc(50% - 4px);height:calc(100% - 8px);background:var(--card);border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.06);transition:transform .3s cubic-bezier(.4,0,.2,1)}
.field{margin-bottom:16px}.field label{display:block;font-size:12.5px;font-weight:600;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em}
.field input,.search-bar input{width:100%;padding:13px 16px;border-radius:12px;border:1.5px solid var(--border);background:var(--bg);color:var(--text);font-size:15px;font-family:var(--font-b);outline:none;transition:border .2s,box-shadow .2s;box-sizing:border-box}
.field input:focus,.search-bar input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-g)}
.login-btn{margin-top:4px}.login-divider{display:flex;align-items:center;gap:16px;margin:22px 0}
.login-divider::before,.login-divider::after{content:'';flex:1;height:1px;background:var(--border)}
.login-divider span{font-size:12px;color:var(--muted)}
.btn-switch{width:100%;padding:14px;border-radius:14px;border:1.5px solid var(--border);background:var(--card);color:var(--text);font-size:14px;font-family:var(--font-b);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s}
.btn-switch:hover{border-color:var(--border2);background:var(--bg)}
.login-fed{text-align:center;font-size:11.5px;color:var(--muted);margin-top:14px;line-height:1.5}

/* HOME */
.home-greet{margin-bottom:24px}.home-greet h1{font-family:var(--font-d);font-size:26px;font-weight:800;letter-spacing:-.03em}.home-greet p{color:var(--muted);font-size:15px;margin-top:4px}
.mode-badge{display:inline-block;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:10px;background:var(--green-l);color:var(--green);border:1px solid rgba(45,155,106,0.2)}
.credit-card,.earnings-card{position:relative;border-radius:22px;padding:26px 28px;color:#fff;overflow:hidden;cursor:pointer;margin-bottom:28px;transition:transform .2s}
.credit-card{background:linear-gradient(135deg,var(--accent) 0%,var(--accent2) 60%,#B94F00 100%)}
.earnings-card{background:linear-gradient(135deg,#2D9B6A 0%,#1E7A52 60%,#155C3E 100%)}
.credit-card:hover,.earnings-card:hover{transform:translateY(-2px)}
.credit-card-bg{position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")}
.credit-card-ring{position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,.12)}
.credit-card-ring--1{width:180px;height:180px;top:-50px;right:-40px}.credit-card-ring--2{width:120px;height:120px;bottom:-30px;right:50px}
.credit-label{font-size:11px;font-weight:700;opacity:.75;letter-spacing:.08em;margin-bottom:6px}
.credit-val{display:flex;align-items:baseline;gap:8px;margin-bottom:16px}
.credit-num{font-family:var(--font-d);font-size:46px;font-weight:800;letter-spacing:-.03em;line-height:1}.credit-unit{font-size:15px;opacity:.75}
.credit-btn{padding:10px 22px;border-radius:12px;border:1.5px solid rgba(255,255,255,.3);background:rgba(255,255,255,.12);color:#fff;font-size:13.5px;font-weight:700;font-family:var(--font-b);cursor:pointer;backdrop-filter:blur(8px);transition:all .2s}
.credit-btn:hover{background:rgba(255,255,255,.2)}
.earnings-sub{font-size:14px;opacity:.7;margin-top:-8px}
.section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.section-head h2{font-family:var(--font-d);font-size:19px;font-weight:700;letter-spacing:-.02em}

.tutor-list{display:flex;flex-direction:column;gap:8px}
.tutor-row{display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--card);border-radius:var(--r);border:1px solid var(--border);cursor:pointer;transition:all .2s;animation:fadeUp .45s ease both}
.tutor-row:hover{border-color:var(--accent);transform:translateY(-1px);box-shadow:0 4px 20px var(--accent-g)}
.tutor-row-info{flex:1;min-width:0}.tutor-row-info strong{display:block;font-size:14.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tutor-row-info span{font-size:12.5px;color:var(--muted)}
.tutor-row-right{text-align:right;flex-shrink:0}.tutor-price{display:block;font-size:11.5px;color:var(--muted);margin-top:3px}

/* SEARCH */
.page-title{font-family:var(--font-d);font-size:24px;font-weight:800;letter-spacing:-.03em;margin-bottom:18px}
.page-sub{color:var(--muted);font-size:15px;margin-bottom:20px}.page-sub strong{color:var(--accent)}
.search-bar{display:flex;align-items:center;gap:12px;padding:13px 16px;background:var(--card);border-radius:14px;border:1.5px solid var(--border);margin-bottom:14px;transition:border .2s}
.search-bar:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-g)}
.search-bar input{border:none!important;padding:0!important;background:transparent!important;box-shadow:none!important}.search-bar svg{color:var(--muted);flex-shrink:0}
.filter-row{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}.filter-row::-webkit-scrollbar{display:none}.filter-chips{display:flex;gap:6px}
.chip{padding:7px 14px;border-radius:20px;border:1.5px solid var(--border);background:var(--card);font-size:12.5px;font-weight:600;font-family:var(--font-b);color:var(--muted);cursor:pointer;white-space:nowrap;transition:all .2s}
.chip:hover{border-color:var(--border2)}.chip.active{background:var(--accent-l);color:var(--accent);border-color:var(--accent)}
.result-count{font-size:13px;color:var(--muted);margin:14px 0 12px}
.tutor-grid{display:flex;flex-direction:column;gap:10px}
.tutor-card{padding:18px;background:var(--card);border-radius:var(--r);border:1px solid var(--border);cursor:pointer;transition:all .2s}
.tutor-card:hover{border-color:var(--accent);transform:translateY(-1px);box-shadow:0 4px 20px var(--accent-g)}
.tutor-card-head{display:flex;align-items:center;gap:14px;margin-bottom:10px}
.tutor-card-head strong{display:block;font-size:15.5px;font-weight:700}.tutor-card-head em{font-style:normal;font-size:13px;color:var(--accent);font-weight:600}
.tutor-card-bio{font-size:13px;color:var(--muted);line-height:1.45;margin-bottom:12px}
.tutor-card-foot{display:flex;justify-content:space-between;align-items:center}.tutor-card-foot span{font-size:12px;color:var(--muted)}.tutor-card-foot b{color:var(--text)}

/* CHAT */
.chat-wrap{display:flex;flex-direction:column;height:calc(100vh - 72px);max-width:680px;margin:0 auto;animation:slideIn .35s ease}
.chat-header{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--border);background:var(--card)}
.chat-header-info strong{display:block;font-size:14.5px;font-weight:700}.chat-header-info span{font-size:12px;color:var(--accent);font-weight:600}
.chat-body{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:6px}
.msg{display:flex;flex-direction:column;max-width:78%}.msg--user{align-self:flex-end;align-items:flex-end}.msg--tutor{align-self:flex-start;align-items:flex-start}
.msg-bubble{padding:11px 16px;font-size:14.5px;line-height:1.45;border-radius:20px}
.msg--user .msg-bubble{background:var(--accent);color:#fff;border-bottom-right-radius:6px}
.msg--tutor .msg-bubble{background:var(--card);border:1px solid var(--border);border-bottom-left-radius:6px}
.msg-time{font-size:10.5px;color:var(--muted);margin-top:3px;padding:0 6px}
.chat-input{display:flex;gap:10px;padding:12px 18px 24px;border-top:1px solid var(--border);background:var(--card)}
.chat-input input{flex:1;padding:13px 16px;border-radius:16px;border:1.5px solid var(--border);background:var(--bg);color:var(--text);font-size:15px;font-family:var(--font-b);outline:none;transition:border .2s}
.chat-input input:focus{border-color:var(--accent)}
.send-btn{width:46px;height:46px;border-radius:14px;border:none;background:var(--accent);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 16px var(--accent-g);transition:all .15s}
.send-btn:hover{transform:scale(1.04)}.send-btn:active{transform:scale(.96)}

/* CHAT LIST (tutor) */
.chat-list{display:flex;flex-direction:column;gap:6px}
.chat-row{display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--card);border-radius:var(--r);border:1px solid var(--border);cursor:pointer;transition:all .2s}
.chat-row:hover{border-color:var(--green);box-shadow:0 4px 16px rgba(45,155,106,0.1)}
.chat-row-info{flex:1;min-width:0}
.chat-row-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:3px}
.chat-row-top strong{font-size:14.5px}.chat-row-top span{font-size:11.5px;color:var(--muted)}
.chat-row-msg{font-size:13px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chat-row-msg.unread{color:var(--text);font-weight:600}
.unread-badge{width:22px;height:22px;border-radius:11px;background:var(--green);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.chat-row-subject{display:inline-block;font-size:11px;font-weight:600;color:var(--accent);margin-top:3px}

/* ACCOUNT */
.profile-head{display:flex;align-items:center;gap:16px;margin-bottom:24px}
.profile-av{width:60px;height:60px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-family:var(--font-d);font-size:24px;font-weight:800;color:#fff;flex-shrink:0;background:linear-gradient(135deg,var(--accent),var(--accent2));box-shadow:0 6px 24px var(--accent-g)}
.profile-av--tutor{background:linear-gradient(135deg,#2D9B6A,#1E7A52);box-shadow:0 6px 24px rgba(45,155,106,0.25)}
.profile-head h1{font-family:var(--font-d);font-size:22px;font-weight:800;letter-spacing:-.02em}.profile-head p{font-size:14px;color:var(--muted);margin-top:2px}
.tutor-tag{display:inline-block;margin-top:4px;font-size:12px;font-weight:600;color:var(--green);background:var(--green-l);padding:3px 10px;border-radius:6px}
.stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:28px}
.stat-card{text-align:center;padding:18px 10px;background:var(--card);border-radius:var(--r);border:1px solid var(--border)}
.stat-card strong{display:block;font-family:var(--font-d);font-size:28px;font-weight:800;letter-spacing:-.02em}
.stat-card span{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-top:2px;display:block}
.section-label{font-family:var(--font-d);font-size:18px;font-weight:700;margin-bottom:14px;letter-spacing:-.02em}
.session-list{display:flex;flex-direction:column;gap:8px}
.session-card{padding:16px 18px;background:var(--card);border-radius:var(--r);border:1px solid var(--border)}
.session-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px}
.session-top strong{display:block;font-size:14.5px;font-weight:700}.session-top em{font-style:normal;font-size:12.5px;color:var(--accent);font-weight:600}
.badge{padding:4px 12px;border-radius:8px;background:var(--accent-l);color:var(--accent);font-size:12.5px;font-weight:700;white-space:nowrap;display:inline-flex;align-items:center;gap:4px}
.badge--green{background:var(--green-l);color:var(--green)}
.session-meta{display:flex;flex-wrap:wrap;gap:14px}.session-meta span{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;color:var(--muted)}

/* MODE SWITCH */
.btn-mode{width:100%;margin-top:28px;padding:15px 0;border-radius:14px;border:2px solid var(--green);background:var(--green-l);color:var(--green);font-size:14.5px;font-weight:700;font-family:var(--font-b);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s}
.btn-mode:hover{background:var(--green);color:#fff}
.btn-mode--student{border-color:var(--accent);background:var(--accent-l);color:var(--accent)}
.btn-mode--student:hover{background:var(--accent);color:#fff}
.btn-logout{width:100%;margin-top:12px;padding:14px 0;border-radius:14px;border:1px solid var(--border);background:var(--card);color:var(--danger);font-size:14.5px;font-weight:600;font-family:var(--font-b);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s}
.btn-logout:hover{background:var(--bg);border-color:var(--danger)}

/* TUTOR REQUESTS */
.request-list{display:flex;flex-direction:column;gap:10px}
.request-row{display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--card);border-radius:var(--r);border:1px solid var(--border);transition:all .2s}
.request-info{flex:1;min-width:0}.request-info strong{display:block;font-size:14px;font-weight:700}
.request-msg{display:block;font-size:12.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
.request-date{font-size:11.5px;color:var(--muted)}
.request-actions{display:flex;gap:6px;flex-shrink:0}
.req-btn{padding:7px 12px;border-radius:10px;border:none;font-size:12.5px;font-weight:600;font-family:var(--font-b);cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .15s}
.req-btn--accept{background:var(--green-l);color:var(--green)}.req-btn--accept:hover{background:var(--green);color:#fff}
.req-btn--reject{background:rgba(221,68,68,0.08);color:var(--danger)}.req-btn--reject:hover{background:var(--danger);color:#fff}
.request-card{padding:18px;background:var(--card);border-radius:var(--r);border:1px solid var(--border);transition:all .2s}
.request-card.accepted{border-color:rgba(45,155,106,0.3)}
.request-card-head{display:flex;align-items:center;gap:14px;margin-bottom:10px}
.request-card-head strong{display:block;font-size:15px;font-weight:700}.request-card-head em{font-style:normal;font-size:13px;color:var(--accent);font-weight:600}
.request-card-msg{font-size:13.5px;color:var(--muted);line-height:1.45;margin-bottom:12px}
.request-card-foot{display:flex;justify-content:space-between;align-items:center}

/* TUTOR PROFILE */
.tutor-profile-card{background:var(--card);border-radius:var(--r);border:1px solid var(--border);overflow:hidden}
.tp-row{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--border)}
.tp-row:last-child{border-bottom:none}
.tp-row span{font-size:13px;color:var(--muted);flex-shrink:0}.tp-row strong{font-size:14px;text-align:right;margin-left:16px}

/* CREDITS */
.pack-list{display:flex;flex-direction:column;gap:10px;margin-bottom:20px}
.pack-card{display:flex;align-items:center;justify-content:space-between;padding:20px 22px;background:var(--card);border-radius:18px;border:1.5px solid var(--border);cursor:pointer;transition:all .25s;position:relative}
.pack-card:hover{border-color:var(--border2)}.pack-card.selected{border-color:var(--accent);box-shadow:0 4px 24px var(--accent-g)}
.pack-pop{position:absolute;top:-11px;right:16px;padding:4px 13px;background:var(--accent);color:#fff;font-size:10px;font-weight:700;border-radius:8px;letter-spacing:.04em;text-transform:uppercase}
.pack-left strong{font-family:var(--font-d);font-size:22px;font-weight:800}.pack-left strong span{font-size:14px;font-weight:600;color:var(--muted)}
.pack-left em{font-style:normal;display:block;font-size:12.5px;color:var(--muted);margin-top:3px}
.pack-price{font-family:var(--font-d);font-size:21px;font-weight:800;color:var(--accent)}
.buy-btn{margin-top:4px}.toast{display:flex;align-items:center;gap:10px;padding:14px 18px;border-radius:14px;margin-bottom:18px;background:var(--green-l);color:#1a6b42;font-size:14px;font-weight:600;border:1px solid #b8e6cf}
.pay-methods{text-align:center;margin-top:24px}.pay-label{font-size:12px;color:var(--muted);display:block;margin-bottom:10px}
.pay-row{display:flex;justify-content:center;gap:8px;flex-wrap:wrap}
.pay-chip{padding:6px 14px;border-radius:8px;background:var(--card);border:1px solid var(--border);font-size:12px;font-weight:600;color:var(--muted)}

::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}

/* MODAL */
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;z-index:200;padding:20px;animation:fadeIn .2s ease}
.modal-card{width:100%;max-width:420px;background:var(--card);border-radius:24px;padding:28px;
  border:1px solid var(--border);box-shadow:0 24px 64px rgba(0,0,0,0.15);animation:slideUp .35s cubic-bezier(.4,0,.2,1)}
.modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.modal-header h3{font-family:var(--font-d);font-size:20px;font-weight:800;letter-spacing:-.02em}
.modal-tutor{display:flex;align-items:center;gap:14px;padding:16px;background:var(--bg);border-radius:14px;margin-bottom:24px}
.modal-tutor strong{display:block;font-size:15px;font-weight:700}
.modal-tutor span{font-size:12.5px;color:var(--muted)}

/* RATING STARS */
.rating-stars{display:flex;justify-content:center;gap:8px;margin-bottom:8px}
.rating-star{background:none;border:none;cursor:pointer;padding:4px;color:var(--border2);transition:all .15s;border-radius:8px}
.rating-star:hover{transform:scale(1.15)}.rating-star.filled{color:#e6a817}
.rating-label{text-align:center;font-size:14px;font-weight:600;color:var(--muted);margin-bottom:18px;height:20px}
.rating-comment{width:100%;padding:14px 16px;border-radius:14px;border:1.5px solid var(--border);background:var(--bg);
  color:var(--text);font-size:14px;font-family:var(--font-b);outline:none;resize:none;margin-bottom:18px;transition:border .2s;box-sizing:border-box}
.rating-comment:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-g)}
.rating-comment::placeholder{color:var(--muted);opacity:.6}
.rating-success{text-align:center;padding:24px 0}
.rating-success-icon{width:56px;height:56px;border-radius:50%;background:var(--green-l);color:var(--green);
  display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.rating-success h3{font-family:var(--font-d);font-size:18px;font-weight:700;margin-bottom:6px}
.rating-success p{color:var(--muted);font-size:14px}

/* SESSION ACTIONS */
.session-actions{display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)}
.session-btn{padding:7px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--card);
  font-size:12.5px;font-weight:600;font-family:var(--font-b);color:var(--muted);cursor:pointer;
  display:flex;align-items:center;gap:6px;transition:all .2s}
.session-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-l)}
.session-btn--rate{border-color:#e6a817;color:#c89200;background:rgba(230,168,23,0.06)}
.session-btn--rate:hover{background:rgba(230,168,23,0.12);color:#b08500}
.session-rated{display:flex;align-items:center;margin-left:auto}

/* PAST CHAT VIEWER */
.past-chat-badge{margin-left:auto;padding:4px 12px;border-radius:8px;background:var(--bg);
  font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.past-chat-footer{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px 18px;
  border-top:1px solid var(--border);background:var(--card);color:var(--muted);font-size:12.5px}
`;
