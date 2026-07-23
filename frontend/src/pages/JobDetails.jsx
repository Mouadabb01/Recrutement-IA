import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobApi, applicationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { MapPin, DollarSign, Briefcase, Send, ChevronLeft, Sparkles, Users } from 'lucide-react';
import './JobDetails.css';

export default function JobDetails() {
  const { id }  = useParams();
  const { user, isCandidate, isRecruiter } = useAuth();
  const navigate = useNavigate();

  const [job,   setJob]   = useState(null);
  const [apps,  setApps]  = useState([]);
  const [applying, setApplying] = useState(false);
  const [applied,  setApplied]  = useState(false);
  const [result,   setResult]   = useState(null);   // { score, feedback }
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await jobApi.getById(id);
        setJob(res.data);
        if (isCandidate() && user.candidateId) {
          const appRes = await applicationApi.getByCandidate(user.candidateId);
          const existing = appRes.data.find(a => a.jobOffer?.id === Number(id));
          if (existing) { setApplied(true); setResult({ score: existing.compatibilityScore, feedback: existing.aiFeedback }); }
        }
        if ((isRecruiter()) ) {
          const appRes = await applicationApi.getByJobOffer(id);
          setApps(appRes.data);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleApply = async () => {
    if (!user?.candidateId) { setError('Profil candidat introuvable. Complétez votre profil d\'abord.'); return; }
    setApplying(true); setError('');
    try {
      const res = await applicationApi.apply(user.candidateId, id);
      setApplied(true);
      setResult({ score: res.data.compatibilityScore, feedback: res.data.aiFeedback });
    } catch { setError('Erreur lors de la candidature.'); }
    finally { setApplying(false); }
  };

  const handleStatus = async (appId, status) => {
    await applicationApi.updateStatus(appId, status);
    setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
  };

  if (loading) return <div className="app-layout"><Sidebar/><main className="main-content"><div className="loading-page"><div className="spinner"/></div></main></div>;
  if (!job)    return null;

  const scoreColor = result?.score >= 70 ? 'var(--success)' : result?.score >= 40 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <button className="btn btn-secondary btn-sm" style={{marginBottom:'1.5rem'}} onClick={()=>navigate('/jobs')}>
          <ChevronLeft size={15}/> Retour aux offres
        </button>

        <div className="jd-layout">
          {/* Main column */}
          <div className="jd-main">
            <div className="jd-header card">
              <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                <div className="jd-icon"><Briefcase size={26}/></div>
                <div>
                  <h1 style={{fontSize:'1.6rem'}}>{job.title}</h1>
                  <p style={{color:'var(--accent-3)', fontWeight:600, marginTop:'.2rem'}}>{job.company?.name}</p>
                </div>
              </div>
              <div className="jd-meta">
                {job.location && <span><MapPin size={14}/> {job.location}</span>}
                {job.salary   && <span><DollarSign size={14}/> {job.salary}</span>}
              </div>
            </div>

            <div className="card" style={{marginTop:'1.25rem'}}>
              <h3 style={{marginBottom:'1rem'}}>Description du poste</h3>
              <p style={{whiteSpace:'pre-wrap', lineHeight:1.8}}>{job.description}</p>
            </div>

            {job.requirements && (
              <div className="card" style={{marginTop:'1.25rem'}}>
                <h3 style={{marginBottom:'1rem'}}>Exigences</h3>
                <p style={{whiteSpace:'pre-wrap', lineHeight:1.8}}>{job.requirements}</p>
              </div>
            )}

            {/* Applicants list (recruiter) */}
            {isRecruiter() && (
              <div className="card" style={{marginTop:'1.25rem'}}>
                <h3 style={{marginBottom:'1rem', display:'flex', alignItems:'center', gap:'.5rem'}}>
                  <Users size={18}/> Candidatures reçues ({apps.length})
                </h3>
                {apps.length === 0 ? (
                  <p style={{color:'var(--text-muted)'}}>Aucune candidature pour cette offre.</p>
                ) : (
                  <div style={{display:'flex', flexDirection:'column', gap:'.75rem'}}>
                    {apps.map(a => (
                      <AppCard key={a.id} app={a} onStatus={handleStatus} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar column */}
          {isCandidate() && (
            <div className="jd-sidebar-col">
              {/* Apply card */}
              <div className="card jd-apply-card">
                {applied && result ? (
                  <>
                    <div className="ai-result-header">
                      <Sparkles size={18} style={{color:'var(--accent-1)'}}/>
                      <span>Analyse IA</span>
                    </div>
                    <div className="score-ring" style={{borderColor: scoreColor, color: scoreColor, margin:'1rem auto'}}>
                      {result.score}%
                    </div>
                    <p style={{textAlign:'center', fontSize:'.82rem', color:'var(--text-muted)', marginBottom:'1rem'}}>Score de compatibilité</p>
                    <div className="ai-feedback">{result.feedback}</div>
                    <span className="badge badge-green" style={{marginTop:'1rem', width:'100%', justifyContent:'center'}}>
                      ✅ Candidature envoyée
                    </span>
                  </>
                ) : (
                  <>
                    <h3 style={{marginBottom:'.5rem'}}>Postuler à cette offre</h3>
                    <p style={{fontSize:'.85rem', marginBottom:'1.25rem'}}>
                      Notre IA analysera votre CV et vous donnera un score de compatibilité instantané.
                    </p>
                    {error && <div className="alert alert-error">{error}</div>}
                    <button className="btn btn-primary btn-full" onClick={handleApply} disabled={applying}>
                      {applying
                        ? <><div className="spinner" style={{width:16,height:16,borderWidth:2}}/> Analyse en cours…</>
                        : <><Send size={16}/> Postuler maintenant</>}
                    </button>
                    {applying && (
                      <p style={{fontSize:'.78rem', color:'var(--text-muted)', textAlign:'center', marginTop:'.75rem'}}>
                        <Sparkles size={12}/> L'IA analyse votre profil…
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function AppCard({ app, onStatus }) {
  const score = app.compatibilityScore;
  const scoreColor = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div className="app-detail-card">
      <div style={{display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap'}}>
        <div className="score-mini-detail" style={{borderColor: scoreColor, color: scoreColor}}>
          {score ?? '?'}%
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:600}}>{app.candidate?.user?.name || 'Candidat'}</div>
          <div style={{fontSize:'.8rem', color:'var(--text-muted)'}}>{app.candidate?.title || 'Sans titre'}</div>
        </div>
        <span className={`badge ${app.status==='ACCEPTED'?'badge-green':app.status==='REJECTED'?'badge-red':'badge-yellow'}`}>
          {app.status === 'ACCEPTED' ? 'Accepté' : app.status === 'REJECTED' ? 'Refusé' : 'En attente'}
        </span>
      </div>
      {app.aiFeedback && (
        <div className="app-feedback">{app.aiFeedback}</div>
      )}
      {app.status === 'PENDING' && (
        <div style={{display:'flex', gap:'.6rem', marginTop:'.75rem'}}>
          <button className="btn btn-sm" style={{background:'rgba(16,185,129,.15)',color:'var(--success)',border:'1px solid rgba(16,185,129,.3)'}}
            onClick={() => onStatus(app.id, 'ACCEPTED')}>Accepter</button>
          <button className="btn btn-danger btn-sm" onClick={() => onStatus(app.id, 'REJECTED')}>Refuser</button>
        </div>
      )}
    </div>
  );
}
