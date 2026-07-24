import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { userApi } from '../services/api';
import {
  LayoutDashboard, Briefcase, Users, User, BarChart3,
  LogOut, Sparkles, Shield
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout, isCandidate, isRecruiter, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (user?.id) {
      userApi.get(user.id)
        .then(res => {
          if (res.data?.avatarBase64) {
            setAvatar(res.data.avatarBase64);
          }
        })
        .catch(err => console.error("Error fetching avatar", err));
    }
  }, [user?.id]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Tableau de bord' },
    { to: '/jobs',      icon: <Briefcase size={18} />,       label: 'Offres d\'emploi' },
    ...(isRecruiter() || isAdmin() ? [
      { to: '/candidates', icon: <Users size={18} />, label: 'Candidats' },
    ] : []),
    { to: '/profile',   icon: <User size={18} />,            label: 'Mon Profil' },
    ...(isAdmin() || isRecruiter() ? [
      { to: '/stats', icon: <BarChart3 size={18} />, label: 'Statistiques' },
    ] : []),
    ...(isAdmin() ? [
      { to: '/admin', icon: <Shield size={18} />, label: 'Gestion' },
    ] : []),
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><Sparkles size={20} /></div>
        <span>RecruitAI</span>
      </div>

      {/* User info */}
      <div className="sidebar-user">
        <div className="sidebar-avatar" style={{ overflow: 'hidden', padding: avatar ? 0 : undefined }}>
          {avatar ? (
            <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user?.name?.[0]?.toUpperCase()
          )}
        </div>
        <div>
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-role">
            {user?.role === 'ROLE_CANDIDATE' ? 'Candidat'
            : user?.role === 'ROLE_RECRUITER' ? 'Recruteur'
            : 'Administrateur'}
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="sidebar-nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {l.icon}
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={17} />
        <span>Déconnexion</span>
      </button>
    </aside>
  );
}
