import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card, StatusPill } from '../components/UI';

export default function Stock() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const [p, m] = await Promise.all([api.getProducts(token), api.getStockMovements(token)]);
    setProducts(p);
    setMovements(m);
    setLoading(false);
  }

  useEffect(() => { load(); }, [token]);

  async function adjust(id, change) {
    setBusyId(id);
    // Mise à jour locale immédiate (optimiste) pour que ça réagisse instantanément
    setProducts((prev) => prev.map((p) => (
      p.id === id ? { ...p, stock_quantity: Number(p.stock_quantity) + change } : p
    )));
    try {
      await api.adjustStock(token, id, change, change > 0 ? 'réappro' : 'ajustement manuel');
      // Rafraîchit juste l'historique des mouvements en tâche de fond, pas besoin de re-bloquer l'écran
      api.getStockMovements(token).then(setMovements).catch(() => {});
    } catch (err) {
      setError(err.message);
      await load(); // en cas d'erreur, on resynchronise pour ne pas laisser un état local incorrect
    } finally {
      setBusyId(null);
    }
  }

  const lowStock = products.filter((p) => Number(p.stock_quantity) <= Number(p.stock_alert_threshold));

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 20 }}>Stock</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>Quantités disponibles par produit</p>
      </div>

      {lowStock.length > 0 && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#FBEFE0', border: '1px solid #EBCFA0', borderRadius: 10, padding: '11px 14px', fontSize: 12, color: '#8A6116', marginBottom: 14 }}>
          ⚠ {lowStock.length} produit(s) en stock faible ou rupture
        </div>
      )}
      {error && <p style={{ color: 'var(--tomato)', fontSize: 12, marginBottom: 12 }}>{error}</p>}

      <Card style={{ padding: 0 }}>
        {loading ? (
          <p style={{ padding: 18, fontSize: 12.5, color: 'var(--ink-soft)' }}>Chargement…</p>
        ) : (
          <div className="table-scroll">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                {['Produit', 'Vendeur', 'Quantité', 'Seuil', 'Statut', 'Ajuster'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-soft)', padding: '9px 10px', borderBottom: '1.5px solid var(--line)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const low = Number(p.stock_quantity) <= Number(p.stock_alert_threshold);
                const out = Number(p.stock_quantity) <= 0;
                return (
                  <tr key={p.id}>
                    <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>{p.vendor_name || '—'}</td>
                    <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{p.stock_quantity} {p.unit}</td>
                    <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{p.stock_alert_threshold}</td>
                    <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                      <StatusPill status={out ? 'draft' : low ? 'draft' : 'published'} />
                    </td>
                    <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button disabled={busyId === p.id} onClick={() => adjust(p.id, -1)} style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 7, padding: '5px 9px', fontSize: 11, cursor: 'pointer' }}>−</button>
                        <button disabled={busyId === p.id} onClick={() => adjust(p.id, 1)} style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 7, padding: '5px 9px', fontSize: 11, cursor: 'pointer' }}>+</button>
                        <button disabled={busyId === p.id} onClick={() => adjust(p.id, 10)} style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 7, padding: '5px 9px', fontSize: 11, cursor: 'pointer' }}>+10</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
</div>
        )}
      </Card>

      <Card>
        <h4 style={{ fontSize: 13.5, marginBottom: 12 }}>Historique des mouvements</h4>
        {movements.length === 0 ? (
          <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>Aucun mouvement enregistré.</p>
        ) : (
          <div className="table-scroll">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                {['Date', 'Produit', 'Mouvement', 'Quantité', 'Par'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-soft)', padding: '9px 10px', borderBottom: '1.5px solid var(--line)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 15).map((m) => (
                <tr key={m.id}>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono', fontSize: 11 }}>{new Date(m.created_at).toLocaleString('fr-FR')}</td>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--line)' }}>{m.product_name}</td>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--line)' }}>{m.reason}</td>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono', color: m.quantity_change > 0 ? 'var(--success)' : 'var(--tomato)' }}>
                    {m.quantity_change > 0 ? '+' : ''}{m.quantity_change}
                  </td>
                  <td style={{ padding: '9px 10px', borderBottom: '1px solid var(--line)' }}>{m.performed_by_name || 'Système'}</td>
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
