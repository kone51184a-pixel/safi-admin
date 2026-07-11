import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card, Button, Field, inputStyle, StatusPill } from '../components/UI';

export default function Products() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', vendor_id: '', price: '', unit: 'kg', stock_quantity: '', description: '',
  });

  async function load() {
    setLoading(true);
    try {
      const [p, v] = await Promise.all([api.getProducts(token), api.getVendors(token)]);
      setProducts(p);
      setVendors(v);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.createProduct(token, {
        ...form,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity || 0),
        vendor_id: form.vendor_id || null,
      });
      setForm({ name: '', vendor_id: '', price: '', unit: 'kg', stock_quantity: '', description: '' });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 20 }}>Produits</h2>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>Catalogue, lié aux vendeurs</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Annuler' : '+ Ajouter un article'}</Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Nom de l'article">
                <input style={inputStyle} required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex : Tomates fraîches" />
              </Field>
              <Field label="Vendeur associé">
                <select style={inputStyle} value={form.vendor_id}
                  onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}>
                  <option value="">— Aucun / à définir —</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.full_name} — {v.market_zone}</option>
                  ))}
                </select>
              </Field>
              <Field label="Prix">
                <input style={inputStyle} type="number" required value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="750" />
              </Field>
              <Field label="Unité">
                <select style={inputStyle} value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  <option value="kg">kg</option>
                  <option value="sac">sac</option>
                  <option value="pièce">pièce</option>
                  <option value="litre">litre</option>
                </select>
              </Field>
              <Field label="Quantité en stock">
                <input style={inputStyle} type="number" value={form.stock_quantity}
                  onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} placeholder="45" />
              </Field>
              <Field label="Description">
                <input style={inputStyle} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optionnel" />
              </Field>
            </div>
            {error && <p style={{ color: 'var(--tomato)', fontSize: 12, marginBottom: 10 }}>{error}</p>}
            <Button type="submit" variant="leaf" disabled={saving}>{saving ? 'Enregistrement…' : "Enregistrer l'article"}</Button>
          </form>
        </Card>
      )}

      <Card style={{ padding: 0 }}>
        {loading ? (
          <p style={{ padding: 18, fontSize: 12.5, color: 'var(--ink-soft)' }}>Chargement…</p>
        ) : products.length === 0 ? (
          <p style={{ padding: 18, fontSize: 12.5, color: 'var(--ink-soft)' }}>Aucun produit pour l'instant.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                {['Produit', 'Vendeur', 'Prix', 'Stock', 'Statut'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-soft)', padding: '9px 10px', borderBottom: '1.5px solid var(--line)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>{p.vendor_name || '—'}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{Number(p.price).toLocaleString()} F/{p.unit}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{p.stock_quantity}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}><StatusPill status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
