import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card, Button, Field, inputStyle, StatusPill } from '../components/UI';

const emptyForm = { name: '', vendor_id: '', category_id: '', price: '', unit: 'kg', stock_quantity: '', stock_alert_threshold: '', description: '', photo_url: '' };

export default function Products() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setLoading(true);
    try {
      const [p, v, c] = await Promise.all([api.getProducts(token), api.getVendors(token), api.getCategories(token)]);
      setProducts(p);
      setVendors(v);
      setCategories(c);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name || '',
      vendor_id: product.vendor_id || '',
      category_id: product.category_id || '',
      price: product.price || '',
      unit: product.unit || 'kg',
      stock_quantity: product.stock_quantity || '',
      stock_alert_threshold: product.stock_alert_threshold || '',
      description: product.description || '',
      photo_url: product.photo_url || '',
    });
    setShowForm(true);
  }

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity || 0),
        stock_alert_threshold: form.stock_alert_threshold ? Number(form.stock_alert_threshold) : undefined,
        vendor_id: form.vendor_id || null,
        category_id: form.category_id || null,
      };
      if (editingId) {
        await api.updateProduct(token, editingId, payload);
      } else {
        await api.createProduct(token, payload);
      }
      cancelForm();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id, name) {
    if (!window.confirm(`Retirer "${name}" du catalogue ? Il ne sera plus visible par les clients (mais reste dans l'historique des commandes passées).`)) return;
    setBusyId(id);
    try {
      await api.archiveProduct(token, id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRepublish(id) {
    setBusyId(id);
    try {
      await api.updateProduct(token, id, { status: 'published' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20 }}>Produits</h2>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>Catalogue, lié aux vendeurs et catégories</p>
        </div>
        <Button onClick={showForm ? cancelForm : startAdd}>{showForm ? 'Annuler' : '+ Ajouter un article'}</Button>
      </div>

      {showForm && (
        <Card>
          <h4 style={{ fontSize: 13.5, marginBottom: 12 }}>{editingId ? "Modifier l'article" : 'Nouvel article'}</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Nom de l'article">
                <input style={inputStyle} required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex : Tomates fraîches" />
              </Field>
              <Field label="Catégorie">
                <select style={inputStyle} required value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">— Choisir une catégorie —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
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
              <Field label="Seuil d'alerte stock faible">
                <input style={inputStyle} type="number" value={form.stock_alert_threshold}
                  onChange={(e) => setForm({ ...form, stock_alert_threshold: e.target.value })} placeholder="5 (par défaut)" />
              </Field>
              <Field label="Description">
                <input style={inputStyle} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optionnel" />
              </Field>
              <Field label="Lien photo (URL)">
                <input style={inputStyle} value={form.photo_url}
                  onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://…" />
              </Field>
              {form.photo_url && (
                <div style={{ gridColumn: '1/-1' }}>
                  <img src={form.photo_url} alt="Aperçu" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--line)' }}
                    onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
            </div>
            {error && <p style={{ color: 'var(--tomato)', fontSize: 12, marginBottom: 10 }}>{error}</p>}
            <Button type="submit" variant="leaf" disabled={saving}>
              {saving ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : "Enregistrer l'article"}
            </Button>
          </form>
        </Card>
      )}

      <Card style={{ padding: 0 }}>
        {loading ? (
          <p style={{ padding: 18, fontSize: 12.5, color: 'var(--ink-soft)' }}>Chargement…</p>
        ) : products.length === 0 ? (
          <p style={{ padding: 18, fontSize: 12.5, color: 'var(--ink-soft)' }}>Aucun produit pour l'instant.</p>
        ) : (
          <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                {['', 'Produit', 'Catégorie', 'Vendeur', 'Prix', 'Stock', 'Statut', 'Actions'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-soft)', padding: '9px 10px', borderBottom: '1.5px solid var(--line)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    {p.photo_url ? (
                      <img src={p.photo_url} alt={p.name} style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🥬</div>
                    )}
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    {p.category_name ? p.category_name : <span style={{ color: 'var(--tomato)' }}>Non classé</span>}
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>{p.vendor_name || '—'}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{Number(p.price).toLocaleString()} F/{p.unit}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{p.stock_quantity}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}><StatusPill status={p.status} /></td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => startEdit(p)} style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 7, padding: '5px 9px', fontSize: 11, cursor: 'pointer' }}>Modifier</button>
                      {p.status === 'published' ? (
                        <button disabled={busyId === p.id} onClick={() => handleArchive(p.id, p.name)} style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 7, padding: '5px 9px', fontSize: 11, cursor: 'pointer', color: 'var(--tomato)' }}>Retirer</button>
                      ) : (
                        <button disabled={busyId === p.id} onClick={() => handleRepublish(p.id)} style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 7, padding: '5px 9px', fontSize: 11, cursor: 'pointer', color: 'var(--success)' }}>Republier</button>
                      )}
                    </div>
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
