import { useEffect, useMemo, useState } from "react";
import { Search, Plus, MapPin, Euro, Recycle, LogIn, LogOut, X } from "lucide-react";
import { isSupabaseConfigured, supabase } from "./supabase";
import type { Listing } from "./types";

const demoListings: Listing[] = [
  { id: "demo-1", title: "Oude zetel ophalen", description: "Grijze zetel, nog bruikbaar. Zelf ophalen op gelijkvloers.", category: "Meubels", city: "Antwerpen", reward_eur: 15, created_at: new Date().toISOString() },
  { id: "demo-2", title: "Houten kast meenemen", description: "Stevige kast. Gratis mee te nemen, ik geef een kleine vergoeding.", category: "Meubels", city: "Merksem", reward_eur: 10, created_at: new Date().toISOString() },
  { id: "demo-3", title: "Tuinmateriaal ophalen", description: "Enkele spullen die weg mogen. Ophalen dit weekend.", category: "Tuin", city: "Deurne", reward_eur: 5, created_at: new Date().toISOString() }
];

export default function App() {
  const [listings, setListings] = useState<Listing[]>(demoListings);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Alles");
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [notice, setNotice] = useState("");
const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUserEmail(session?.user.email ?? null));
    supabase.from("listings").select("*").order("created_at", { ascending: false }).then(({ data: rows, error }) => {
      if (!error && rows) setListings(rows as Listing[]);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const filtered = useMemo(() => listings.filter(item => {
    const text = `${item.title} ${item.description} ${item.city}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (category === "Alles" || item.category === category);
  }), [listings, query, category]);

  async function signIn() {
    if (!supabase) { setNotice("Koppel eerst Supabase via het .env-bestand."); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setNotice(error ? error.message : "Je bent ingelogd.");
  }
  async function signUp() {
    if (!supabase) { setNotice("Koppel eerst Supabase via het .env-bestand."); return; }
    const { error } = await supabase.auth.signUp({ email, password });
    setNotice(error ? error.message : "Account aangemaakt. Controleer indien nodig je e-mail.");
  }
  async function signOut() { await supabase?.auth.signOut(); }
  {
    const item = {
      title: String(form.get("title") || "").trim(),
      description: String(form.get("description") || "").trim(),
      category: String(form.get("category") || "Andere"),
      city: String(form.get("city") || "").trim(),
      reward_eur: Number(form.get("reward") || 0)
    };
    if (!item.title || !item.city) { setNotice("Vul minstens de titel en gemeente in."); return; }
    if (supabase && userEmail) {
      const { data, error } = await supabase.from("listings").insert({ ...item, user_id: (await supabase.auth.getUser()).data.user?.id }).select().single();
      if (error) { setNotice(error.message); return; }
      setListings(current => [data as Listing, ...current]);
    } else {
      setListings(current => [{ ...item, id: `local-${Date.now()}`, created_at: new Date().toISOString() }, ...current]);
      setNotice("Voorbeeldadvertentie toegevoegd op dit toestel. Log in en koppel Supabase om online te publiceren.");
    }
    setShowForm(false);
  }

  return <div className="app">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark"><Recycle size={22}/></span><span>Sad<span>Red</span></span></a>
      <nav><a href="#aanbod">Aanbod</a><a href="#hoe-werkt-het">Hoe werkt het?</a></nav>
      <div className="actions">{userEmail ? <><span className="user">{userEmail}</span><button className="icon-button" onClick={signOut} aria-label="Uitloggen"><LogOut size={18}/></button></> : <button className="login" onClick={() => setAuthOpen(true)}><LogIn size={17}/> Inloggen</button>}<button className="primary small" onClick={() => setShowForm(true)}><Plus size={17}/> Plaats oproep</button></div>
    </header>

    <main>
      <section className="hero"><div className="hero-copy"><div className="eyebrow">DUURZAAM • LOKAAL • EENVOUDIG</div><h1>Geef spullen een<br/><em>tweede leven.</em></h1><p>Wil je iets laten ophalen? Plaats gratis een oproep en bepaal zelf welke vergoeding je geeft aan iemand die het komt ophalen.</p><button className="primary" onClick={() => setShowForm(true)}><Plus size={18}/> Plaats een oproep</button></div><div className="hero-art"><div className="art-circle"><Recycle size={104}/></div><div className="floating-card"><span>♻️</span><div><b>Goed voor elkaar.</b><small>Spullen krijgen een nieuw thuis.</small></div></div></div></section>

      <section className="stats"><div><b>Geeasync function addListing(form: FormData) f weg</b><span>Wat jij niet meer nodig hebt</span></div><div><b>Ontvang hulp</b><span>Iemand haalt het voor je op</span></div><div><b>Bepaal zelf</b><span>De eventuele vergoeding</span></div></section>

      <section id="aanbod" className="listings-section"><div className="section-heading"><div><div className="eyebrow">ONTDEK IN JOUW BUURT</div><h2>Oproepen in de buurt</h2></div><span className="result-count">{filtered.length} oproepen</span></div>
        <div className="filters"><div className="search"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Zoek op voorwerp of gemeente..."/></div><select value={category} onChange={e => setCategory(e.target.value)}><option>Alles</option><option>Meubels</option><option>Elektronica</option><option>Tuin</option><option>Andere</option></select></div>
        <div className="cards">{filtered.map(item => <article className="listing-card" key={item.id}><div className="listing-image"><Recycle size={38}/><span>{item.category}</span></div><div className="listing-body"><h3>{item.title}</h3><p>{item.description}</p><div className="listing-meta"><span><MapPin size={15}/>{item.city}</span><strong><Euro size={15}/>{item.reward_eur} vergoeding</strong></div></div></article>)}</div>
        {filtered.length === 0 && <div className="empty">Geen oproepen gevonden. Pas je zoekopdracht aan.</div>}
      </section>

      <section id="hoe-werkt-het" className="how"><div><div className="eyebrow">ZO WERKT SADRED</div><h2>Weg ermee?<br/><em>Regel het samen.</em></h2></div><div className="steps"><div><b>01</b><h3>Plaats je oproep</h3><p>Vertel wat opgehaald moet worden en waar.</p></div><div><b>02</b><h3>Ontvang reacties</h3><p>Geïnteresseerden nemen contact met je op.</p></div><div><b>03</b><h3>Maak afspraken</h3><p>Spreek samen een geschikt ophaalmoment af.</p></div></div></section>
    </main>
    <footer><a className="brand" href="#"><span className="brand-mark"><Recycle size={20}/></span><span>Sad<span>Red</span></span></a><small>© {new Date().getFullYear()} SadRed. Samen geven we spullen een tweede leven.</small></footer>

    {showForm && <div className="overlay" onClick={() => setShowForm(false)}><form className="modal" onSubmit={e => { e.preventDefault(); void addListing(new FormData(e.currentTarget)); }} onClick={e => e.stopPropagation()}><button type="button" className="close" onClick={() => setShowForm(false)}><X/></button><h2>Plaats een oproep</h2><p>Vertel wat je wilt laten ophalen.</p><label>Titel<input name="title" required placeholder="Bijv. Oude zetel ophalen"/></label><label>Beschrijving<textarea name="description" rows={3} placeholder="Geef wat extra informatie..."/></label><div className="two"><label>Categorie<select name="category"><option>Meubels</option><option>Elektronica</option><option>Tuin</option><option>Andere</option></select></label><label>Gemeente<input name="city" required placeholder="Antwerpen"/></label></div><label>Vergoeding (€)<input name="reward" type="number" min="0" defaultValue="0"/></label><label>
  Foto's toevoegen
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
  />
</label><button className="primary full" type="submit">Oproep toevoegen</button></form></div>}
    {authOpen && <div className="overlay" onClick={() => setAuthOpen(false)}><div className="modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setAuthOpen(false)}><X/></button><h2>Welkom bij SadRed</h2><p>Log in of maak een account aan.</p><label>E-mailadres<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jij@voorbeeld.be"/></label><label>Wachtwoord<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minstens 6 tekens"/></label><button className="primary full" onClick={() => void signIn()}>Inloggen</button><button className="secondary full" onClick={() => void signUp()}>Account aanmaken</button></div></div>}
    {notice && <button className="notice" onClick={() => setNotice("")}>{notice}　×</button>}
    {!isSupabaseConfigured && <div className="setup-note">Demo-modus: voeg je Supabase-gegevens toe in <code>.env</code> om online accounts en advertenties te activeren.</div>}
  </div>;
}
