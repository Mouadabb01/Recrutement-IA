import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, Building2, ArrowRight } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'ROLE_CANDIDATE', companyName: ''
  });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères.'); return; }
    setLoading(true);
    try {
      await register(form);
      setSuccess('Compte créé avec succès ! Redirection...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      <div className="auth-card fade-in" style={{ maxWidth: 480 }}>
        <div className="auth-header">
          <div className="auth-logo"><Sparkles size={22} /></div>
          <h1>Créer un compte</h1>
          <p>Rejoignez la plateforme RecruitAI</p>
        </div>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nom complet</label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input type="text" name="name" placeholder="Prénom Nom"
                value={form.name} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Adresse e-mail</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input type="email" name="email" placeholder="vous@exemple.com"
                value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Mot de passe <span style={{color:'var(--text-muted)'}}>( ≥ 6 caractères )</span></label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input type="password" name="password" placeholder="••••••••"
                value={form.password} onChange={handleChange} required />
            </div>
          </div>

          {/* Role selector */}
          <div className="form-group">
            <label>Je suis</label>
            <div className="role-selector">
              {[
                { value: 'ROLE_CANDIDATE', label: '👨‍💼 Candidat', desc: 'Je cherche un emploi' },
                { value: 'ROLE_RECRUITER', label: '🏢 Recruteur', desc: 'Je recrute des talents' },
              ].map((r) => (
                <label key={r.value} className={`role-option${form.role === r.value ? ' selected' : ''}`}>
                  <input type="radio" name="role" value={r.value}
                    checked={form.role === r.value} onChange={handleChange} />
                  <div>
                    <div style={{fontWeight:600}}>{r.label}</div>
                    <div style={{fontSize:'.78rem',color:'var(--text-muted)'}}>{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {form.role === 'ROLE_RECRUITER' && (
            <div className="form-group">
              <label>Nom de l'entreprise</label>
              <div className="input-wrap">
                <Building2 size={16} className="input-icon" />
                <input type="text" name="companyName" placeholder="Tech Corp"
                  value={form.companyName} onChange={handleChange} />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Création...' : <><span>Créer mon compte</span><ArrowRight size={16}/></>}
          </button>
        </form>

        <p className="auth-footer">
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
