export function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 13,
      padding: 18, marginBottom: 18, ...style
    }}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 13, padding: 16 }}>
      <div style={{ fontSize: 10.5, fontFamily: 'JetBrains Mono', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 700, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function Button({ children, variant = 'primary', ...props }) {
  const variants = {
    primary: { background: 'var(--tomato)', color: 'var(--cream)' },
    leaf: { background: 'var(--leaf)', color: 'var(--cream)' },
    ghost: { background: 'var(--sand)', color: 'var(--ink)' },
    outline: { background: 'transparent', color: 'var(--indigo)', border: '1.5px solid var(--indigo)' },
  };
  return (
    <button
      {...props}
      style={{
        padding: '10px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, border: 'none',
        ...variants[variant], ...props.style
      }}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputStyle = {
  width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid var(--line)',
  fontSize: 13, background: 'var(--card)', color: 'var(--ink)',
};

export function StatusPill({ status }) {
  const map = {
    pending: { bg: '#F3E4C4', color: '#8A6116', label: 'En attente' },
    awaiting_matching: { bg: '#DDE3F0', color: 'var(--indigo)', label: 'À matcher' },
    confirmed: { bg: '#DDE3F0', color: 'var(--indigo)', label: 'Confirmée' },
    picked_up: { bg: '#DCE6E0', color: '#3D5C48', label: 'Récupérée' },
    in_delivery: { bg: '#DCE6E0', color: '#3D5C48', label: 'En livraison' },
    delivered: { bg: '#DCEADD', color: 'var(--success)', label: 'Livrée' },
    cancelled: { bg: '#F5DADA', color: 'var(--tomato)', label: 'Annulée' },
    published: { bg: '#DCEADD', color: 'var(--success)', label: 'Actif' },
    draft: { bg: '#F3E4C4', color: '#8A6116', label: 'Brouillon' },
  };
  const s = map[status] || { bg: 'var(--sand)', color: 'var(--ink-soft)', label: status };
  return (
    <span style={{
      fontSize: 9.5, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
      fontFamily: 'JetBrains Mono', background: s.bg, color: s.color, whiteSpace: 'nowrap'
    }}>
      {s.label.toUpperCase()}
    </span>
  );
}
