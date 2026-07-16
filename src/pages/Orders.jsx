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
  const [priceDrafts, setPriceDrafts] = useState({});

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

  async function handleUpdate(orderId, patch) {
    setUpdating(orderId);
    try {
      await api.updateOrderStatus(token, orderId, patch.status, patch.deliverer_id, patch.total);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function handleSetPrice(order) {
    const value = priceDrafts[order.id];
    if (!value) return;
    setUpdating(order.id);
    try {
      await api.updateOrderStatus(token, order.id, order.status, order.deliverer_id, Number(value));
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
                {['N°', 'Client', 'Type', 'Articles / demande', 'Bio', 'Montant', 'Statut', 'Livreur', 'Changer statut'].map((h) => (
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
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', maxWidth: 220, fontSize: 11.5, color: 'var(--ink-soft)' }}>
                    {o.order_type === 'free_request' ? (o.free_request_description || '—') : (o.items_summary || '—')}
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontSize: 11.5 }}>
                    {o.wants_bio === true ? '🌱 Oui' : o.wants_bio === false ? 'Non' : '—'}
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>
                    {o.total && Number(o.total) > 0 ? (
                      `${Number(o.total).toLocaleString()} F`
                    ) : o.order_type === 'free_request' ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="number"
                          placeholder="Prix F"
                          value={priceDrafts[o.id] || ''}
                          onChange={(e) => setPriceDrafts({ ...priceDrafts, [o.id]: e.target.value })}
                          style={{ ...inputStyle, width: 80, padding: '5px 8px', fontSize: 11 }}
                        />
                        <button
                          disabled={updating === o.id}
                          onClick={() => handleSetPrice(o)}
                          style={{ border: '1px solid var(--line)', background: 'var(--leaf)', color: 'white', borderRadius: 7, padding: '5px 9px', fontSize: 11, cursor: 'pointer' }}
                        >
                          Fixer
                        </button>
                      </div>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}><StatusPill status={o.status} /></td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    <select
                      style={{ ...inputStyle, padding: '5px 8px', fontSize: 11.5 }}
                      value={o.deliverer_id || ''}
                      disabled={updating === o.id}
                      onChange={(e) => handleUpdate(o.id, { status: o.status, deliverer_id: e.target.value || null })}
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
                      onChange={(e) => handleUpdate(o.id, { status: e.target.value, deliverer_id: o.deliverer_id })}
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
