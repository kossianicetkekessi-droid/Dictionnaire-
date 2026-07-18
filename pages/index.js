import Head from "next/head";
import { useState, useRef, useEffect } from "react";

const CATEGORIES = [
  { id: "all", label: "Tout" },
  { id: "science", label: "Sciences" },
  { id: "histoire", label: "Histoire" },
  { id: "philosophie", label: "Philosophie" },
  { id: "linguistique", label: "Linguistique" },
  { id: "arts", label: "Arts & Lettres" },
  { id: "economie", label: "Économie" },
  { id: "geographie", label: "Géographie" },
];

const SUGGESTIONS = ["Dialectique", "Phonème", "Valeur-travail", "Catharsis", "Mondialisation"];
const HISTORY_MAX = 12;

function formatEntry(text) {
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
  text = text.replace(/^### (.+)$/gm, '<h4 class="eh4">$1</h4>');
  text = text.replace(/^## (.+)$/gm, '<h3 class="eh3">$1</h3>');
  text = text.replace(/^[-•] (.+)$/gm, "<li>$1</li>");
  text = text.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul class="eul">$1</ul>');
  return text.split(/\n\n+/).map(p => {
    p = p.trim();
    if (!p) return "";
    if (p.startsWith("<h") || p.startsWith("<ul")) return p;
    return `<p>${p.replace(/\n/g, " ")}</p>`;
  }).join("");
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function search(term, cat) {
    const q = (term ?? query).trim();
    const c = cat ?? category;
    if (!q) return;
    setLoading(true); setError(null); setEntry(null); setShowHistory(false);
    try {
      const res = await fetch("/api/define", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: q, category: c }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const newEntry = { term: q, category: c, text: data.text };
      setEntry(newEntry);
      setHistory(prev => [newEntry, ...prev.filter(h => h.term.toLowerCase() !== q.toLowerCase())].slice(0, HISTORY_MAX));
    } catch (e) {
      setError("Une erreur est survenue. Vérifie ta connexion et réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Dictionnaire Encyclopédique</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3d2f70" />
        <meta name="description" content="Dictionnaire encyclopédique francophone alimenté par l'IA" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Encyclopædia" />
      </Head>

      <div style={{ minHeight:"100vh", background:"#0f0f14", color:"#e8e4d9", fontFamily:"Georgia,serif", display:"flex", flexDirection:"column" }}>
        <header style={{ borderBottom:"1px solid #2a2a3a", padding:"24px 20px 18px", background:"linear-gradient(180deg,#13131c,#0f0f14)" }}>
          <div style={{ maxWidth:720, margin:"0 auto" }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:4 }}>
              <span style={{ fontSize:10, letterSpacing:"0.25em", color:"#7c6fa0", textTransform:"uppercase" }}>Encyclopædia</span>
              <span style={{ color:"#2a2a3a" }}>|</span>
              <span style={{ fontSize:10, letterSpacing:"0.15em", color:"#4a4a6a" }}>Édition universelle</span>
            </div>
            <h1 style={{ fontSize:"clamp(26px,6vw,40px)", fontWeight:400, letterSpacing:"-0.02em", margin:0, lineHeight:1.1 }}>
              Dictionnaire<br /><span style={{ color:"#9b85c9", fontStyle:"italic" }}>encyclopédique</span>
            </h1>
            <p style={{ margin:"8px 0 0", fontSize:12, color:"#555570", fontStyle:"italic", fontFamily:"sans-serif" }}>
              Définitions · Étymologies · Contextes
            </p>
          </div>
        </header>

        <div style={{ padding:"20px 20px 0", maxWidth:720, margin:"0 auto", width:"100%" }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
                padding:"4px 12px", borderRadius:20, fontSize:11, cursor:"pointer", fontFamily:"sans-serif",
                border:`1px solid ${category===cat.id?"#7c6fa0":"#2a2a3a"}`,
                background:category===cat.id?"#1e1a2e":"transparent",
                color:category===cat.id?"#c4b8e8":"#555570",
              }}>{cat.label}</button>
            ))}
          </div>

          <div style={{ display:"flex", gap:8 }}>
            <div style={{ flex:1, display:"flex", alignItems:"center", background:"#16161f", border:"1px solid #2a2a3a", borderRadius:6, padding:"0 14px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4a4a6a" strokeWidth="2" style={{ flexShrink:0, marginRight:8 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input ref={inputRef} value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key==="Enter" && search()}
                placeholder="Entrez un mot ou un concept…"
                style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#e8e4d9", fontSize:16, fontFamily:"Georgia,serif", padding:"13px 0" }}
              />
            </div>
            <button onClick={() => search()} disabled={loading || !query.trim()} style={{
              padding:"0 18px", background:loading?"#2a2240":"#3d2f70", border:"none",
              borderRadius:6, color:"#c4b8e8", fontSize:13, fontFamily:"sans-serif", cursor:loading?"default":"pointer", minWidth:76,
            }}>{loading ? "…" : "Chercher"}</button>
          </div>

          {history.length > 0 && (
            <button onClick={() => setShowHistory(v => !v)} style={{
              marginTop:8, background:"none", border:"none", color:"#4a4a6a", fontSize:11,
              cursor:"pointer", fontFamily:"sans-serif", padding:0, display:"flex", alignItems:"center", gap:4,
            }}>
              Récents ({history.length})
            </button>
          )}

          {showHistory && (
            <div style={{ marginTop:4, background:"#13131c", border:"1px solid #2a2a3a", borderRadius:6, padding:"6px 0", maxHeight:200, overflowY:"auto" }}>
              {history.map((item, i) => (
                <button key={i} onClick={() => { setQuery(item.term); setCategory(item.category); setEntry(item); setShowHistory(false); }}
                  style={{ width:"100%", textAlign:"left", background:"none", border:"none", padding:"7px 14px", cursor:"pointer", color:"#c4b8e8", fontFamily:"Georgia,serif", fontSize:13, display:"flex", justifyContent:"space-between" }}>
                  <span>{item.term}</span>
                  <span style={{ fontSize:10, color:"#3a3a5a", fontFamily:"sans-serif" }}>{CATEGORIES.find(c=>c.id===item.category)?.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <main style={{ flex:1, padding:"24px 20px 48px", maxWidth:720, margin:"0 auto", width:"100%" }}>
          {loading && (
            <div style={{ textAlign:"center", padding:"60px 0" }}>
              <div style={{ width:32, height:32, border:"2px solid #2a2a3a", borderTop:"2px solid #7c6fa0", borderRadius:"50%", margin:"0 auto 14px", animation:"spin 1s linear infinite" }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{ color:"#555570", fontStyle:"italic", fontSize:13, fontFamily:"sans-serif" }}>Consultation des archives…</p>
            </div>
          )}

          {error && <div style={{ padding:"14px 18px", background:"#1c1018", border:"1px solid #4a2030", borderRadius:6, color:"#c08090", fontSize:13, fontFamily:"sans-serif" }}>{error}</div>}

          {entry && !loading && (
            <article>
              <div style={{ borderBottom:"1px solid #2a2a3a", paddingBottom:14, marginBottom:20 }}>
                <h2 style={{ fontSize:"clamp(20px,5vw,30px)", fontWeight:400, margin:0, color:"#e8e4d9" }}>
                  {entry.term.charAt(0).toUpperCase()+entry.term.slice(1)}
                </h2>
                <span style={{ fontSize:10, color:"#7c6fa0", letterSpacing:"0.15em", textTransform:"uppercase", fontFamily:"sans-serif" }}>
                  {CATEGORIES.find(c=>c.id===entry.category)?.label || "Général"}
                </span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: formatEntry(entry.text) }} style={{ lineHeight:1.8, fontSize:15 }} />
            </article>
          )}

          {!entry && !loading && !error && (
            <div style={{ textAlign:"center", padding:"60px 0" }}>
              <div style={{ width:50, height:50, borderRadius:"50%", background:"#16161f", border:"1px solid #2a2a3a", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a4a6a" strokeWidth="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <p style={{ color:"#3a3a5a", fontSize:13, fontFamily:"sans-serif", fontStyle:"italic" }}>Entrez un mot pour consulter sa définition</p>
              <div style={{ marginTop:20, display:"flex", flexWrap:"wrap", gap:7, justifyContent:"center" }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => { setQuery(s); search(s, category); }}
                    style={{ padding:"5px 12px", background:"#13131c", border:"1px solid #2a2a3a", borderRadius:20, color:"#6a6a8a", fontSize:11, cursor:"pointer", fontFamily:"sans-serif" }}>{s}</button>
                ))}
              </div>
            </div>
          )}
        </main>

        <style>{`
          p { margin:0 0 13px; color:#ccc8d8; }
          strong { color:#e8e4d9; font-weight:600; }
          em { color:#b8a8d8; font-style:italic; }
          .eh3 { font-size:15px; font-weight:600; color:#9b85c9; margin:20px 0 7px; border-left:2px solid #3d2f70; padding-left:9px; }
          .eh4 { font-size:13px; font-weight:600; color:#7c6fa0; margin:16px 0 5px; font-style:italic; }
          .eul { margin:7px 0 13px 18px; padding:0; }
          .eul li { color:#aaa8c0; margin-bottom:4px; font-size:14px; line-height:1.7; }
          * { box-sizing:border-box; }
          ::-webkit-scrollbar { width:5px; }
          ::-webkit-scrollbar-thumb { background:#2a2a3a; border-radius:3px; }
        `}</style>
      </div>
    </>
  );
    }
