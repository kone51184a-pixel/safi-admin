import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card, StatCard, StatusPill } from '../components/UI';

export default function Dashboard() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [o, v] = await Promise.all([api.getOrders(token), api.getVendors(token)]);
        setOrders(o);
        setVendors(v);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const pendingMatch = orders.filter((o) => o.status === 'awaiting_matching').length;
  const inDelivery = orders.filter((o) => o.status === 'in_delivery' || o.status === 'picked_up').length;
  const totalToday = orders
    .filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 20 }}>Tableau de bord</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>Vue d'ensemble de l'activité SAFi</p>
      </div>

      {loading && <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Chargement…</p>}
      {error && <p style={{ fontSize: 13, color: 'var(--tomato)' }}>{error}</p>}

      {!loading && !error && (
        <>
          <div className="stat-grid-responsive">
            <StatCard label="Commandes totales" value={orders.length} />
            <StatCard label="Demandes à matcher" value={pendingMatch} sub="Nécessitent une action" />
            <StatCard label="En livraison" value={inDelivery} />
            <StatCard label="CA aujourd'hui" value={`${totalToday.toLocaleString()} F`} />
          </div>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ fontSize: 13.5 }}>Dernières commandes</h4>
            </div>
            {orders.length === 0 ? (
              <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>Aucune commande pour l'instant.</p>
            ) : (
              <div className="table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr>
                    {['N°', 'Client', 'Type', 'Montant', 'Statut'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-soft)', padding: '9px 10px', borderBottom: '1.5px solid var(--line)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 8).map((o) => (
                    <tr key={o.id}>
                      <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{o.order_number}</td>
                      <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>{o.client_name || '—'}</td>
                      <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>{o.order_type === 'free_request' ? 'Demande libre' : 'Catalogue'}</td>
                      <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{o.total ? `${Number(o.total).toLocaleString()} F` : '—'}</td>
                      <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}><StatusPill status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </Card>

          <Card>
            <h4 style={{ fontSize: 13.5, marginBottom: 10 }}>Vendeurs référencés</h4>
            <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{vendors.length} vendeur(s) actif(s) dans le système.</p>
          </Card>
        </>
      )}
    </div>
  );
}
