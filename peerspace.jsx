import { useState, useEffect, useRef } from "react";

// ─── Mock Data ───────────────────────────────────────────────
const CURRENT_USER = { name: "Davide", email: "davide.rossi@supsi.ch", credits: 14, avatar: "D" };

const SUBJECTS = ["Analisi Matematica", "Programmazione", "Fisica", "Machine Learning", "Algoritmi", "Reti", "Basi di Dati", "Statistica", "Elettronica", "Sistemi Operativi"];

const TUTORS = [
  { id: 1, name: "Marco Bernasconi", subject: "Machine Learning", stars: 4.9, avatar: "MB", bio: "Dottorando in AI, 3 anni di esperienza in tutoring.", price: 3, sessions: 87 },
  { id: 2, name: "Elena Bentivoglio", subject: "Analisi Matematica", stars: 4.8, avatar: "EB", bio: "Laureata magistrale, appassionata di didattica.", price: 2, sessions: 124 },
  { id: 3, name: "Luca Ferretti", subject: "Programmazione", stars: 4.7, avatar: "LF", bio: "Full-stack developer e tutor part-time.", price: 3, sessions: 56 },
  { id: 4, name: "Sara Colombo", subject: "Fisica", stars: 4.6, avatar: "SC", bio: "Ricercatrice in fisica delle particelle.", price: 2, sessions: 93 },
  { id: 5, name: "Andrea Rizzi", subject: "Algoritmi", stars: 4.5, avatar: "AR", bio: "Competitive programmer, medaglia IOI.", price: 4, sessions: 41 },
  { id: 6, name: "Giulia Moretti", subject: "Statistica", stars: 4.9, avatar: "GM", bio: "Data scientist con focus su metodi bayesiani.", price: 3, sessions: 68 },
  { id: 7, name: "Tommaso Sala", subject: "Reti", stars: 4.3, avatar: "TS", bio: "Network engineer certificato Cisco.", price: 2, sessions: 35 },
  { id: 8, name: "Chiara Bianchi", subject: "Basi di Dati", stars: 4.7, avatar: "CB", bio: "DBA con esperienza in PostgreSQL e MongoDB.", price: 3, sessions: 72 },
  { id: 9, name: "Matteo Galli", subject: "Elettronica", stars: 4.4, avatar: "MG", bio: "Ingegnere elettronico, specializzato in embedded.", price: 2, sessions: 49 },
  { id: 10, name: "Valentina Conti", subject: "Sistemi Operativi", stars: 4.6, avatar: "VC", bio: "Linux kernel contributor.", price: 3, sessions: 58 },
  { id: 11, name: "Federico Rossi", subject: "Machine Learning", stars: 4.5, avatar: "FR", bio: "MLOps engineer, focus su deployment.", price: 3, sessions: 44 },
  { id: 12, name: "Alessia Marchetti", subject: "Analisi Matematica", stars: 4.2, avatar: "AM", bio: "Tutor dal primo anno, paziente e metodica.", price: 2, sessions: 110 },
];

const PAST_SESSIONS = [
  { tutor: "Marco Bernasconi", subject: "Machine Learning", date: "12 Mar 2026", time: "14:00", room: "A.1.04", price: 3, duration: "1h" },
  { tutor: "Elena Bentivoglio", subject: "Analisi Matematica", date: "08 Mar 2026", time: "10:30", room: "B.2.12", price: 2, duration: "1h 30min" },
  { tutor: "Luca Ferretti", subject: "Programmazione", date: "01 Mar 2026", time: "16:00", room: "C.0.01", price: 3, duration: "1h" },
  { tutor: "Sara Colombo", subject: "Fisica", date: "22 Feb 2026", time: "09:00", room: "A.3.08", price: 2, duration: "2h" },
  { tutor: "Giulia Moretti", subject: "Statistica", date: "15 Feb 2026", time: "11:00", room: "B.1.05", price: 3, duration: "1h" },
  { tutor: "Andrea Rizzi", subject: "Algoritmi", date: "10 Feb 2026", time: "15:30", room: "C.2.03", price: 4, duration: "1h 30min" },
];

const CREDIT_PACKS = [
  { amount: 5, price: "CHF 25", perCredit: "5.00", popular: false },
  { amount: 10, price: "CHF 45", perCredit: "4.50", popular: true },
  { amount: 20, price: "CHF 80", perCredit: "4.00", popular: false },
  { amount: 50, price: "CHF 175", perCredit: "3.50", popular: false },
];

const MOCK_MESSAGES = [
  { from: "tutor", text: "Ciao! Come posso aiutarti?", time: "14:02" },
  { from: "user", text: "Ciao, avrei bisogno di una ripetizione su le reti neurali convoluzionali.", time: "14:03" },
  { from: "tutor", text: "Certo! Possiamo vederci domani alle 14? Aula A.1.04 è libera.", time: "14:04" },
  { from: "user", text: "Perfetto, ci vediamo lì!", time: "14:05" },
];

// ─── Icons (inline SVG) ──────────────────────────────────────
const Icons = {
  Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Chat: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Coins: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  Star: ({ filled }) => <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Send: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  MapPin: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Shield: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  ArrowLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Logout: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
};

const StarRating = ({ rating, size = 16 }) => (
  <span style={{ display: "inline-flex", gap: 2, alignItems: "center", color: "var(--accent)" }}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
    <span style={{ marginLeft: 4, fontSize: size * 0.8, fontWeight: 600, color: "var(--text)" }}>{rating}</span>
  </span>
);

// ─── Pages ───────────────────────────────────────────────────

// LOGIN
function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!email || !password || (mode === "register" && !name)) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setLoading(true);
    setTimeout(() => onLogin(), 900);
  };

  const handleSwitch = () => {
    setLoading(true);
    setTimeout(() => onLogin(), 1200);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 440, animation: "fadeUp .6s ease" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#fff",
              boxShadow: "0 4px 20px var(--accent-glow)"
            }}>P</div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>PeerSpace</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14, fontFamily: "var(--font-body)", margin: 0 }}>Ripetizioni peer-to-peer per la tua università</p>
        </div>

        {/* Card */}
        <div className={shake ? "shake" : ""} style={{
          background: "var(--card)", borderRadius: 20, padding: "36px 32px",
          border: "1px solid var(--border)", boxShadow: "0 8px 40px rgba(0,0,0,0.08)"
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 28, background: "var(--bg)", borderRadius: 12, padding: 4 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "10px 0", border: "none", borderRadius: 10, cursor: "pointer",
                fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, transition: "all .2s",
                background: mode === m ? "var(--card)" : "transparent",
                color: mode === m ? "var(--text)" : "var(--text-muted)",
                boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.06)" : "none"
              }}>{m === "login" ? "Accedi" : "Registrati"}</button>
            ))}
          </div>

          {mode === "register" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, fontFamily: "var(--font-body)" }}>Nome completo</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Mario Rossi" style={{
                width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border)",
                background: "var(--bg)", color: "var(--text)", fontSize: 15, fontFamily: "var(--font-body)",
                outline: "none", boxSizing: "border-box", transition: "border .2s"
              }} onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, fontFamily: "var(--font-body)" }}>Email universitaria</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="nome.cognome@supsi.ch" type="email" style={{
              width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border)",
              background: "var(--bg)", color: "var(--text)", fontSize: 15, fontFamily: "var(--font-body)",
              outline: "none", boxSizing: "border-box", transition: "border .2s"
            }} onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6, fontFamily: "var(--font-body)" }}>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" style={{
              width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border)",
              background: "var(--bg)", color: "var(--text)", fontSize: 15, fontFamily: "var(--font-body)",
              outline: "none", boxSizing: "border-box", transition: "border .2s"
            }} onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", padding: "14px 0", borderRadius: 14, border: "none", cursor: "pointer",
            background: "var(--accent)", color: "#fff", fontSize: 15, fontWeight: 700,
            fontFamily: "var(--font-body)", transition: "all .2s", opacity: loading ? 0.7 : 1,
            boxShadow: "0 4px 16px var(--accent-glow)"
          }}>
            {loading ? "Caricamento..." : mode === "login" ? "Accedi" : "Crea account"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>oppure</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* SWITCHedulogin */}
          <button onClick={handleSwitch} disabled={loading} style={{
            width: "100%", padding: "14px 0", borderRadius: 14, border: "2px solid var(--border)",
            cursor: "pointer", background: "var(--card)", color: "var(--text)", fontSize: 14, fontWeight: 600,
            fontFamily: "var(--font-body)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "all .2s"
          }}>
            <Icons.Shield />
            <span>Accedi con <strong>SWITCHedu</strong></span>
          </button>

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 16, fontFamily: "var(--font-body)", lineHeight: 1.5 }}>
            Accesso federato tramite il portale universitario svizzero
          </p>
        </div>
      </div>
    </div>
  );
}

// HOME
function HomePage({ user, navigate }) {
  const topTutors = [...TUTORS].sort((a, b) => b.stars - a.stars).slice(0, 6);

  return (
    <div style={{ padding: "24px 20px 100px", maxWidth: 700, margin: "0 auto", animation: "fadeUp .5s ease" }}>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>
          Ciao, {user.name} <span style={{ display: "inline-block", animation: "wave 1.8s ease infinite" }}>👋</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15, margin: "6px 0 0", fontFamily: "var(--font-body)" }}>Pronto per la prossima sessione?</p>
      </div>

      {/* Credits Card */}
      <div style={{
        background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
        borderRadius: 20, padding: "24px 28px", marginBottom: 32, color: "#fff", position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px var(--accent-glow)"
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", bottom: -20, right: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.85, margin: "0 0 4px", fontFamily: "var(--font-body)", letterSpacing: "0.05em", textTransform: "uppercase" }}>I tuoi crediti</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em" }}>{user.credits}</span>
          <span style={{ fontSize: 16, opacity: 0.8, fontFamily: "var(--font-body)" }}>crediti disponibili</span>
        </div>
        <button onClick={() => navigate("credits")} style={{
          marginTop: 16, padding: "10px 22px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.35)",
          background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, fontWeight: 700,
          fontFamily: "var(--font-body)", cursor: "pointer", backdropFilter: "blur(10px)", transition: "all .2s"
        }}>Ricarica crediti</button>
      </div>

      {/* Top Tutors */}
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>Migliori tutor</h2>
        <button onClick={() => navigate("search")} style={{
          background: "none", border: "none", color: "var(--accent)", fontSize: 14, fontWeight: 600,
          fontFamily: "var(--font-body)", cursor: "pointer"
        }}>Vedi tutti →</button>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {topTutors.map((t, i) => (
          <div key={t.id} onClick={() => navigate("chat", t)} style={{
            background: "var(--card)", borderRadius: 16, padding: "18px 20px",
            border: "1px solid var(--border)", cursor: "pointer", transition: "all .2s",
            display: "flex", alignItems: "center", gap: 16, animation: `fadeUp .5s ease ${i * 0.06}s both`
          }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
             onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: `hsl(${t.id * 37}, 55%, 92%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: `hsl(${t.id * 37}, 45%, 40%)`,
              flexShrink: 0
            }}>{t.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{t.name}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-body)", marginTop: 2 }}>{t.subject}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <StarRating rating={t.stars} size={14} />
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-body)", marginTop: 4 }}>{t.price} crediti/h</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// SEARCH
function SearchPage({ navigate }) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [minStars, setMinStars] = useState(0);

  const filtered = TUTORS.filter(t => {
    if (query && !t.name.toLowerCase().includes(query.toLowerCase()) && !t.subject.toLowerCase().includes(query.toLowerCase())) return false;
    if (subject && t.subject !== subject) return false;
    if (minStars && t.stars < minStars) return false;
    return true;
  });

  return (
    <div style={{ padding: "24px 20px 100px", maxWidth: 700, margin: "0 auto", animation: "fadeUp .5s ease" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)", margin: "0 0 20px", letterSpacing: "-0.03em" }}>Cerca tutor</h1>

      {/* Search Bar */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}><Icons.Search /></div>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cerca per nome o materia..." style={{
          width: "100%", padding: "14px 16px 14px 48px", borderRadius: 14, border: "1px solid var(--border)",
          background: "var(--card)", color: "var(--text)", fontSize: 15, fontFamily: "var(--font-body)",
          outline: "none", boxSizing: "border-box", transition: "border .2s"
        }} onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <select value={subject} onChange={e => setSubject(e.target.value)} style={{
          padding: "10px 16px", borderRadius: 12, border: "1px solid var(--border)",
          background: "var(--card)", color: "var(--text)", fontSize: 14, fontFamily: "var(--font-body)",
          outline: "none", cursor: "pointer", minWidth: 180
        }}>
          <option value="">Tutte le materie</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={minStars} onChange={e => setMinStars(Number(e.target.value))} style={{
          padding: "10px 16px", borderRadius: 12, border: "1px solid var(--border)",
          background: "var(--card)", color: "var(--text)", fontSize: 14, fontFamily: "var(--font-body)",
          outline: "none", cursor: "pointer"
        }}>
          <option value={0}>Qualsiasi voto</option>
          <option value={4}>★ 4+</option>
          <option value={4.5}>★ 4.5+</option>
          <option value={4.8}>★ 4.8+</option>
        </select>
      </div>

      <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-body)", marginBottom: 16 }}>{filtered.length} tutor trovati</p>

      {/* Results */}
      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map((t, i) => (
          <div key={t.id} onClick={() => navigate("chat", t)} style={{
            background: "var(--card)", borderRadius: 16, padding: "20px",
            border: "1px solid var(--border)", cursor: "pointer", transition: "all .2s",
            animation: `fadeUp .4s ease ${i * 0.04}s both`
          }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
             onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, background: `hsl(${t.id * 37}, 55%, 92%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800, color: `hsl(${t.id * 37}, 45%, 40%)`,
                flexShrink: 0
              }}>{t.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{t.name}</div>
                <div style={{ fontSize: 13, color: "var(--accent)", fontFamily: "var(--font-body)", fontWeight: 600, marginTop: 2 }}>{t.subject}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-body)", marginTop: 4 }}>{t.bio}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <StarRating rating={t.stars} size={14} />
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-body)", marginTop: 6 }}>{t.price} cred/h</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-body)", marginTop: 2 }}>{t.sessions} sessioni</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// CHAT
function ChatPage({ tutor, navigate }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const now = new Date();
    setMessages(prev => [...prev, { from: "user", text: input, time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}` }]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { from: "tutor", text: "Ricevuto! Ti confermo a breve 👍", time: `${now.getHours()}:${String(now.getMinutes() + 1).padStart(2, "0")}` }]);
    }, 1200);
  };

  if (!tutor) {
    return (
      <div style={{ padding: "24px 20px 100px", maxWidth: 700, margin: "0 auto", animation: "fadeUp .5s ease" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)", margin: "0 0 12px" }}>Chat</h1>
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)", fontSize: 15 }}>Seleziona un tutor dalla home o dalla ricerca per iniziare una conversazione.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 72px)", maxWidth: 700, margin: "0 auto", animation: "fadeUp .4s ease" }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--card)",
        display: "flex", alignItems: "center", gap: 14
      }}>
        <button onClick={() => navigate("home")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}><Icons.ArrowLeft /></button>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: `hsl(${tutor.id * 37}, 55%, 92%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, color: `hsl(${tutor.id * 37}, 45%, 40%)`
        }}>{tutor.avatar}</div>
        <div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{tutor.name}</div>
          <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-body)", fontWeight: 600 }}>{tutor.subject} · {tutor.price} cred/h</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.from === "user" ? "flex-end" : "flex-start",
            maxWidth: "75%", animation: `fadeUp .3s ease ${i * 0.05}s both`
          }}>
            <div style={{
              padding: "12px 16px", borderRadius: 18,
              borderBottomRightRadius: m.from === "user" ? 6 : 18,
              borderBottomLeftRadius: m.from === "tutor" ? 6 : 18,
              background: m.from === "user" ? "var(--accent)" : "var(--card)",
              color: m.from === "user" ? "#fff" : "var(--text)",
              border: m.from === "tutor" ? "1px solid var(--border)" : "none",
              fontSize: 15, fontFamily: "var(--font-body)", lineHeight: 1.45
            }}>{m.text}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, textAlign: m.from === "user" ? "right" : "left", fontFamily: "var(--font-body)", padding: "0 4px" }}>{m.time}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 20px 24px", borderTop: "1px solid var(--border)", background: "var(--card)", display: "flex", gap: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Scrivi un messaggio..." style={{
            flex: 1, padding: "14px 18px", borderRadius: 16, border: "1px solid var(--border)",
            background: "var(--bg)", color: "var(--text)", fontSize: 15, fontFamily: "var(--font-body)",
            outline: "none", boxSizing: "border-box"
          }} onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
        <button onClick={send} style={{
          width: 48, height: 48, borderRadius: 14, border: "none", background: "var(--accent)",
          color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, boxShadow: "0 4px 12px var(--accent-glow)", transition: "transform .15s"
        }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.93)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}><Icons.Send /></button>
      </div>
    </div>
  );
}

// ACCOUNT
function AccountPage({ user, navigate }) {
  return (
    <div style={{ padding: "24px 20px 100px", maxWidth: 700, margin: "0 auto", animation: "fadeUp .5s ease" }}>
      {/* Profile Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#fff",
          boxShadow: "0 4px 20px var(--accent-glow)"
        }}>{user.avatar}</div>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--text)", margin: 0 }}>{user.name}</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "var(--font-body)", margin: "2px 0 0" }}>{user.email}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 }}>
        {[
          { label: "Crediti", value: user.credits, color: "var(--accent)" },
          { label: "Sessioni", value: PAST_SESSIONS.length, color: "hsl(150, 55%, 45%)" },
          { label: "Tutor", value: new Set(PAST_SESSIONS.map(s => s.tutor)).size, color: "hsl(280, 55%, 55%)" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "var(--card)", borderRadius: 16, padding: "18px 16px", textAlign: "center",
            border: "1px solid var(--border)"
          }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: 600, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Past Sessions */}
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>Ripetizioni passate</h2>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {PAST_SESSIONS.map((s, i) => (
          <div key={i} style={{
            background: "var(--card)", borderRadius: 16, padding: "18px 20px",
            border: "1px solid var(--border)", animation: `fadeUp .4s ease ${i * 0.05}s both`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{s.tutor}</div>
                <div style={{ fontSize: 13, color: "var(--accent)", fontFamily: "var(--font-body)", fontWeight: 600, marginTop: 2 }}>{s.subject}</div>
              </div>
              <div style={{
                padding: "4px 12px", borderRadius: 8, background: "var(--accent-light)",
                fontSize: 13, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-body)"
              }}>{s.price} crediti</div>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                { icon: <Icons.Calendar />, text: s.date },
                { icon: <Icons.Clock />, text: `${s.time} · ${s.duration}` },
                { icon: <Icons.MapPin />, text: `Aula ${s.room}` },
              ].map((d, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                  {d.icon} {d.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button onClick={() => navigate("logout")} style={{
        marginTop: 32, width: "100%", padding: "14px 0", borderRadius: 14, border: "1px solid var(--border-strong)",
        background: "var(--card)", color: "var(--danger)", fontSize: 15, fontWeight: 600,
        fontFamily: "var(--font-body)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
      }}><Icons.Logout /> Esci dall'account</button>
    </div>
  );
}

// CREDITS
function CreditsPage({ user }) {
  const [selected, setSelected] = useState(null);
  const [purchased, setPurchased] = useState(false);

  const buy = () => {
    if (selected === null) return;
    setPurchased(true);
    setTimeout(() => setPurchased(false), 2500);
  };

  return (
    <div style={{ padding: "24px 20px 100px", maxWidth: 700, margin: "0 auto", animation: "fadeUp .5s ease" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)", margin: "0 0 8px", letterSpacing: "-0.03em" }}>Acquista crediti</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 15, fontFamily: "var(--font-body)", margin: "0 0 24px" }}>Saldo attuale: <strong style={{ color: "var(--accent)" }}>{user.credits} crediti</strong></p>

      {purchased && (
        <div style={{
          background: "hsl(150, 55%, 93%)", borderRadius: 14, padding: "14px 20px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 10, border: "1px solid hsl(150, 55%, 80%)",
          color: "hsl(150, 45%, 30%)", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
          animation: "fadeUp .3s ease"
        }}><Icons.Check /> Crediti acquistati con successo!</div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {CREDIT_PACKS.map((p, i) => (
          <div key={i} onClick={() => setSelected(i)} style={{
            background: "var(--card)", borderRadius: 18, padding: "22px 24px",
            border: selected === i ? "2px solid var(--accent)" : "1px solid var(--border)",
            cursor: "pointer", transition: "all .2s", position: "relative",
            boxShadow: selected === i ? "0 4px 20px var(--accent-glow)" : "none",
            animation: `fadeUp .4s ease ${i * 0.06}s both`
          }}>
            {p.popular && (
              <div style={{
                position: "absolute", top: -1, right: 20, padding: "4px 14px",
                background: "var(--accent)", borderRadius: "0 0 10 10", borderTopLeftRadius: 0, borderTopRightRadius: 0,
                borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
                fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "var(--font-body)", letterSpacing: "0.03em", textTransform: "uppercase"
              }}>Più scelto</div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--text)" }}>
                  {p.amount} <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text-muted)" }}>crediti</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-body)", marginTop: 4 }}>CHF {p.perCredit} per credito</div>
              </div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--accent)"
              }}>{p.price}</div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={buy} disabled={selected === null} style={{
        marginTop: 24, width: "100%", padding: "16px 0", borderRadius: 16, border: "none",
        background: selected !== null ? "var(--accent)" : "var(--border)", color: "#fff", fontSize: 16, fontWeight: 700,
        fontFamily: "var(--font-body)", cursor: selected !== null ? "pointer" : "default",
        boxShadow: selected !== null ? "0 4px 20px var(--accent-glow)" : "none", transition: "all .3s"
      }}>
        {selected !== null ? `Acquista ${CREDIT_PACKS[selected].amount} crediti per ${CREDIT_PACKS[selected].price}` : "Seleziona un pacchetto"}
      </button>

      {/* Payment Methods */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-body)", marginBottom: 8 }}>Metodi di pagamento accettati</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          {["TWINT", "Visa", "Mastercard", "PostFinance"].map(m => (
            <span key={m} style={{
              padding: "6px 14px", borderRadius: 8, background: "var(--card)", border: "1px solid var(--border)",
              fontSize: 12, fontWeight: 600, color: "var(--text-muted)", fontFamily: "var(--font-body)"
            }}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("home");
  const [chatTutor, setChatTutor] = useState(null);

  const navigate = (p, data) => {
    if (p === "logout") { setLoggedIn(false); setPage("home"); return; }
    if (p === "chat" && data) setChatTutor(data);
    setPage(p);
  };

  if (!loggedIn) return (
    <>
      <style>{globalStyles}</style>
      <LoginPage onLogin={() => setLoggedIn(true)} />
    </>
  );

  const tabs = [
    { id: "home", label: "Home", icon: <Icons.Home /> },
    { id: "search", label: "Cerca", icon: <Icons.Search /> },
    { id: "chat", label: "Chat", icon: <Icons.Chat /> },
    { id: "credits", label: "Crediti", icon: <Icons.Coins /> },
    { id: "account", label: "Account", icon: <Icons.User /> },
  ];

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        {/* Page Content */}
        {page === "home" && <HomePage user={CURRENT_USER} navigate={navigate} />}
        {page === "search" && <SearchPage navigate={navigate} />}
        {page === "chat" && <ChatPage tutor={chatTutor} navigate={navigate} />}
        {page === "credits" && <CreditsPage user={CURRENT_USER} />}
        {page === "account" && <AccountPage user={CURRENT_USER} navigate={navigate} />}

        {/* Bottom Tab Bar */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--card)",
          borderTop: "1px solid var(--border)", display: "flex", justifyContent: "center",
          padding: "0 8px", zIndex: 100, backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)", backgroundColor: "var(--card-blur)"
        }}>
          <div style={{ display: "flex", maxWidth: 500, width: "100%" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => navigate(t.id)} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "10px 0 12px", border: "none", background: "none", cursor: "pointer",
                color: page === t.id ? "var(--accent)" : "var(--text-muted)", transition: "color .2s",
                position: "relative"
              }}>
                {page === t.id && <div style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: 20, height: 3, borderRadius: 2, background: "var(--accent)"
                }} />}
                {t.icon}
                <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "var(--font-body)" }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  :root {
    --font-display: 'Outfit', sans-serif;
    --font-body: 'Plus Jakarta Sans', sans-serif;
    --bg: #F5F3F0;
    --card: #FFFFFF;
    --card-blur: rgba(255,255,255,0.82);
    --border: #E8E4DF;
    --border-strong: #D5D0CA;
    --text: #1A1714;
    --text-muted: #8A847D;
    --accent: #E85D2A;
    --accent-dark: #C94A1E;
    --accent-light: #FFF0EB;
    --accent-glow: rgba(232, 93, 42, 0.2);
    --danger: #D94444;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #141210;
      --card: #1E1C19;
      --card-blur: rgba(30,28,25,0.85);
      --border: #2E2B26;
      --border-strong: #3E3A34;
      --text: #F0EDE8;
      --text-muted: #7A756E;
      --accent: #F07040;
      --accent-dark: #E85D2A;
      --accent-light: rgba(240, 112, 64, 0.12);
      --accent-glow: rgba(240, 112, 64, 0.25);
      --danger: #F06060;
    }
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: var(--bg); -webkit-font-smoothing: antialiased; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(20deg); }
    50% { transform: rotate(-10deg); }
    75% { transform: rotate(15deg); }
  }

  .shake {
    animation: shake 0.5s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }

  input::placeholder, textarea::placeholder {
    color: var(--text-muted);
    opacity: 0.6;
  }

  select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238A847D' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px !important; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
`;
