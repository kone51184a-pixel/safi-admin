import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card, StatusPill, inputStyle } from '../components/UI';

const STATUSES = ['pending', 'awaiting_matching', 'confirmed', 'picked_up', 'in_delivery', 'delivered', 'cancelled'];

const RESPONSE_LABEL = {
  pending: { text: '—', color: 'var(--ink-soft)' },
  accepted: { text: '✓ Acceptée', color: 'var(--success)' },
  refused: { text: '✕ Refusée', color: 'var(--tomato)' },
};

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [deliverers, setDeliverers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const [priceDrafts, setPriceDrafts] = useState({});
  const [feeDrafts, setFeeDrafts] = useState({});

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
      await api.updateOrderStatus(token, orderId, patch);
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
    await handleUpdate(order.id, { subtotal: Number(value) });
  }

  async function handleSetFee(order) {
    const value = feeDrafts[order.id];
    if (!value) return;
    await handleUpdate(order.id, { delivery_fee: Number(value) });
  }

  function smsLink(order) {
    const deliverer = deliverers.find((d) => d.id === order.deliverer_id);
    if (!deliverer) return null;
    const link = `${window.location.origin.replace('safi-admin', 'safi-client')}/livreur/${order.id}`;
    // NB : lien générique — remplace l'URL ci-dessous par celle de ton vrai site client si le remplacement automatique ne correspond pas
    const body = `SAFi - Nouvelle course ${order.order_number}. Client: ${order.client_name || ''} (${order.client_phone || ''}). Adresse: ${order.delivery_address || 'non renseignée'}. Articles: ${order.items_summary || order.free_request_description || ''}. Répondre ici: ${link}`;
    return `sms:${deliverer.phone}?body=${encodeURIComponent(body)}`;
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
                {['N°', 'Client', 'Adresse', 'Type', 'Articles / demande', 'Bio', 'Prix produits', 'Frais livr.', 'Total', 'Statut', 'Livreur', 'Réponse', 'SMS'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-soft)', padding: '9px 10px', borderBottom: '1.5px solid var(--line)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const link = smsLink(o);
                return (
                <tr key={o.id}>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{o.order_number}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>{o.client_name || '—'}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', maxWidth: 160, fontSize: 11.5 }}>{o.delivery_address || <span style={{ color: 'var(--tomato)' }}>Non renseignée</span>}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>{o.order_type === 'free_request' ? 'Demande libre' : 'Catalogue'}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', maxWidth: 200, fontSize: 11.5, color: 'var(--ink-soft)' }}>
                    {o.order_type === 'free_request' ? (
                      <>{o.free_request_description || '—'}{o.free_request_quantity_kg && <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}> ({o.free_request_quantity_kg} kg)</span>}</>
                    ) : (o.items_summary || '—')}
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontSize: 11.5 }}>
                    {o.wants_bio === true ? '🌱 Oui' : o.wants_bio === false ? 'Non' : '—'}
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>
                    {o.subtotal && Number(o.subtotal) > 0 ? (
                      `${Number(o.subtotal).toLocaleString()} F`
                    ) : o.order_type === 'free_request' ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="number"
                          placeholder="Prix F"
                          value={priceDrafts[o.id] || ''}
                          onChange={(e) => setPriceDrafts({ ...priceDrafts, [o.id]: e.target.value })}
                          style={{ ...inputStyle, width: 70, padding: '5px 6px', fontSize: 11 }}
                        />
                        <button
                          disabled={updating === o.id}
                          onClick={() => handleSetPrice(o)}
                          style={{ border: '1px solid var(--line)', background: 'var(--leaf)', color: 'white', borderRadius: 7, padding: '5px 8px', fontSize: 10.5, cursor: 'pointer' }}
                        >
                          Fixer
                        </button>
                      </div>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        type="number"
                        placeholder={o.delivery_fee || '0'}
                        value={feeDrafts[o.id] ?? ''}
                        onChange={(e) => setFeeDrafts({ ...feeDrafts, [o.id]: e.target.value })}
                        style={{ ...inputStyle, width: 65, padding: '5px 6px', fontSize: 11 }}
                      />
                      <button disabled={updating === o.id} onClick={() => handleSetFee(o)} style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 7, padding: '5px 7px', fontSize: 10.5, cursor: 'pointer' }}>OK</button>
                    </div>
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
                    {o.total && Number(o.total) > 0 ? `${Number(o.total).toLocaleString()} F` : '—'}
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}><StatusPill status={o.status} /></td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    <select
                      style={{ ...inputStyle, padding: '5px 8px', fontSize: 11.5 }}
                      value={o.deliverer_id || ''}
                      disabled={updating === o.id}
                      onChange={(e) => handleUpdate(o.id, { deliverer_id: e.target.value || null })}
                    >
                      <option value="">— Non assigné —</option>
                      {deliverers.map((d) => (
                        <option key={d.id} value={d.id}>{d.full_name}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontSize: 11, fontWeight: 600, color: RESPONSE_LABEL[o.deliverer_response || 'pending'].color }}>
                    {RESPONSE_LABEL[o.deliverer_response || 'pending'].text}
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    {link ? (
                      <a href={link} style={{ fontSize: 11, color: 'var(--indigo)', fontWeight: 600, textDecoration: 'none', border: '1px solid var(--line)', borderRadius: 7, padding: '5px 8px', whiteSpace: 'nowrap' }}>
                        📩 Envoyer
                      </a>
                    ) : (
                      <span style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>Assigner d'abord</span>
                    )}
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
          </div>
        )}
      </Card>

      {/* Sélecteur de statut séparé, par commande, affiché sous le tableau pour rester lisible sur mobile */}
      {!loading && orders.length > 0 && (
        <Card>
          <h4 style={{ fontSize: 13, marginBottom: 10 }}>Changer le statut d'une commande</h4>
          {orders.map((o) => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11.5, minWidth: 90 }}>{o.order_number}</span>
              <select
                style={{ ...inputStyle, padding: '6px 8px', fontSize: 11.5, maxWidth: 180 }}
                value={o.status}
                disabled={updating === o.id}
                onChange={(e) => handleUpdate(o.id, { status: e.target.value })}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
