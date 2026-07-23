import { useEffect, useState } from 'react';
import { statsApi, applicationApi } from '../services/api';
import Sidebar from '../components/Sidebar';
import { BarChart3, Users, Briefcase, Building2, FileText, TrendingUp } from 'lucide-react';
import './Stats.css';

export default function Stats() {
  const [stats, setStats]   = useState(null);
  const [apps,  setApps]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a] = await Promise.all([ statsApi.get(), applicationApi.getAll() ]);
        setStats(s.data);
        setApps(a.data.sort((x,y) => (y.compatibilityScore||0) - (x.compatibilityScore||0)));
      } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="app-layout"><Sidebar/><main className="main-content"><div className="loading-page"><div className="spinner"/></div></main></div>;

  const dist = stats?.applicationsStatusDistribution || {};
  const total = Object.values(dist).reduce((s,v) => s+v, 0) || 1;

  const statusBars = [
    { key:'PENDING',  label:'En attente', color:'var(--warning)', cls:'badge-yellow' },
    { key:'ACCEPTED', label:'Acceptées',  color:'var(--success)', cls:'badge-green'  },
    { key:'REJECTED', label:'Refusées',   color:'var(--danger)',  cls:'badge-red'    },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1><BarChart3 size={26} style={{verticalAlign:'middle', marginRight:'.5rem'}}/> Statistiques</h1>
          <p>Vue d'ensemble de la plateforme</p>
        </div>

        <div className="fade-in">
          {/* KPI row */}
          <div className="grid-4" style={{marginBottom:'1.75rem'}}>
            <KpiCard icon={<Users size={22}/>}    label="Candidats"     value={stats?.totalCandidates}   color="purple" />
            <KpiCard icon={<Building2 size={22}/>} label="Entreprises"   value={stats?.totalCompanies}    color="cyan"   />
            <KpiCard icon={<Briefcase size={22}/>} label="Offres"        value={stats?.totalJobOffers}    color="yellow" />
            <KpiCard icon={<FileText size={22}/>}  label="Candidatures"  value={stats?.totalApplications} color="green"  />
          </div>

          <div className="stats-grid">
            {/* Average score card */}
            <div className="card">
              <h3 style={{marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'.5rem'}}>
                <TrendingUp size={18}/> Score moyen de compatibilité
              </h3>
              <div style={{display:'flex', alignItems:'center', gap:'2rem'}}>
                <div className="score-ring" style={{
                  width:110, height:110, fontSize:'1.8rem',
                  borderColor: (stats?.averageCompatibilityScore||0) >= 60 ? 'var(--success)' : 'var(--warning)',
                  color: (stats?.averageCompatibilityScore||0) >= 60 ? 'var(--success)' : 'var(--warning)',
                }}>
                  {Math.round(stats?.averageCompatibilityScore || 0)}%
                </div>
                <div>
                  <p>Score calculé sur {stats?.totalApplications} candidature{stats?.totalApplications !== 1 ? 's' : ''}</p>
                  <p style={{marginTop:'.5rem', fontSize:'.85rem', color:'var(--text-muted)'}}>
                    Plus votre CV est détaillé, plus le score est précis.
                  </p>
                </div>
              </div>
            </div>

            {/* Status distribution */}
            <div className="card">
              <h3 style={{marginBottom:'1.25rem'}}>Répartition des candidatures</h3>
              {total === 0 ? (
                <p style={{color:'var(--text-muted)'}}>Aucune candidature pour l'instant.</p>
              ) : (
                <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                  {statusBars.map(({key, label, color, cls}) => {
                    const count = dist[key] || 0;
                    const pct   = Math.round((count / total) * 100);
                    return (
                      <div key={key}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'.4rem'}}>
                          <span style={{fontSize:'.875rem'}}>{label}</span>
                          <span className={`badge ${cls}`}>{count} ({pct}%)</span>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{width:`${pct}%`, background: color}} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Top candidates by score */}
          <div className="card" style={{marginTop:'1.5rem'}}>
            <h3 style={{marginBottom:'1.25rem'}}>Top candidatures par score IA</h3>
            {apps.length === 0 ? (
              <p style={{color:'var(--text-muted)'}}>Aucune candidature pour l'instant.</p>
            ) : (
              <div className="top-apps">
                {apps.slice(0,8).map((a, i) => {
                  const score = a.compatibilityScore || 0;
                  const c = score>=70 ? 'var(--success)' : score>=40 ? 'var(--warning)' : 'var(--danger)';
                  return (
                    <div key={a.id} className="top-app-row">
                      <span className="top-rank">#{i+1}</span>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600, fontSize:'.9rem'}}>{a.jobOffer?.title || 'Offre'}</div>
                        <div style={{fontSize:'.78rem', color:'var(--text-muted)'}}>{a.candidate?.user?.name || 'Candidat'}</div>
                      </div>
                      <div className="top-score" style={{color: c, borderColor: c}}>{score}%</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function KpiCard({ icon, label, value, color }) {
  const c = { purple:'var(--accent-1)', cyan:'var(--accent-3)', green:'var(--success)', yellow:'var(--warning)' }[color];
  const bg= { purple:'rgba(139,92,246,.12)', cyan:'rgba(34,211,238,.1)', green:'rgba(16,185,129,.1)', yellow:'rgba(245,158,11,.1)' }[color];
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{background:bg, color:c}}>{icon}</div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={{color:c}}>{value ?? 0}</div>
      </div>
    </div>
  );
}
