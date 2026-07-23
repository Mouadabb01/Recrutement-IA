import { useEffect, useState } from 'react';
import { candidateApi } from '../services/api';
import Sidebar from '../components/Sidebar';
import { Users, Search, Award, Briefcase, FileText } from 'lucide-react';
import './Candidates.css';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null); // Detailed CV view modal

  useEffect(() => {
    const load = async () => {
      try {
        const res = await candidateApi.getAll();
        setCandidates(res.data);
        setFiltered(res.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(candidates.filter(c =>
      c.user?.name?.toLowerCase().includes(q) ||
      c.title?.toLowerCase().includes(q) ||
      c.skills?.toLowerCase().includes(q)
    ));
  }, [search, candidates]);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem'}}>
          <div>
            <h1>Vivier de Candidats</h1>
            <p>{filtered.length} profil{filtered.length !== 1 ? 's' : ''} candidat{filtered.length !== 1 ? 's' : ''} inscrit{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="search-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher compétences, nom…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
              style={{width: 260}}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner"/></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>Aucun candidat trouvé.</p>
          </div>
        ) : (
          <div className="candidates-list fade-in">
            {filtered.map(c => (
              <div key={c.id} className="candidate-item card">
                <div style={{display:'flex', gap:'1.25rem', alignItems:'flex-start'}}>
                  <div className="cand-avatar">{c.user?.name?.[0]?.toUpperCase()}</div>
                  <div style={{flex:1}}>
                    <h3 style={{fontSize:'1.1rem'}}>{c.user?.name}</h3>
                    <p style={{color:'var(--accent-3)', fontSize:'.85rem', fontWeight:600, marginTop:'.1rem'}}>{c.title || 'Sans titre professionnel'}</p>
                    
                    <div className="cand-meta-row">
                      <span><Briefcase size={12}/> {c.experienceYears || 0} an{c.experienceYears !== 1 ? 's' : ''} d'exp</span>
                    </div>

                    {c.skills && (
                      <div className="cand-skills-tags">
                        {c.skills.split(',').map((s,i) => s.trim() && (
                          <span key={i} className="badge badge-purple">{s.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelected(c)}>
                    <FileText size={13}/> Consulter CV
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for CV details */}
        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal-content card fade-in" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>CV de {selected.user?.name}</h2>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>Fermer</button>
              </div>
              <div className="modal-body">
                <p style={{color:'var(--accent-3)', fontWeight:600}}>{selected.title}</p>
                <p style={{fontSize:'.85rem', color:'var(--text-muted)', marginTop:'.25rem'}}>
                  Expérience : {selected.experienceYears || 0} ans | Contact : {selected.user?.email}
                </p>
                
                {selected.skills && (
                  <div style={{marginTop:'1rem'}}>
                    <div style={{fontWeight:600, fontSize:'.9rem', marginBottom:'.4rem'}}>Compétences :</div>
                    <div style={{display:'flex', flexWrap:'wrap', gap:'.5rem'}}>
                      {selected.skills.split(',').map((s,i) => (
                        <span key={i} className="badge badge-cyan">{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{marginTop:'1.5rem'}}>
                  <div style={{fontWeight:600, fontSize:'.9rem', marginBottom:'.5rem', borderBottom:'1px solid var(--border)', paddingBottom:'.25rem'}}>Contenu du CV :</div>
                  {selected.resumeText ? (
                    <div className="cv-text-box">{selected.resumeText}</div>
                  ) : (
                    <p style={{color:'var(--text-muted)', fontStyle:'italic', fontSize:'.85rem'}}>Aucun texte de CV fourni par le candidat.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
