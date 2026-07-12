import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const iconProps = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const icons = {
  dashboard: (
    <svg {...iconProps}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
  ),
  vendors: (
    <svg {...iconProps}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
  ),
  products: (
    <svg {...iconProps}><path d="M21 8L12 3 3 8l9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>
  ),
  orders: (
    <svg {...iconProps}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
  ),
  stock: (
    <svg {...iconProps}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path d="M3.27 6.96L12 12l8.73-5.04" /><path d="M12 22.08V12" /></svg>
  ),
  users: (
    <svg {...iconProps}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
  ),
  accounting: (
    <svg {...iconProps}><circle cx="12" cy="12" r="9" /><path d="M12 7v10M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1.1-3 2.5 1.3 2 3 2.5 3 1.1 3 2.5-1.3 2.5-3 2.5-3-1.1-3-2.5" /></svg>
  ),
  settings: (
    <svg {...iconProps}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
  ),
  logout: (
    <svg {...iconProps}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
  ),
  logo: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8 6 5 9.5 5 13a7 7 0 0014 0c0-3.5-3-7-7-11z" /></svg>
  ),
};

const navItems = [
  { to: '/', label: 'Tableau de bord', icon: icons.dashboard, end: true },
  { to: '/vendeurs', label: 'Vendeurs', icon: icons.vendors },
  { to: '/produits', label: 'Produits', icon: icons.products },
  { to: '/commandes', label: 'Commandes', icon: icons.orders },
  { to: '/stock', label: 'Stock', icon: icons.stock },
  { to: '/utilisateurs', label: 'Utilisateurs', icon: icons.users },
  { to: '/comptabilite', label: 'Comptabilité', icon: icons.accounting },
  { to: '/parametres', label: 'Paramètres', icon: icons.settings },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function handleNavClick() {
    setOpen(false);
  }

  return (
    <div className="admin-layout">
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />

      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div style={{
          padding: '0 22px 22px', display: 'flex', alignItems: 'center', gap: 9,
          borderBottom: '1px solid rgba(246,241,231,0.1)', marginBottom: 14
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: 'linear-gradient(135deg, var(--leaf), var(--tomato))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--indigo-deep)'
          }}>{icons.logo}</div>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}>SAFi Admin</div>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={handleNavClick}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 22px',
                fontSize: 13, fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--cream)' : 'rgba(246,241,231,0.55)',
                background: isActive ? 'rgba(246,241,231,0.06)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--ochre)' : '3px solid transparent',
                textDecoration: 'none',
              })}
            >
              <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '14px 22px 0', borderTop: '1px solid rgba(246,241,231,0.1)' }}>
          <div style={{ fontSize: 11.5, color: 'rgba(246,241,231,0.5)', marginBottom: 8, marginTop: 14 }}>
            {user?.full_name}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none',
              color: 'var(--tomato)', fontSize: 13, fontWeight: 600, padding: '8px 0', cursor: 'pointer'
            }}
          >
            {icons.logout} Déconnexion
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="mobile-topbar">
          <button
            onClick={() => setOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--cream)', cursor: 'pointer', padding: 0, display: 'flex' }}
            aria-label="Ouvrir le menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15 }}>SAFi Admin</span>
        </div>

        <main className="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
