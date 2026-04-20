# Peer Space - Presentazione Finale

## Connetti, impara, migliora

Piattaforma di gestione del peer-tutoring per SUPSI

---

## 1. Da dove siamo partiti

### Il problema

- Gli studenti SUPSI hanno bisogno di supporto tra pari, ma non esiste un sistema strutturato per gestirlo
- I manager (coordinatori) gestivano richieste e abbinamenti in modo manuale (email, fogli Excel)
- Nessuna tracciabilità delle lezioni, delle ore, dei rimborsi
- Nessun meccanismo per valutare la qualità del tutoring

### L'idea iniziale

Creare una piattaforma che:
- Centralizzasse la gestione delle richieste di tutoring
- Automatizzasse l'abbinamento tutor-studente
- Tracciasse lezioni, ore e rimborsi
- Fornisse insight sulla qualità del servizio

### Vincoli di partenza

- Team piccolo, tempo limitato
- Budget zero
- Necessità di validare l'idea prima di investire troppo

---

## 2. Dove siamo ora

### MVP Completato

Abbiamo costruito un MVP funzionante con le seguenti funzionalità:

#### Per i Manager
| Funzionalità | Stato |
|---|---|
| Dashboard con KPI (richieste totali, aperte, lezioni completate, tutor attivi) | Fatto |
| Creazione e gestione richieste di tutoring | Fatto |
| Gestione materie | Fatto |
| Sistema di inviti con codici e scadenza | Fatto |
| Gestione tutor e assegnazione materie | Fatto |
| Report rimborsi (CHF 20/h) con breakdown per tutor | Fatto |

#### Per i Tutor
| Funzionalità | Stato |
|---|---|
| Dashboard personale con statistiche | Fatto |
| Visualizzazione richieste disponibili (swipe cards / lista) | Fatto |
| Claim delle richieste | Fatto |
| Chat con lo studente (via token unico) | Fatto |
| Completamento lezione con validazione regole | Fatto |
| Profilo con materie assegnate | Fatto |

#### Per gli Studenti
| Funzionalità | Stato |
|---|---|
| Accesso chat tramite link unico (senza registrazione) | Fatto |
| Valutazione del tutor (1-5 stelle + commento) | Fatto |

### Regole di business implementate

- Massimo 60 minuti per lezione
- Massimo 1 ora per studente per materia al giorno
- Massimo 3 ore per studente a settimana
- Giorni non consecutivi per lo stesso studente
- Rimborso automatico a CHF 20/ora

### Stack tecnologico

| Layer | Tecnologia |
|---|---|
| Framework | Next.js 16 (React 19) |
| Linguaggio | TypeScript |
| Database | SQLite + Prisma ORM |
| Autenticazione | NextAuth 5 (JWT) |
| UI | Tailwind CSS + shadcn/ui |
| Deploy | Locale (dev) |

---

## 3. Prossimi passi

### Breve termine (1-2 mesi)

- **Deploy in produzione** - Migrazione da SQLite a PostgreSQL, deploy su Vercel/Railway
- **Notifiche** - Email/push quando una richiesta viene creata o reclamata
- **Feedback loop** - Dashboard analytics per i manager con trend e pattern
- **Onboarding guidato** - Tutorial interattivo per nuovi tutor

### Medio termine (3-6 mesi)

- **Matching intelligente** - Suggerimento automatico dei tutor migliori basato su rating, disponibilità e storico
- **Calendario integrato** - Sincronizzazione con Google Calendar / Outlook
- **App mobile** - PWA o app nativa per accesso rapido
- **Multi-istituto** - Supporto per più sedi/dipartimenti SUPSI

### Lungo termine

- **AI-powered insights** - Analisi predittiva su dropout, identificazione studenti a rischio
- **Gamification** - Badge, classifiche, incentivi per i tutor
- **Espansione** - Offerta ad altre università svizzere

---

## 4. Cosa abbiamo imparato

### L'efficacia di partire piccoli (MVP)

> "Se non ti vergogni della prima versione del tuo prodotto, hai lanciato troppo tardi."

- Partire con un MVP ci ha permesso di **validare le assunzioni** prima di investire mesi di sviluppo
- Abbiamo scoperto cosa conta davvero per gli utenti (spoiler: non le feature "belle", ma quelle che funzionano)
- Il ciclo build-measure-learn accelerato ci ha risparmiato lavoro inutile
- SQLite come database di sviluppo: zero config, feedback immediato

### La difficolta e l'importanza di stabilire priorita

- Con risorse limitate, dire "no" a una feature e piu importante che dire "si"
- Abbiamo dovuto scegliere: chat in tempo reale o report rimborsi? La risposta era nei bisogni reali degli utenti
- Il framework MoSCoW (Must/Should/Could/Won't) ci ha aiutato, ma la disciplina di rispettarlo e stata la vera sfida
- Ogni feature "semplice" nasconde complessita: le regole di business per la validazione delle lezioni hanno richiesto piu tempo del previsto

### Il vero valore: struttura, incentivi e insight utili

Il valore della piattaforma non e "solo" il tutoring in se, ma:

1. **Struttura** - Un workflow chiaro (richiesta → claim → chat → lezione → valutazione) che elimina ambiguita
2. **Incentivi** - Il sistema di rimborso tracciato (CHF 20/h) e le valutazioni creano accountability
3. **Insight** - I report mostrano ai manager chi funziona, dove ci sono gap, e come allocare risorse
4. **Trasparenza** - Ogni attore vede esattamente cosa succede e cosa ci si aspetta da lui

### Dinamiche di mercato: fiducia, competitivita e pricing

- **Fiducia** - Nel peer-tutoring, la fiducia e tutto. Il sistema di rating e il processo strutturato la costruiscono gradualmente
- **Alta competitivita** - Esistono piattaforme generaliste (Superprof, Preply), ma nessuna pensata per il contesto universitario interno
- **Pricing** - CHF 20/h e competitivo per il contesto svizzero universitario, ma il vero differenziatore e l'integrazione istituzionale
- **Network effects** - Piu tutor = piu materie coperte = piu studenti attratti = piu tutor motivati (flywheel)

---

## 5. Cosa faremmo diversamente

### Coinvolgere gli utenti prima

- Avremmo dovuto fare interviste strutturate con studenti e tutor **prima** di scrivere codice
- User testing fin dalla prima settimana, non dopo il primo sprint
- Creare un prototipo clickabile (Figma) per validare il flusso prima di implementarlo

### Definire metriche di successo chiare

- "Quante richieste completate/settimana" come North Star metric fin dall'inizio
- Tracking dell'engagement (login frequency, tempo medio di risposta in chat)
- A/B testing sulle interfacce chiave (swipe vs lista per i tutor)

### Architettura piu scalabile da subito

- SQLite va bene per il prototipo, ma avremmo dovuto usare PostgreSQL da subito per evitare la migrazione
- Separare meglio frontend e backend per permettere future app mobile
- Implementare un sistema di notifiche fin da subito (e un game-changer per l'engagement)

### Processo di sviluppo

- Sprint piu corti (1 settimana invece di 2) per feedback piu rapido
- Code review obbligatorie anche in team piccoli
- CI/CD pipeline dal giorno 1 (non "lo faremo dopo")
- Documentazione delle decisioni architetturali (ADR) per non perdere il "perche" dietro le scelte

### Go-to-market

- Lanciare con un pilot group ristretto (5 tutor, 20 studenti) e iterare
- Partnership formale con il servizio studenti SUPSI fin dall'inizio
- Piano di comunicazione: il prodotto migliore non serve se nessuno sa che esiste

---

## Conclusione

Peer Space dimostra che un MVP focalizzato puo risolvere un problema reale con risorse limitate. La chiave non e stata la tecnologia, ma la **comprensione del problema** e la **disciplina nelle priorita**.

Il peer-tutoring non e solo "studenti che aiutano studenti" - e un sistema che richiede struttura, incentivi e visibilita per funzionare. La nostra piattaforma fornisce esattamente questo.

---

*Peer Space - Connetti, impara, migliora*
