import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card, StatusPill, inputStyle } from '../components/UI';

const STATUSES = ['pending', 'awaiting_matching', 'confirmed', 'picked_up', 'in_delivery', 'delivered', 'cancelled'];

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [deliverers, setDeliverers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [o, d] = await Promise.all([api.getOrders(token), api.getDeliverers(token)]);
      setOrders(o);
      setDeliverers(d);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  async function handleStatusChange(orderId, newStatus, delivererId) {
    setUpdating(orderId);
    try {
      await api.updateOrderStatus(token, orderId, newStatus, delivererId);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 20 }}>Commandes</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>Catalogue et demandes libres</p>
      </div>

      {error && <p style={{ color: 'var(--tomato)', fontSize: 12, marginBottom: 12 }}>{error}</p>}

      <Card style={{ padding: 0 }}>
        {loading ? (
          <p style={{ padding: 18, fontSize: 12.5, color: 'var(--ink-soft)' }}>Chargement…</p>
        ) : orders.length === 0 ? (
          <p style={{ padding: 18, fontSize: 12.5, color: 'var(--ink-soft)' }}>Aucune commande pour l'instant.</p>
        ) : (
          <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                {['N°', 'Client', 'Type', 'Détail', 'Montant', 'Statut', 'Livreur', 'Changer statut'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-soft)', padding: '9px 10px', borderBottom: '1.5px solid var(--line)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{o.order_number}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>{o.client_name || '—'}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>{o.order_type === 'free_request' ? 'Demande libre' : 'Catalogue'}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', maxWidth: 200, fontSize: 11.5, color: 'var(--ink-soft)' }}>
                    {o.free_request_description || '—'}
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{o.total ? `${Number(o.total).toLocaleString()} F` : '—'}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}><StatusPill status={o.status} /></td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    <select
                      style={{ ...inputStyle, padding: '5px 8px', fontSize: 11.5 }}
                      value={o.deliverer_id || ''}
                      disabled={updating === o.id}
                      onChange={(e) => handleStatusChange(o.id, o.status, e.target.value || null)}
                    >
                      <option value="">— Non assigné —</option>
                      {deliverers.map((d) => (
                        <option key={d.id} value={d.id}>{d.full_name}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    <select
                      style={{ ...inputStyle, padding: '6px 8px', fontSize: 11.5 }}
                      value={o.status}
                      disabled={updating === o.id}
                      onChange={(e) => handleStatusChange(o.id, e.target.value, o.deliverer_id)}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>
    </div>
  );
}
