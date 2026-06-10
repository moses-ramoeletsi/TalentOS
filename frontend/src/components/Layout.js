import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function initials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Layout({ children }) {
  const { user, logout, isHR } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const hrNav = [
    { to: '/',             icon: '📊', label: 'Dashboard'   },
    { to: '/applicants',   icon: '👥', label: 'Applicants'  },
    { to: '/pipeline',     icon: '🔄', label: 'Pipeline'    },
    { to: '/interviews',   icon: '📅', label: 'Interviews'  },
    { to: '/ai-ranking',   icon: '🏆', label: 'AI Ranking'  },
    { to: '/analytics',    icon: '📈', label: 'Analytics'   },
  ];

  const candidateNav = [
    { to: '/jobs',            icon: '💼', label: 'Browse Jobs'      },
    { to: '/my-applications', icon: '📋', label: 'My Applications'  },
  ];

  const nav = isHR ? hrNav : candidateNav;

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🎯</div>
          <div>
            <div className="logo-text">TalentOS</div>
            <div className="logo-sub">Smart Recruitment</div>
          </div>
        </div>

        <div className="nav-section">Navigation</div>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {isHR && (
          <>
            <div className="nav-section">Jobs</div>
            <NavLink to="/jobs" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon">💼</span>All Vacancies
            </NavLink>
            <NavLink to="/post-job" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon">➕</span>Post a Job
            </NavLink>
          </>
        )}

        <div className="sidebar-footer">
          <div className="user-row" onClick={handleLogout} title="Click to logout">
            <div className="avatar" style={{ width: 34, height: 34, fontSize: 12 }}>{initials(user?.name)}</div>
            <div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{user?.name}</div>
              <div style={{ color: 'var(--gray400)', fontSize: 11 }}>{user?.role?.replace('_', ' ')} · Logout</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">{getPageTitle(location.pathname)}</div>
          {isHR && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/post-job')}>+ Post Job</button>
          )}
          {!isHR && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/jobs')}>Browse Jobs</button>
          )}
        </header>
        <main className="page-content page-fade">{children}</main>
      </div>
    </div>
  );
}

function getPageTitle(path) {
  const map = {
    '/':               'Dashboard',
    '/jobs':           'Job Vacancies',
    '/post-job':       'Post New Job',
    '/applicants':     'Applicants',
    '/pipeline':       'Hiring Pipeline',
    '/interviews':     'Interviews',
    '/ai-ranking':     'AI Candidate Ranking',
    '/analytics':      'Analytics',
    '/my-applications':'My Applications',
  };
  return map[path] || 'TalentOS';
}
