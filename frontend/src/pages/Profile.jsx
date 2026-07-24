import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { candidateApi, companyApi, userApi } from '../services/api';
import Sidebar from '../components/Sidebar';
import { Save, User, Building2 } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { user, isCandidate } = useAuth();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg, setMsg] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (isCandidate() && user?.candidateId) {
          const res = await candidateApi.getById(user.candidateId);
          setForm(res.data);
          if (res.data.user?.avatarBase64) setAvatarPreview(res.data.user.avatarBase64);
        } else if (user?.companyId) {
          const res = await companyApi.getById(user.companyId);
          setForm(res.data);
          if (res.data.user?.avatarBase64) setAvatarPreview(res.data.user.avatarBase64);
        }
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      if (isCandidate()) {
        await candidateApi.update(user.candidateId, form);
      } else {
        await companyApi.update(user.companyId, form);
      }
      
      // Update avatar if changed
      if (avatarPreview && avatarPreview !== form.user?.avatarBase64) {
        await userApi.updateAvatar(user.id, avatarPreview);
      }

      setMsg('✅ Profil mis à jour avec succès !');
    } catch { setMsg('❌ Erreur lors de la mise à jour.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="app-layout"><Sidebar/><main className="main-content"><div className="loading-page"><div className="spinner"/></div></main></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>{isCandidate() ? <><User size={28} style={{marginRight:'.5rem',verticalAlign:'middle'}}/> Mon Profil</> : <><Building2 size={28} style={{marginRight:'.5rem',verticalAlign:'middle'}}/> Profil Entreprise</>}</h1>
          <p>Mettez à jour vos informations pour améliorer votre visibilité</p>
        </div>

        {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

        <div className="profile-layout">
          {/* Avatar card */}
          <div className="profile-avatar-card card">
            <label className="profile-avatar-big" style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.[0]?.toUpperCase()
              )}
              <div className="avatar-overlay" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.8rem', textAlign: 'center', padding: '0.2rem', opacity: 0, transition: 'opacity 0.2s' }}>Modifier</div>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
            <div className="profile-name">{user?.name}</div>
            <div className="profile-email">{user?.email}</div>
            <span className="badge badge-purple" style={{marginTop:'.5rem'}}>
              {user?.role === 'ROLE_CANDIDATE' ? '👨‍💼 Candidat' : user?.role === 'ROLE_RECRUITER' ? '🏢 Recruteur' : '🛡️ Administrateur'}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="profile-form card">
            {user?.role === 'ROLE_ADMIN' ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Espace Administrateur</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                  En tant qu'administrateur, vous n'avez pas de profil public ou d'entreprise. Vous pouvez toutefois modifier votre avatar ci-contre.
                </p>
              </div>
            ) : isCandidate() ? (
              <CandidateForm form={form} setForm={setForm} />
            ) : (
              <CompanyForm form={form} setForm={setForm} />
            )}
            
            <button type="submit" className="btn btn-primary" disabled={saving || user?.role === 'ROLE_ADMIN'} style={{marginTop:'1.5rem', display: user?.role === 'ROLE_ADMIN' ? 'none' : 'inline-flex'}}>
              <Save size={16}/> {saving ? 'Sauvegarde…' : 'Enregistrer'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function CandidateForm({ form, setForm }) {
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <>
      <h3 style={{marginBottom:'1.25rem'}}>Informations professionnelles</h3>
      <div className="grid-2" style={{gap:'1rem'}}>
        <div className="form-group">
          <label>Titre du poste souhaité</label>
          <input value={form.title||''} onChange={e=>f('title',e.target.value)} placeholder="Ex: Développeur Full-Stack" />
        </div>
        <div className="form-group">
          <label>Années d'expérience</label>
          <input type="number" min={0} value={form.experienceYears||0} onChange={e=>f('experienceYears',Number(e.target.value))} />
        </div>
      </div>
      <div className="form-group" style={{marginTop:'1rem'}}>
        <label>Compétences <span style={{color:'var(--text-muted)',fontSize:'.8rem'}}>(séparées par des virgules)</span></label>
        <input value={form.skills||''} onChange={e=>f('skills',e.target.value)} placeholder="Java, Spring Boot, React, PostgreSQL…" />
      </div>
      <div className="form-group" style={{marginTop:'1rem'}}>
        <label>Texte du CV <span style={{color:'var(--accent-1)',fontSize:'.8rem'}}>⚡ Utilisé par l'IA pour le matching</span></label>
        <textarea
          value={form.resumeText||''}
          onChange={e=>f('resumeText',e.target.value)}
          placeholder="Collez ici le contenu texte de votre CV (expériences, formations, compétences…). Plus c'est détaillé, meilleur sera le score IA."
          style={{minHeight:200}}
        />
      </div>
    </>
  );
}

function CompanyForm({ form, setForm }) {
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <>
      <h3 style={{marginBottom:'1.25rem'}}>Informations de l'entreprise</h3>
      <div className="grid-2" style={{gap:'1rem'}}>
        <div className="form-group">
          <label>Nom de l'entreprise</label>
          <input value={form.name||''} onChange={e=>f('name',e.target.value)} placeholder="Tech Corp" />
        </div>
        <div className="form-group">
          <label>Site web</label>
          <input value={form.website||''} onChange={e=>f('website',e.target.value)} placeholder="https://exemple.com" />
        </div>
      </div>
      <div className="form-group" style={{marginTop:'1rem'}}>
        <label>Localisation</label>
        <input value={form.location||''} onChange={e=>f('location',e.target.value)} placeholder="Paris, France" />
      </div>
      <div className="form-group" style={{marginTop:'1rem'}}>
        <label>Description de l'entreprise</label>
        <textarea value={form.description||''} onChange={e=>f('description',e.target.value)}
          placeholder="Décrivez votre entreprise, sa mission et sa culture…" style={{minHeight:160}} />
      </div>
    </>
  );
}
