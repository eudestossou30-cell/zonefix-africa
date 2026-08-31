import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  Wifi, Bot, ShieldCheck, Users, Radio, Gauge, Menu, X, ArrowRight,
  CheckCircle2, AlertTriangle, Router, Activity, Cpu, MemoryStick,
  RefreshCw, Wrench, CreditCard, LogOut, Plus, Lock, Eye, EyeOff
} from 'lucide-react';
import api from './api';

const blue = '#087cff';

function Logo() {
  return <Link to="/" className="logo"><span className="logo-mark"><Wifi size={25}/></span><span>ZONEFIX <b>AFRICA</b></span></Link>;
}

function Header({ onLogin }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <Logo />
      <button className="mobile-menu" onClick={() => setOpen(v => !v)}>{open ? <X/> : <Menu/>}</button>
      <nav className={open ? 'nav open' : 'nav'}>
        <a href="#accueil">Accueil</a>
        <a href="#fonctionnalites">Fonctionnalités</a>
        <a href="#tarifs">Tarifs</a>
        <a href="#techniciens">Techniciens</a>
        <a href="#apropos">À propos</a>
        <a href="#contact">Contact</a>
        <button className="btn btn-primary btn-small" onClick={onLogin}>Se connecter</button>
      </nav>
    </header>
  );
}

function Landing({ onLogin }) {
  return (
    <div className="landing">
      <Header onLogin={onLogin}/>
      <main>
        <section id="accueil" className="hero section-shell">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pulse-dot"/> SERVICE TECHNIQUE DES WI‑FI ZONES AFRICAINES</div>
            <h1>Votre Wi‑Fi Zone.<br/><span>Notre expertise.</span></h1>
            <p className="hero-lead">Une panne ? Un problème réseau ?<br/>Ne restez plus bloqué.</p>
            <div className="divider"/>
            <p>Diagnostiquez votre problème avec notre assistant IA et obtenez une solution étape par étape.</p>
            <p>Et si l’IA ne suffit pas, un technicien qualifié prend le relais.</p>

            <div className="feature-stack">
              <Feature icon={<Bot/>} tone="blue" title="DIAGNOSTIC IA" text="Obtenez une solution instantanée grâce à notre assistant intelligent."/>
              <Feature icon={<Users/>} tone="green" title="TECHNICIENS QUALIFIÉS" text="Nos experts interviennent à distance ou sur site si nécessaire."/>
              <Feature icon={<Wifi/>} tone="purple" title="SUPPORT WI‑FI ZONE" text="Spécialistes MikroTik, Starlink, LiteBeam, Ubiquiti et réseaux."/>
            </div>
          </div>
          <div className="hero-visual">
            <div className="network-grid"/>
            <div className="orb orb-a"/>
            <div className="orb orb-b"/>
            <div className="tech-card">
              <div className="helmet">ZONEFIX</div>
              <div className="person">
                <div className="head"/>
                <div className="body"/>
                <div className="arm arm-left"/>
                <div className="arm arm-right"/>
              </div>
              <div className="antenna antenna-a"/>
              <div className="antenna antenna-b"/>
              <div className="router-box">MikroTik</div>
              <div className="radio-box">Ubiquiti</div>
              <div className="dish"/>
            </div>
            <div className="visual-badge"><Activity size={17}/> Réseau surveillé</div>
          </div>
        </section>

        <section className="cta-strip section-shell">
          <div><h2>Votre connexion doit rester <span>en ligne.</span></h2></div>
          <div className="cta-actions">
            <Link to="/diagnostic" className="btn btn-primary"><Bot size={19}/> DIAGNOSTIQUER MA PANNE</Link>
            <a href="#techniciens" className="btn btn-outline"><Users size={19}/> JE SUIS TECHNICIEN</a>
          </div>
        </section>

        <section id="tarifs" className="pricing section-shell">
          <div className="section-heading"><span>UN SEUL ABONNEMENT</span><h2>Simple. Clair. Accessible.</h2></div>
          <div className="pricing-grid">
            <PriceCard type="Propriétaire Wi‑Fi Zone" price="5 000" icon={<Users/>} tone="blue" items={['Diagnostic IA illimité','Support technique','Suivi de vos tickets','Conseils & optimisation']}/>
            <PriceCard type="Technicien" price="5 000" icon={<Wrench/>} tone="green" items={['Accès aux tickets','Outils de diagnostic','Interventions à distance','Plus de clients, plus d’opportunités']}/>
          </div>
        </section>

        <section id="fonctionnalites" className="trust section-shell">
          <Trust icon={<Gauge/>} title="RAPIDE" text="Réponse immédiate 24/7"/>
          <Trust icon={<Lock/>} title="SÉCURISÉ" text="Données protégées et confidentielles"/>
          <Trust icon={<ShieldCheck/>} title="FIABLE" text="Techniciens vérifiés et qualifiés"/>
          <Trust icon={<Radio/>} title="DISPONIBLE" text="Partout en Afrique"/>
        </section>

        <section id="techniciens" className="mini-section section-shell">
          <div>
            <span className="section-kicker">POUR LES TECHNICIENS</span>
            <h2>Transformez votre expertise réseau en opportunités.</h2>
            <p>Recevez des demandes qualifiées, consultez le diagnostic IA et intervenez avec un dossier technique complet.</p>
          </div>
          <div className="stat-card"><strong>5 000 FCFA</strong><span>/ mois</span><small>Accès aux demandes</small></div>
        </section>
      </main>
      <Footer/>
    </div>
  );
}

function Feature({ icon, title, text, tone }) {
  return <div className="feature-row"><div className={`feature-icon ${tone}`}>{icon}</div><div><strong>{title}</strong><p>{text}</p></div></div>
}
function PriceCard({ type, price, icon, tone, items }) {
  return <div className={`price-card ${tone}`}><div className="price-icon">{icon}</div><div><span className="muted">{type}</span><div className="price">{price} <small>FCFA</small> <em>/ mois</em></div>{items.map(i => <div className="check" key={i}><CheckCircle2 size={15}/>{i}</div>)}</div></div>
}
function Trust({ icon, title, text }) { return <div className="trust-item"><div className="trust-icon">{icon}</div><div><strong>{title}</strong><span>{text}</span></div></div> }
function Footer() { return <footer id="contact"><div className="footer-grid section-shell"><div><Logo/><p>La solution intelligente pour les Wi‑Fi Zones africaines.</p></div><div><strong>LIENS RAPIDES</strong><a href="#accueil">Accueil</a><a href="#fonctionnalites">Fonctionnalités</a><a href="#tarifs">Tarifs</a><a href="#techniciens">Techniciens</a></div><div><strong>SUPPORT</strong><span>Centre d'aide</span><span>Nous contacter</span><span>Devenir technicien</span><span>Conditions d'utilisation</span></div><div><strong>CONTACT</strong><span>+229 01 23 45 67 89</span><span>support@zonefix-africa.com</span><span>Disponible partout en Afrique</span></div></div></footer> }

function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'demo@zonefix.africa', password:'ZoneFix123!', role:'OWNER' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const r = mode === 'login' ? await api.post('/auth/login', { email:form.email, password:form.password }) : await api.post('/auth/register', form);
      localStorage.setItem('zonefix_token', r.data.token);
      nav('/dashboard');
    } catch (e) { setError(e.response?.data?.error || 'Une erreur est survenue'); }
    finally { setBusy(false); }
  };

  return <div className="auth-page"><div className="auth-glow"/><div className="auth-card">
    <Logo/><h1>{mode === 'login' ? 'Bienvenue sur ZoneFix' : 'Créer votre compte'}</h1><p>{mode === 'login' ? 'Accédez à votre espace de dépannage.' : 'Commencez avec l’abonnement unique de 5 000 FCFA/mois.'}</p>
    {error && <div className="error">{error}</div>}
    <form onSubmit={submit}>
      {mode === 'register' && <div className="two-cols"><label>Prénom<input value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})}/></label><label>Nom<input value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})}/></label></div>}
      <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label>Mot de passe<div className="password"><input type={show?'text':'password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</button></div></label>
      {mode === 'register' && <label>Rôle<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="OWNER">Propriétaire</option><option value="TECHNICIAN">Technicien</option></select></label>}
      <button className="btn btn-primary full" disabled={busy}>{busy?'Connexion...':mode==='login'?'Se connecter':'Créer mon compte'} <ArrowRight size={18}/></button>
    </form>
    <button className="switch" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?'Créer un compte':'J’ai déjà un compte'}</button>
    <Link className="back" to="/">← Retour à l’accueil</Link>
  </div></div>
}

function Dashboard() {
  const nav = useNavigate();
  const [data,setData]=useState(null); const [busy,setBusy]=useState(true); const [mobile,setMobile]=useState(false);
  useEffect(()=>{ api.get('/dashboard').then(r=>setData(r.data)).catch(()=>nav('/login')).finally(()=>setBusy(false)); },[]);
  if (busy) return <Loading/>;
  if (!data) return null;
  if (data.user.role === 'TECHNICIAN') return <TechnicianDashboard user={data.user}/>;
  if (data.user.role === 'ADMIN') return <AdminDashboard user={data.user}/>;
  return <OwnerDashboard data={data} mobile={mobile} setMobile={setMobile}/>;
}

function OwnerDashboard({data,mobile,setMobile}) {
  const nav=useNavigate();
  const [setup,setSetup]=useState(false);
  const [zone,setZone]=useState({name:'',city:data.user.city||'Cotonou',district:data.user.district||'',provider:'Starlink'});
  const [mk,setMk]=useState({name:'MikroTik principal',host:'192.168.88.1',port:8728,username:'zonefix',password:''});
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');

  const createZone=async e=>{
    e.preventDefault(); setSaving(true); setMessage('');
    try { await api.post('/zones',zone); setMessage('Wi‑Fi Zone créée.'); location.reload(); }
    catch(e){setMessage(e.response?.data?.error||'Création impossible');} finally{setSaving(false);}
  };
  const createMikrotik=async e=>{
    e.preventDefault(); setSaving(true); setMessage('');
    try { await api.post('/mikrotiks',{...mk,zoneId:data.zones[0].id,port:Number(mk.port),ssl:false}); setMessage('MikroTik enregistré.'); location.reload(); }
    catch(e){setMessage(e.response?.data?.error||'Connexion impossible');} finally{setSaving(false);}
  };

  return <div className="app-shell">
    <aside className={mobile?'sidebar mobile-open':'sidebar'}><Logo/><div className="side-menu">
      <SideLink to="/dashboard" icon={<Gauge/>} text="Tableau de bord"/>
      <SideLink to="/diagnostic" icon={<Bot/>} text="Diagnostiquer une panne"/>
      <SideLink to="/dashboard" icon={<Wifi/>} text="Mes Wi‑Fi Zones"/>
      <SideLink to="/dashboard" icon={<Router/>} text="Mes équipements"/>
      <SideLink to="/dashboard" icon={<Wrench/>} text="Mes interventions"/>
      <SideLink to="/dashboard" icon={<CreditCard/>} text="Mon abonnement"/>
    </div><div className="side-bottom"><div className="side-user"><div className="avatar">{data.user.firstName[0]}</div><div><strong>{data.user.firstName} {data.user.lastName}</strong><span>PROPRIÉTAIRE</span></div></div><button onClick={()=>{localStorage.removeItem('zonefix_token');nav('/')}}><LogOut size={17}/> Déconnexion</button></div></aside>
    <main className="dashboard-main">
      <div className="topbar"><button className="mobile-menu dash" onClick={()=>setMobile(!mobile)}><Menu/></button><div><span className="section-kicker">ZONEFIX AFRICA</span><h1>Bonjour, {data.user.firstName} 👋</h1></div><div className="top-actions"><div className={`sub-pill ${data.subscription?.status==='ACTIVE'?'active':''}`}><span/> Abonnement {data.subscription?.status==='ACTIVE'?'actif':'à activer'}</div><button className="icon-btn"><BellIcon/></button></div></div>

      <section className="dashboard-grid">
        <div className="main-column">
          <div className="zone-health card"><div className="card-head"><div><span className="section-kicker">MA WI‑FI ZONE</span><h2>{data.zones[0]?.name || 'Aucune Wi‑Fi Zone'}</h2></div><div className="online"><span/> {data.zones[0]?.status==='ONLINE'?'Fonctionnelle':'Attention'}</div></div>
            <div className="health-content"><div className="score"><div className="score-ring"><strong>{data.zones[0]?.healthScore || 0}</strong><span>/100</span></div><span>Score de santé</span></div>
              <div className="metrics"><Metric icon={<Router/>} label="MikroTik" value={data.zones[0]?.mikrotiks?.[0]?.online?'Connecté':'Non connecté'}/><Metric icon={<Users/>} label="Clients" value={data.zones[0]?.clients || 0}/><Metric icon={<Activity/>} label="Internet" value="En ligne"/><Metric icon={<Radio/>} label="Provider" value={data.zones[0]?.provider || '—'}/></div>
            </div><Link to="/diagnostic" className="btn btn-primary full"><Bot size={19}/> DIAGNOSTIC IA</Link>
          </div>

          {data.subscription?.status !== 'ACTIVE' && <div className="card payment-card"><div className="card-head"><div><span className="section-kicker">ABONNEMENT</span><h2>Activez ZoneFix — 5 000 FCFA/mois</h2></div><CreditCard/></div><p className="muted small-text">Paiement sécurisé par Mobile Money du Bénin : MTN Mobile Money, Moov Money ou Celtiis Cash.</p><Link to="/payment" className="btn btn-primary full"><CreditCard size={18}/> PAYER 5 000 FCFA</Link></div>}

          {!data.zones.length && <div className="card"><div className="card-head"><div><span className="section-kicker">PREMIER DÉMARRAGE</span><h2>Créer votre Wi‑Fi Zone</h2></div></div>
            <form className="setup-form" onSubmit={createZone}><div className="two-cols"><label>Nom<input required value={zone.name} onChange={e=>setZone({...zone,name:e.target.value})}/></label><label>Ville<input required value={zone.city} onChange={e=>setZone({...zone,city:e.target.value})}/></label></div><label>Quartier<input value={zone.district} onChange={e=>setZone({...zone,district:e.target.value})}/></label><label>Fournisseur Internet<select value={zone.provider} onChange={e=>setZone({...zone,provider:e.target.value})}><option>Starlink</option><option>Fibre</option><option>4G/5G</option><option>Autre</option></select></label><button className="btn btn-primary full" disabled={saving}><Plus/> Créer ma Wi‑Fi Zone</button></form>
          </div>}

          {data.zones[0] && !data.zones[0].mikrotiks.length && <div className="card"><div className="card-head"><div><span className="section-kicker">CONNEXION MIKROTIK</span><h2>Ajouter mon MikroTik</h2></div><Router/></div>
            <p className="muted small-text">Les identifiants sont chiffrés côté serveur. Pour le MVP, le serveur doit pouvoir joindre l’IP du routeur sur l’API RouterOS.</p>
            <form className="setup-form" onSubmit={createMikrotik}><div className="two-cols"><label>Nom<input value={mk.name} onChange={e=>setMk({...mk,name:e.target.value})}/></label><label>Adresse/IP<input value={mk.host} onChange={e=>setMk({...mk,host:e.target.value})}/></label></div><div className="two-cols"><label>Port API<input type="number" value={mk.port} onChange={e=>setMk({...mk,port:e.target.value})}/></label><label>Utilisateur<input value={mk.username} onChange={e=>setMk({...mk,username:e.target.value})}/></label></div><label>Mot de passe<input type="password" value={mk.password} onChange={e=>setMk({...mk,password:e.target.value})}/></label>{message&&<div className="setup-message">{message}</div>}<button className="btn btn-primary full" disabled={saving}><Router/> Enregistrer le MikroTik</button></form>
          </div>}

          <div className="card"><div className="card-head"><div><span className="section-kicker">ÉQUIPEMENTS</span><h2>Votre infrastructure</h2></div><button className="icon-btn" onClick={()=>setSetup(!setup)}><Plus/></button></div>
            {data.zones[0]?.mikrotiks?.length ? data.zones[0].mikrotiks.map(m=><div className="equipment-row" key={m.id}><div className="equip-icon"><Router/></div><div><strong>{m.name}</strong><span>{m.host} · RouterOS {m.routerVersion||'—'}</span></div><span className={m.online?'status-dot online-dot':'status-dot'}>{m.online?'En ligne':'Hors ligne'}</span></div>) : <div className="empty">Ajoutez votre premier MikroTik pour activer la supervision.</div>}
          </div>
        </div>

        <div className="right-column"><div className="card quick-card"><span className="section-kicker">ACCÈS RAPIDE</span><h2>Besoin d’aide ?</h2><p>Lancez un diagnostic guidé par IA ou demandez un technicien.</p><Link to="/diagnostic" className="btn btn-primary full">Diagnostiquer <ArrowRight size={17}/></Link><div className="quick-line"><ShieldCheck size={18}/> Actions sensibles protégées</div></div>
          <div className="card"><div className="card-head"><div><span className="section-kicker">ABONNEMENT</span><h2>5 000 FCFA</h2></div></div><p className="muted">Accès aux outils ZoneFix pendant 30 jours.</p><div className="sub-progress"><span/></div><small>Paiement Mobile Money sécurisé via FedaPay.</small><Link to="/payment" className="btn btn-outline full" style={{marginTop:12}}>Gérer mon paiement <ArrowRight size={15}/></Link></div>
          <div className="card"><span className="section-kicker">HISTORIQUE</span><h2>Dernières interventions</h2>{data.interventions.length?data.interventions.slice(0,4).map(i=><div className="history-row" key={i.id}><span className="history-dot"/><div><strong>{i.title}</strong><small>{i.status}</small></div></div>):<div className="empty">Aucune intervention pour le moment.</div>}</div>
        </div>
      </section>
    </main>
  </div>
}

function TechnicianDashboard({user}) {
  const nav=useNavigate(); const [items,setItems]=useState([]); const [busy,setBusy]=useState(true);
  const load=()=>api.get('/interventions').then(r=>setItems(r.data.interventions||[])).finally(()=>setBusy(false));
  useEffect(()=>{load()},[]);
  const accept=async id=>{try{await api.post(`/interventions/${id}/accept`);load()}catch(e){alert(e.response?.data?.error||'Demande indisponible')}};
  return <div className="app-shell"><aside className="sidebar"><Logo/><div className="side-menu"><SideLink to="/dashboard" icon={<Gauge/>} text="Tableau de bord"/><SideLink to="/dashboard" icon={<Wrench/>} text="Demandes de dépannage"/><SideLink to="/dashboard" icon={<Activity/>} text="Mes interventions"/><SideLink to="/dashboard" icon={<CreditCard/>} text="Mon abonnement"/></div><div className="side-bottom"><div className="side-user"><div className="avatar">{user.firstName[0]}</div><div><strong>{user.firstName} {user.lastName}</strong><span>TECHNICIEN</span></div></div><button onClick={()=>{localStorage.removeItem('zonefix_token');nav('/')}}><LogOut size={17}/> Déconnexion</button></div></aside>
    <main className="dashboard-main"><div className="topbar"><div><span className="section-kicker">ESPACE TECHNICIEN</span><h1>Bonjour {user.firstName} 👋</h1></div><div className="sub-pill active"><span/> Abonnement actif</div></div>
      <div className="card"><div className="card-head"><div><span className="section-kicker">DEMANDES DISPONIBLES</span><h2>Interventions ZoneFix</h2></div><Wrench/></div>{busy?<Loading/>:items.length?items.map(i=><div className="ticket-row" key={i.id}><div className="ticket-main"><span className="ticket-badge">{i.status}</span><strong>{i.title}</strong><small>{i.diagnostic?.equipment||'Réseau'} · {i.owner?.city||'—'} · {i.diagnostic?.summary||'Diagnostic IA disponible'}</small></div>{i.status==='NEW'&&<button className="btn btn-primary btn-small" onClick={()=>accept(i.id)}>Accepter <ArrowRight size={15}/></button>}</div>):<div className="empty">Aucune demande disponible.</div>}</div>
    </main>
  </div>
}

function AdminDashboard({user}) {
  const nav=useNavigate(); const [data,setData]=useState(null);
  useEffect(()=>{api.get('/admin/overview').then(r=>setData(r.data)).catch(()=>{})},[]);
  return <div className="app-shell"><aside className="sidebar"><Logo/><div className="side-menu"><SideLink to="/dashboard" icon={<Gauge/>} text="Vue générale"/><SideLink to="/admin/owners" icon={<Users/>} text="Propriétaires"/><SideLink to="/admin/technicians" icon={<Wrench/>} text="Techniciens"/><SideLink to="/admin/payments" icon={<CreditCard/>} text="Paiements"/></div><div className="side-bottom"><div className="side-user"><div className="avatar">A</div><div><strong>{user.firstName}</strong><span>ADMINISTRATEUR</span></div></div><button onClick={()=>{localStorage.removeItem('zonefix_token');nav('/')}}><LogOut size={17}/> Déconnexion</button></div></aside>
    <main className="dashboard-main"><div className="topbar"><div><span className="section-kicker">ADMINISTRATION</span><h1>Centre de contrôle ZoneFix</h1></div></div><div className="admin-stats">{[['Propriétaires',data?.owners||0,<Users/>],['Techniciens',data?.technicians||0,<Wrench/>],['Interventions',data?.interventions||0,<Activity/>],['Revenus',`${(data?.revenue||0).toLocaleString('fr-FR')} F`,<CreditCard/>]].map(([t,v,i])=><div className="card admin-stat" key={t}><div>{i}</div><span>{t}</span><strong>{v}</strong></div>)}</div><div className="card"><span className="section-kicker">CENTRE DE CONTRÔLE</span><h2>Modules prêts pour le MVP</h2><div className="admin-list"><span>✓ Gestion des comptes</span><span>✓ Abonnements 5 000 FCFA</span><span>✓ Interventions et commissions</span><span>✓ Journal des actions MikroTik</span><span>✓ Diagnostic IA</span></div></div></main>
  </div>
}

function AdminOwners(){
  const nav=useNavigate();
  const [owners,setOwners]=useState([]);
  const [busy,setBusy]=useState(true);
  useEffect(()=>{api.get('/admin/owners').then(r=>setOwners(r.data.owners||[])).catch(()=>nav('/login')).finally(()=>setBusy(false))},[]);
  return <div className="app-shell"><aside className="sidebar"><Logo/><div className="side-menu"><SideLink to="/dashboard" icon={<Gauge/>} text="Vue generale"/><SideLink to="/admin/owners" icon={<Users/>} text="Proprietaires"/><SideLink to="/admin/technicians" icon={<Wrench/>} text="Techniciens"/><SideLink to="/admin/payments" icon={<CreditCard/>} text="Paiements"/></div></aside>
    <main className="dashboard-main"><div className="topbar"><div><span className="section-kicker">ADMINISTRATION</span><h1>Proprietaires</h1></div></div>
      <div className="card">{busy?<Loading/>:owners.length?<table className="admin-table"><thead><tr><th>Nom</th><th>Email</th><th>Telephone</th><th>Ville</th><th>Verifie</th></tr></thead><tbody>{owners.map(o=><tr key={o.id}><td>{o.firstName} {o.lastName}</td><td>{o.email}</td><td>{o.phone||'-'}</td><td>{o.city||'-'}</td><td>{o.verified?'Oui':'Non'}</td></tr>)}</tbody></table>:<div className="empty">Aucun proprietaire pour le moment.</div>}</div>
    </main>
  </div>
}

function AdminTechnicians(){
  const nav=useNavigate();
  const [technicians,setTechnicians]=useState([]);
  const [busy,setBusy]=useState(true);
  useEffect(()=>{api.get('/admin/technicians').then(r=>setTechnicians(r.data.technicians||[])).catch(()=>nav('/login')).finally(()=>setBusy(false))},[]);
  return <div className="app-shell"><aside className="sidebar"><Logo/><div className="side-menu"><SideLink to="/dashboard" icon={<Gauge/>} text="Vue generale"/><SideLink to="/admin/owners" icon={<Users/>} text="Proprietaires"/><SideLink to="/admin/technicians" icon={<Wrench/>} text="Techniciens"/><SideLink to="/admin/payments" icon={<CreditCard/>} text="Paiements"/></div></aside>
    <main className="dashboard-main"><div className="topbar"><div><span className="section-kicker">ADMINISTRATION</span><h1>Techniciens</h1></div></div>
      <div className="card">{busy?<Loading/>:technicians.length?<table className="admin-table"><thead><tr><th>Nom</th><th>Email</th><th>Telephone</th><th>Ville</th><th>Verifie</th></tr></thead><tbody>{technicians.map(t=><tr key={t.id}><td>{t.firstName} {t.lastName}</td><td>{t.email}</td><td>{t.phone||'-'}</td><td>{t.city||'-'}</td><td>{t.verified?'Oui':'Non'}</td></tr>)}</tbody></table>:<div className="empty">Aucun technicien pour le moment.</div>}</div>
    </main>
  </div>
}

function AdminPayments(){
  const nav=useNavigate();
  const [payments,setPayments]=useState([]);
  const [busy,setBusy]=useState(true);
  useEffect(()=>{api.get('/admin/payments').then(r=>setPayments(r.data.payments||[])).catch(()=>nav('/login')).finally(()=>setBusy(false))},[]);
  return <div className="app-shell"><aside className="sidebar"><Logo/><div className="side-menu"><SideLink to="/dashboard" icon={<Gauge/>} text="Vue generale"/><SideLink to="/admin/owners" icon={<Users/>} text="Proprietaires"/><SideLink to="/admin/technicians" icon={<Wrench/>} text="Techniciens"/><SideLink to="/admin/payments" icon={<CreditCard/>} text="Paiements"/></div></aside>
    <main className="dashboard-main"><div className="topbar"><div><span className="section-kicker">ADMINISTRATION</span><h1>Paiements</h1></div></div>
      <div className="card">{busy?<Loading/>:payments.length?<table className="admin-table"><thead><tr><th>ID</th><th>Montant</th><th>Statut</th><th>Methode</th></tr></thead><tbody>{payments.map(p=><tr key={p.id}><td>{p.id}</td><td>{p.amount} F</td><td>{p.status}</td><td>{p.method||'-'}</td></tr>)}</tbody></table>:<div className="empty">Aucun paiement pour le moment.</div>}</div>
    </main>
  </div>
}
function BellIcon(){return <span className="bell">●</span>}
function SideLink({to,icon,text}){return <Link to={to} className="side-link">{icon}<span>{text}</span></Link>}
function Metric({icon,label,value}){return <div className="metric"><div>{icon}</div><span>{label}</span><strong>{value}</strong></div>}

function Diagnostic() {
  const nav=useNavigate(); const [step,setStep]=useState(1); const [equipment,setEquipment]=useState('MikroTik'); const [issue,setIssue]=useState('Clients connectés mais sans Internet'); const [description,setDescription]=useState(''); const [busy,setBusy]=useState(false); const [result,setResult]=useState(null); const [zones,setZones]=useState([]); const [files,setFiles]=useState([]);
  useEffect(()=>{api.get('/dashboard').then(r=>setZones(r.data.zones||[])).catch(()=>nav('/login'))},[]);
  const run=async()=>{setBusy(true);try{const body=new FormData();body.append('equipment',equipment);body.append('issue',description||issue);if(zones[0]?.id)body.append('zoneId',zones[0].id);if(zones[0]?.mikrotiks?.[0]?.id)body.append('mikrotikId',zones[0].mikrotiks[0].id);files.forEach(f=>body.append('files',f));const r=await api.post('/diagnostics',body);setResult(r.data);setStep(4)}catch(e){alert(e.response?.data?.error||'Diagnostic impossible')}finally{setBusy(false)}};
  return <div className="diagnostic-page"><div className="diag-header"><Logo/><Link to="/dashboard">← Dashboard</Link></div><div className="diag-shell"><div className="progress"><span className={step>=1?'on':''}/><span className={step>=2?'on':''}/><span className={step>=3?'on':''}/><span className={step>=4?'on':''}/></div>
    {step===1&&<DiagStep title="Quel équipement a un problème ?" text="Choisissez l’équipement concerné pour que ZoneFix adapte son diagnostic."><div className="choice-grid">{['MikroTik','Starlink','LiteBeam / Ubiquiti','PoE','Switch','Autre'].map(x=><button className={equipment===x?'choice selected':'choice'} key={x} onClick={()=>setEquipment(x)}><Router size={22}/>{x}</button>)}</div><button className="btn btn-primary full" onClick={()=>setStep(2)}>Continuer <ArrowRight/></button></DiagStep>}
    {step===2&&<DiagStep title="Quel est le problème ?" text="L’IA commence par les vérifications les plus simples."><select className="big-select" value={issue} onChange={e=>setIssue(e.target.value)}>{['Internet ne fonctionne plus','Internet lent','Clients connectés mais sans Internet','MikroTik inaccessible','Starlink hors ligne','Signal faible','CCQ faible','Problème DHCP','Problème DNS','Problème NAT','Problème Hotspot','Autre'].map(x=><option key={x}>{x}</option>)}</select><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Décrivez ce que vous observez…"/><label className="upload-box"><span>📷 Ajouter des photos / captures (optionnel)</span><input type="file" accept="image/*" multiple onChange={e=>setFiles(Array.from(e.target.files||[]))}/><small>{files.length ? `${files.length} fichier(s) sélectionné(s)` : 'JPG, PNG — 8 Mo maximum par fichier'}</small></label><div className="step-actions"><button className="btn btn-outline" onClick={()=>setStep(1)}>Retour</button><button className="btn btn-primary" onClick={()=>setStep(3)}>Continuer <ArrowRight/></button></div></DiagStep>}
    {step===3&&<DiagStep title="Lancer le diagnostic IA" text="ZoneFix va analyser les informations disponibles et, si votre MikroTik est connecté, les données techniques."><div className="scan-card"><div className="scan-orb"><Bot size={42}/></div><h3>Analyse en cours</h3><p>✓ Équipement : {equipment}<br/>✓ Symptôme : {description||issue}<br/>✓ Vérification réseau<br/>✓ Analyse des données disponibles</p></div><button className="btn btn-primary full" disabled={busy} onClick={run}>{busy?'Analyse...':'🧠 LANCER LE DIAGNOSTIC IA'}</button></DiagStep>}
    {step===4&&result&&<DiagStep title={result.ai.summary} text={`Source: ${result.ai.source} · ${result.ai.confidence?`Confiance ${result.ai.confidence}%`:'analyse IA'}`}><div className="result-card"><div className="result-ok"><CheckCircle2 size={24}/><div><strong>Diagnostic terminé</strong><span>Les prochaines étapes sont prêtes.</span></div></div>{result.ai.observed?.length>0&&<div className="result-section"><strong>Observations</strong>{result.ai.observed.map(x=><p key={x}>• {x}</p>)}</div>}<div className="result-section"><strong>Étapes recommandées</strong>{(result.ai.steps||[]).map((x,i)=><div className="step-line" key={x}><span>{i+1}</span>{x}</div>)}</div><div className="warning"><AlertTriangle size={18}/>{result.ai.warning}</div></div><div className="step-actions"><button className="btn btn-outline" onClick={()=>setStep(1)}>Nouveau diagnostic</button><button className="btn btn-primary" onClick={async()=>{await api.post(`/diagnostics/${result.diagnostic.id}/escalate`);alert('Demande technicien créée');nav('/dashboard')}}>Trouver un technicien <Wrench/></button></div></DiagStep>}
  </div></div>
}

function DiagStep({title,text,children}){return <div className="diag-card"><span className="section-kicker">ZONEFIX AI</span><h1>{title}</h1><p>{text}</p>{children}</div>}
function Payment(){
  const nav=useNavigate();
  const [method,setMethod]=useState('all');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [result,setResult]=useState(null);
  const pay=async()=>{
    setBusy(true);setError('');setMessage('');
    try{
      const r=await api.post('/payments/checkout',{type:'SUBSCRIPTION',method});
      setResult(r.data);
      setMessage('Redirection vers la page de paiement sécurisée…');
      window.location.href=r.data.checkoutUrl;
    }catch(e){setError(e.response?.data?.error||'Impossible de démarrer le paiement');}
    finally{setBusy(false)}
  };
  return <div className="diagnostic-page"><div className="diag-header"><Logo/><Link to="/dashboard">← Dashboard</Link></div><div className="diag-shell"><div className="diag-card">
    <span className="section-kicker">ZONEFIX PAY</span><h1>Activer votre abonnement</h1><p>Un seul abonnement : <strong>5 000 FCFA / mois</strong>. Le paiement est traité par FedaPay et les moyens Mobile Money disponibles au Bénin.</p>
    <div className="payment-methods">
      {[['all','Choisir sur FedaPay','💳'],['mtn','MTN Mobile Money','🟡'],['moov','Moov Money','🟢'],['celtiis','Celtiis Cash','🔵']].map(([id,label,emoji])=><button key={id} className={method===id?'payment-method selected':'payment-method'} onClick={()=>setMethod(id)}><span>{emoji}</span><strong>{label}</strong><small>{id==='all'?'MTN · Moov · Celtiis · cartes': 'Paiement Mobile Money'}</small></button>)}
    </div>
    {error&&<div className="error">{error}</div>}{message&&<div className="setup-message">{message}</div>}
    <div className="payment-total"><span>Total</span><strong>5 000 FCFA</strong></div>
    <button className="btn btn-primary full" disabled={busy} onClick={pay}>{busy?'Préparation du paiement…':'Payer 5 000 FCFA'} <ArrowRight size={18}/></button>
    <p className="payment-note">🔒 La clé secrète FedaPay reste uniquement sur le serveur. ZoneFix n’enregistre pas votre code PIN Mobile Money.</p>
  </div></div></div>
} 

function PaymentResult(){
  const params=new URLSearchParams(location.search); const paymentId=params.get('payment');
  const [status,setStatus]=useState('PENDING');
  useEffect(()=>{if(!paymentId)return;let n=0;const poll=async()=>{try{const r=await api.get(`/payments/${paymentId}`);setStatus(r.data.payment.status)}catch{} n++;if(n<20&&status==='PENDING')setTimeout(poll,3000)};poll();},[paymentId]);
  return <div className="auth-page"><div className="auth-card"><Logo/><h1>{status==='PAID'?'Paiement confirmé':status==='FAILED'?'Paiement échoué':'Paiement en cours'}</h1><p>{status==='PAID'?'Votre abonnement ZoneFix est maintenant actif.':status==='FAILED'?'Le paiement n’a pas été confirmé. Vous pouvez réessayer.':'Nous attendons la confirmation de FedaPay. Cette page se met à jour automatiquement.'}</p>{status==='PAID'?<CheckCircle2 size={52} color="#35dba9" style={{display:'block',margin:'20px auto'}}/>:<div className="spinner" style={{margin:'20px auto'}}/>}<Link to="/dashboard" className="btn btn-primary full">Retour au dashboard</Link></div></div>
}

function Loading(){return <div className="loading"><div className="spinner"/><span>ZoneFix charge votre espace…</span></div>}

export default function App(){
  const [auth,setAuth]=useState(Boolean(localStorage.getItem('zonefix_token')));
  return <Routes>
    <Route path="/" element={<Landing onLogin={()=>location.href='/login'}/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/dashboard" element={auth?<Dashboard/>:<Login/>}/>
    <Route path="/diagnostic" element={auth?<Diagnostic/>:<Login/>}/>
    <Route path="/payment" element={auth?<Payment/>:<Login/>}/>
    <Route path="/payment/result" element={auth?<PaymentResult/>:<Login/>}/>
    <Route path="/admin/owners" element={auth?<AdminOwners/>:<Login/>}/>
    <Route path="/admin/technicians" element={auth?<AdminTechnicians/>:<Login/>}/>
    <Route path="/admin/payments" element={auth?<AdminPayments/>:<Login/>}/>
    <Route path="*" element={<Landing onLogin={()=>location.href='/login'}/>}/>
  </Routes>
}
