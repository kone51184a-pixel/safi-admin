import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card, StatCard, StatusPill } from '../components/UI';

export default function Accounting() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrders(token).then(setOrders).finally(() => setLoading(false));
  }, [token]);

  const delivered = orders.filter((o) => o.status === 'delivered');
  const totalRevenue = delivered.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const pendingAmount = orders
    .filter((o) => !['delivered', 'cancelled'].includes(o.status))
    .reduce((sum, o) => sum + Number(o.total || 0), 0);
  const thisMonth = orders.filter((o) => {
    const d = new Date(o.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthRevenue = thisMonth
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  function exportCsv() {
    const rows = [
      ['N°', 'Client', 'Type', 'Montant', 'Statut', 'Date'],
      ...orders.map((o) => [o.order_number, o.client_name || '', o.order_type, o.total || 0, o.status, o.created_at]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'safi-commandes.csv';
    a.click();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 20 }}>Comptabilité</h2>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>Revenus et transactions</p>
        </div>
        <button onClick={exportCsv} style={{ background: 'var(--sand)', border: 'none', borderRadius: 9, padding: '9px 15px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
          ⇩ Exporter (CSV)
        </button>
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Chargement…</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
            <StatCard label="Revenu total (livrées)" value={`${totalRevenue.toLocaleString()} F`} />
            <StatCard label="Revenu ce mois" value={`${monthRevenue.toLocaleString()} F`} />
            <StatCard label="En attente d'encaissement" value={`${pendingAmount.toLocaleString()} F`} />
            <StatCard label="Commandes livrées" value={delivered.length} />
          </div>

          <Card style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr>
                  {['Date', 'N°', 'Client', 'Montant', 'Statut'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-soft)', padding: '9px 10px', borderBottom: '1.5px solid var(--line)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono', fontSize: 11 }}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                    <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{o.order_number}</td>
                    <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>{o.client_name || '—'}</td>
                    <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{o.total ? `${Number(o.total).toLocaleString()} F` : '—'}</td>
                    <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}><StatusPill status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 12 }}>
            Note MVP : ces chiffres sont calculés à partir des commandes. Le détail des paiements par méthode (Orange Money, Moov Money, espèces) et la part reversée aux vendeurs arriveront avec la vraie intégration paiement en phase 2.
          </p>
        </>
      )}
    </div>
  );
}
