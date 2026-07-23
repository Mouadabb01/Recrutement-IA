import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { Briefcase, MapPin, DollarSign, Plus, Search, X } from 'lucide-react';
import './JobOffers.css';

export default function JobOffers() {
  const { isRecruiter, isAdmin, user } = useAuth();
  const [jobs, setJobs]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', requirements:'', location:'', salary:'' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    try {
      const res = await jobApi.getAll();
      setJobs(res.data); setFiltered(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(jobs.filter(j =>
      j.title?.toLowerCase().includes(q) ||
      j.location?.toLowerCase().includes(q) ||
      j.description?.toLowerCase().includes(q)
    ));
  }, [search, jobs]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await jobApi.create(user.companyId, form);
      setMsg('✅ Offre créée !');
      setShowForm(false);
      setForm({ title:'', description:'', requirements:'', location:'', salary:'' });
      await loadJobs();
    } catch { setMsg('❌ Erreur lors de la création.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem'}}>
          <div>
            <h1>Offres d'emploi</h1>
            <p>{filtered.length} offre{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div style={{display:'flex', gap:'.75rem', alignItems:'center'}}>
            {/* Search bar */}
            <div className="search-wrap">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher une offre…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
              {search && <button onClick={()=>setSearch('')} className="search-clear"><X size={13}/></button>}
            </div>
            {(isRecruiter() || isAdmin()) && (
              <button className="btn btn-primary" onClick={()=>setShowForm(v=>!v)}>
                <Plus size={16}/> Créer une offre
              </button>
            )}
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="create-form-wrap fade-in">
            <h3>Nouvelle offre d'emploi</h3>
            {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
            <form onSubmit={handleCreate} className="create-form">
              <div className="grid-2">
                <div className="form-group">
                  <label>Intitulé du poste *</label>
                  <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required placeholder="Ex: Développeur Full-Stack" />
                </div>
                <div className="form-group">
                  <label>Localisation</label>
                  <input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Ex: Paris / Remote" />
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required placeholder="Décrivez le poste et les missions…" />
              </div>
              <div className="form-group">
                <label>Exigences</label>
                <textarea value={form.requirements} onChange={e=>setForm({...form,requirements:e.target.value})} placeholder="Compétences requises, diplômes, expérience…" style={{minHeight:90}} />
              </div>
              <div className="form-group">
                <label>Salaire</label>
                <input value={form.salary} onChange={e=>setForm({...form,salary:e.target.value})} placeholder="Ex: 45 000 – 55 000 € / an" />
              </div>
              <div style={{display:'flex', gap:'.75rem'}}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Publier l\'offre'}</button>
                <button type="button" className="btn btn-secondary" onClick={()=>setShowForm(false)}>Annuler</button>
              </div>
            </form>
          </div>
        )}

        {/* Job list */}
        {loading ? (
          <div className="loading-page"><div className="spinner"/></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>Aucune offre trouvée.</p>
          </div>
        ) : (
          <div className="jobs-grid fade-in">
            {filtered.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="job-card">
      <div className="job-card-header">
        <div className="job-icon"><Briefcase size={20}/></div>
        <span className="badge badge-purple">Ouvert</span>
      </div>
      <h3 className="job-card-title">{job.title}</h3>
      <p className="job-card-company">{job.company?.name}</p>
      <p className="job-card-desc">{job.description?.substring(0,120)}{job.description?.length > 120 ? '…' : ''}</p>
      <div className="job-card-meta">
        {job.location && <span><MapPin size={13}/> {job.location}</span>}
        {job.salary   && <span><DollarSign size={13}/> {job.salary}</span>}
      </div>
    </Link>
  );
}
