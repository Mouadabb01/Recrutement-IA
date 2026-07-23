import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Briefcase, Users, User, BarChart3,
  LogOut, Sparkles
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout, isCandidate, isRecruiter, isAdmin } = useAuth();
  const navigate = useNavigate();

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
        <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase()}</div>
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
