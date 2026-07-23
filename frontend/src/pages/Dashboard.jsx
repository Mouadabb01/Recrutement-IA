import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobApi, applicationApi, statsApi } from '../services/api';
import Sidebar from '../components/Sidebar';
import { Briefcase, Users, FileText, TrendingUp, Plus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { user, isCandidate, isRecruiter } = useAuth();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (isCandidate()) {
          const [jobs, apps] = await Promise.all([
            jobApi.getAll(),
            applicationApi.getByCandidate(user.candidateId),
          ]);
          setData({ jobs: jobs.data, apps: apps.data });
        } else if (isRecruiter()) {
          const [stats, jobs] = await Promise.all([
            statsApi.get(),
            jobApi.getByCompany(user.companyId),
          ]);
          setData({ stats: stats.data, jobs: jobs.data });
        } else {
          // Admin
          const res = await statsApi.get();
          setData({ stats: res.data });
        }
      } catch (err) { 
        console.error("Dashboard fetch error", err); 
      }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <h1>Bonjour, <span className="gradient-text">{user?.name} 👋</span></h1>
          <p>{new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}</p>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner"/></div>
        ) : isCandidate() ? (
          <CandidateDash data={data} />
        ) : isRecruiter() ? (
          <RecruiterDash data={data} userId={user?.id} />
        ) : (
          <AdminDash data={data} />
        )}
      </main>
    </div>
  );
}

/* ─── Candidate dashboard ─────────────────────────── */
function CandidateDash({ data }) {
  const { apps = [], jobs = [] } = data || {};
  const pending  = apps.filter(a => a.status === 'PENDING').length;
  const accepted = apps.filter(a => a.status === 'ACCEPTED').length;
  const avgScore = apps.length
    ? Math.round(apps.reduce((s,a) => s + (a.compatibilityScore||0), 0) / apps.length)
    : 0;

  return (
    <div className="fade-in">
      {/* Stats row */}
      <div className="grid-3 mb-2">
        <StatCard icon="📋" label="Mes candidatures" value={apps.length} color="purple" />
        <StatCard icon="⏳" label="En attente"       value={pending}    color="yellow" />
        <StatCard icon="✅" label="Acceptées"         value={accepted}   color="green"  />
      </div>

      {/* Recent applications */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h3>Mes candidatures récentes</h3>
          <Link to="/jobs" className="btn btn-secondary btn-sm">Voir les offres</Link>
        </div>
        {apps.length === 0 ? (
          <EmptyState text="Vous n'avez pas encore postulé à une offre." cta="Parcourir les offres" to="/jobs" />
        ) : (
          <div className="app-list">
            {apps.slice(0, 5).map(a => (
              <AppRow key={a.id} app={a} />
            ))}
          </div>
        )}
      </div>

      {/* Latest jobs */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h3>Offres récentes</h3>
          <Link to="/jobs" className="btn btn-secondary btn-sm">Toutes les offres <ChevronRight size={14}/></Link>
        </div>
        <div className="grid-2">
          {jobs.slice(0, 4).map(j => <MiniJobCard key={j.id} job={j} />)}
        </div>
      </div>
    </div>
  );
}

/* ─── Recruiter dashboard ─────────────────────────── */
function RecruiterDash({ data }) {
  const { stats, jobs = [] } = data || {};
  return (
    <div className="fade-in">
      <div className="grid-4 mb-2">
        <StatCard icon="👥" label="Candidats"      value={stats?.totalCandidates   || 0} color="purple" />
        <StatCard icon="🏢" label="Entreprises"    value={stats?.totalCompanies    || 0} color="cyan"   />
        <StatCard icon="💼" label="Offres actives" value={stats?.totalJobOffers    || 0} color="yellow" />
        <StatCard icon="📨" label="Candidatures"   value={stats?.totalApplications || 0} color="green"  />
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <h3>Mes offres d'emploi</h3>
          <Link to="/jobs" className="btn btn-primary btn-sm"><Plus size={14}/> Créer une offre</Link>
        </div>
        {jobs.length === 0 ? (
          <EmptyState text="Vous n'avez pas encore créé d'offre." cta="Créer une offre" to="/jobs" />
        ) : (
          <div className="grid-2">
            {jobs.slice(0,6).map(j => <MiniJobCard key={j.id} job={j} showApps />)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────── */
function StatCard({ icon, label, value, color }) {
  const colors = {
    purple: { bg:'rgba(139,92,246,.12)', color:'var(--accent-1)' },
    cyan:   { bg:'rgba(34,211,238,.1)',  color:'var(--accent-3)' },
    green:  { bg:'rgba(16,185,129,.1)', color:'var(--success)'  },
    yellow: { bg:'rgba(245,158,11,.1)', color:'var(--warning)'  },
  };
  const c = colors[color] || colors.purple;
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{icon}</div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={{ color: c.color }}>{value}</div>
      </div>
    </div>
  );
}

function AppRow({ app }) {
  const statusMap = {
    PENDING:  { label:'En attente', cls:'badge-yellow' },
    ACCEPTED: { label:'Acceptée',   cls:'badge-green'  },
    REJECTED: { label:'Refusée',    cls:'badge-red'    },
  };
  const s = statusMap[app.status] || { label: app.status, cls: 'badge-purple' };
  return (
    <div className="app-row">
      <div>
        <div className="app-row-title">{app.jobOffer?.title || 'Offre'}</div>
        <div className="app-row-company">{app.jobOffer?.company?.name || ''}</div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
        {app.compatibilityScore != null && (
          <div className="score-mini">{app.compatibilityScore}%</div>
        )}
        <span className={`badge ${s.cls}`}>{s.label}</span>
      </div>
    </div>
  );
}

function MiniJobCard({ job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="mini-job-card">
      <div className="mini-job-title">{job.title}</div>
      <div className="mini-job-meta">
        <span>📍 {job.location || 'Non précisé'}</span>
        {job.salary && <span>💰 {job.salary}</span>}
      </div>
      <ChevronRight size={16} className="mini-job-arrow" />
    </Link>
  );
}

function EmptyState({ text, cta, to }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📭</div>
      <p>{text}</p>
      <Link to={to} className="btn btn-primary btn-sm">{cta}</Link>
    </div>
  );
}

/* ─── Admin dashboard ─────────────────────────────── */
function AdminDash({ data }) {
  const { stats } = data || {};
  return (
    <div className="fade-in">
      <div className="grid-4 mb-2">
        <StatCard icon="👥" label="Candidats"      value={stats?.totalCandidates   || 0} color="purple" />
        <StatCard icon="🏢" label="Entreprises"    value={stats?.totalCompanies    || 0} color="cyan"   />
        <StatCard icon="💼" label="Offres Publiées"      value={stats?.totalJobOffers    || 0} color="yellow" />
        <StatCard icon="📨" label="Candidatures"   value={stats?.totalApplications || 0} color="green"  />
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <h3>Espace Administrateur</h3>
        </div>
        <div className="card" style={{textAlign:'center', padding: '3rem 1rem'}}>
          <p style={{fontSize: '1.1rem', marginBottom: '1.5rem'}}>Bienvenue sur le tableau de bord administrateur de RecruitAI.<br/>Vous pouvez consulter toutes les métriques détaillées depuis la page Statistiques.</p>
          <Link to="/stats" className="btn btn-primary">Consulter les statistiques globales <ChevronRight size={18} style={{verticalAlign:'middle'}}/></Link>
        </div>
      </div>
    </div>
  );
}
