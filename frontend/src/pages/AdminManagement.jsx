import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { candidateApi, companyApi, userApi } from '../services/api';
import Sidebar from '../components/Sidebar';
import './Stats.css'; // Reusing some base layout classes

function AdminManagement() {
  const { isAdmin } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // We only allow Admins to view this
  if (!isAdmin()) {
    return (
      <div className="fade-in">
        <div className="alert alert-error">Accès refusé. Réservé aux administrateurs.</div>
      </div>
    );
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [candRes, compRes] = await Promise.all([
        candidateApi.getAll(),
        companyApi.getAll(),
      ]);
      setCandidates(candRes.data);
      setCompanies(compRes.data);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, type, name) => {
    if (!window.confirm(`⚠️ ATTENTION ⚠️\n\nVoulez-vous vraiment supprimer définitivement ${type} "${name}" ?\nToutes ses données et candidatures seront effacées !`)) {
      return;
    }
    
    try {
      await userApi.delete(userId);
      // Refresh list
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression.");
    }
  };

  if (loading) {
    return <div className="loading-page"><div className="spinner"/></div>;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="fade-in">
          <div className="page-header">
            <h1>Gestion de la Plateforme</h1>
            <p>Espace administrateur - Modération des comptes</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="grid-2">
            {/* Candidates Section */}
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Candidats inscrits ({candidates.length})</h3>
              {candidates.length === 0 ? (
                <p className="text-muted">Aucun candidat.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {candidates.map((c) => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                      <div>
                        <h4 style={{ margin: 0 }}>{c.user?.name || 'Inconnu'}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.user?.email}</span>
                      </div>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteUser(c.user?.id, 'le candidat', c.user?.name)}
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Companies Section */}
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Entreprises inscrites ({companies.length})</h3>
              {companies.length === 0 ? (
                <p className="text-muted">Aucune entreprise.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {companies.map((comp) => (
                    <div key={comp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                      <div>
                        <h4 style={{ margin: 0 }}>{comp.name || comp.user?.name}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{comp.user?.email}</span>
                      </div>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteUser(comp.user?.id, 'l\'entreprise', comp.name || comp.user?.name)}
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminManagement;
