import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card, StatusPill } from '../components/UI';

export default function Users() {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    const [c, r] = await Promise.all([api.getClients(token), api.getRoles(token)]);
    setClients(c);
    setRoles(r);
    setLoading(false);
  }

  useEffect(() => { load(); }, [token]);

  async function handleToggle(id) {
    setBusyId(id);
    try {
      await api.toggleClientActive(token, id);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 20 }}>Utilisateurs & rôles</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>Clients (restaurants/particuliers) et équipe</p>
      </div>

      <Card>
        <h4 style={{ fontSize: 13.5, marginBottom: 14 }}>Clients</h4>
        {loading ? (
          <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>Chargement…</p>
        ) : clients.length === 0 ? (
          <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>Aucun client pour l'instant.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                {['Nom', 'Type', 'Téléphone', 'Commandes', 'Statut', 'Actions'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-soft)', padding: '9px 10px', borderBottom: '1.5px solid var(--line)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{c.full_name}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', textTransform: 'capitalize' }}>{c.client_type}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{c.phone}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{c.order_count}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    <StatusPill status={c.is_active ? 'published' : 'draft'} />
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    <button
                      disabled={busyId === c.id}
                      onClick={() => handleToggle(c.id)}
                      style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 7, padding: '5px 10px', fontSize: 11, cursor: 'pointer', color: c.is_active ? 'var(--tomato)' : 'var(--success)' }}
                    >
                      {c.is_active ? 'Bloquer' : 'Débloquer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card>
        <h4 style={{ fontSize: 13.5, marginBottom: 14 }}>Permissions par rôle (équipe admin)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 1fr)', fontSize: 12 }}>
          <div></div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, textTransform: 'uppercase', color: 'var(--ink-soft)', textAlign: 'center', padding: '9px 6px' }}>Voir</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, textTransform: 'uppercase', color: 'var(--ink-soft)', textAlign: 'center', padding: '9px 6px' }}>Créer</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, textTransform: 'uppercase', color: 'var(--ink-soft)', textAlign: 'center', padding: '9px 6px' }}>Modifier</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, textTransform: 'uppercase', color: 'var(--ink-soft)', textAlign: 'center', padding: '9px 6px' }}>Supprimer</div>

          {roles.map((r) => (
            <RolRow key={r.id} role={r} />
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 14 }}>
          Ces rôles sont définis au niveau de la base de données. La modification des permissions depuis l'interface arrivera en phase 2.
        </p>
      </Card>
    </div>
  );
}

function RolRow({ role }) {
  const cell = (val) => (
    <div style={{ padding: '11px 6px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        width: 16, height: 16, borderRadius: 4, border: '1.5px solid var(--line)',
        background: val ? 'var(--tomato)' : 'transparent', borderColor: val ? 'var(--tomato)' : 'var(--line)',
        color: 'white', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>{val ? '✓' : ''}</div>
    </div>
  );
  return (
    <>
      <div style={{ padding: '11px 6px', borderTop: '1px solid var(--line)', fontWeight: 600, textTransform: 'capitalize' }}>
        {role.name.replaceAll('_', ' ')}
      </div>
      {cell(role.can_view)}
      {cell(role.can_create)}
      {cell(role.can_edit)}
      {cell(role.can_delete)}
    </>
  );
}
