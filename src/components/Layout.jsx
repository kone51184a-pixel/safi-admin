import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Tableau de bord', icon: '▣', end: true },
  { to: '/vendeurs', label: 'Vendeurs', icon: '◉' },
  { to: '/produits', label: 'Produits', icon: '▤' },
  { to: '/commandes', label: 'Commandes', icon: '▥' },
  { to: '/stock', label: 'Stock', icon: '▦' },
  { to: '/utilisateurs', label: 'Utilisateurs', icon: '◈' },
  { to: '/comptabilite', label: 'Comptabilité', icon: 'Ⓕ' },
  { to: '/parametres', label: 'Paramètres', icon: '⚙' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 230, background: 'var(--indigo-deep)', color: 'var(--cream)',
        padding: '22px 0', flexShrink: 0, display: 'flex', flexDirection: 'column'
      }}>
        <div style={{
          padding: '0 22px 22px', display: 'flex', alignItems: 'center', gap: 9,
          borderBottom: '1px solid rgba(246,241,231,0.1)', marginBottom: 14
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: 'linear-gradient(135deg, var(--leaf), var(--tomato))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--indigo-deep)', fontSize: 15
          }}>S</div>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}>SAFi Admin</div>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 11, padding: '11px 22px',
                fontSize: 13, fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--cream)' : 'rgba(246,241,231,0.55)',
                background: isActive ? 'rgba(246,241,231,0.06)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--ochre)' : '3px solid transparent',
                textDecoration: 'none',
              })}
            >
              <span>{item.icon}</span> {item.label}
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
              display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
              color: 'var(--tomato)', fontSize: 13, fontWeight: 600, padding: '8px 0', cursor: 'pointer'
            }}
          >
            ⏻ Déconnexion
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '28px 34px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
