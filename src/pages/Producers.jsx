import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card, Button, Field, inputStyle, StatusPill } from '../components/UI';

const emptyForm = { full_name: '', phone: '', location: '', products_offered: '', notes: '' };

export default function Producers() {
  const { token } = useAuth();
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getProducers(token);
      setProducers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      full_name: p.full_name || '',
      phone: p.phone || '',
      location: p.location || '',
      products_offered: p.products_offered || '',
      notes: p.notes || '',
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
      if (editingId) {
        await api.updateProducer(token, editingId, form);
      } else {
        await api.createProducer(token, form);
      }
      cancelForm();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Supprimer le producteur "${name}" ?`)) return;
    setBusyId(id);
    try {
      await api.deleteProducer(token, id);
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
          <h2 style={{ fontSize: 20 }}>Producteurs</h2>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>Agriculteurs/exploitations fournissant en gros — distincts des vendeurs de marché</p>
        </div>
        <Button onClick={showForm ? cancelForm : startAdd}>{showForm ? 'Annuler' : '+ Ajouter un producteur'}</Button>
      </div>

      {showForm && (
        <Card>
          <h4 style={{ fontSize: 13.5, marginBottom: 12 }}>{editingId ? 'Modifier le producteur' : 'Nouveau producteur'}</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Nom complet / Exploitation">
                <input style={inputStyle} required value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Ex : Exploitation Diarra" />
              </Field>
              <Field label="Téléphone">
                <input style={inputStyle} value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+223 76 00 00 00" />
              </Field>
              <Field label="Localisation">
                <input style={inputStyle} value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ex : Baguineda" />
              </Field>
              <Field label="Produits proposés">
                <input style={inputStyle} value={form.products_offered}
                  onChange={(e) => setForm({ ...form, products_offered: e.target.value })} placeholder="Ex : Tomates, oignons, riz" />
              </Field>
              <Field label="Notes">
                <input style={inputStyle} value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optionnel" />
              </Field>
            </div>
            {error && <p style={{ color: 'var(--tomato)', fontSize: 12, marginBottom: 10 }}>{error}</p>}
            <Button type="submit" variant="leaf" disabled={saving}>
              {saving ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : 'Enregistrer le producteur'}
            </Button>
          </form>
        </Card>
      )}

      <Card style={{ padding: 0 }}>
        {loading ? (
          <p style={{ padding: 18, fontSize: 12.5, color: 'var(--ink-soft)' }}>Chargement…</p>
        ) : producers.length === 0 ? (
          <p style={{ padding: 18, fontSize: 12.5, color: 'var(--ink-soft)' }}>Aucun producteur pour l'instant.</p>
        ) : (
          <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                {['Nom', 'Téléphone', 'Localisation', 'Produits', 'Statut', 'Actions'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-soft)', padding: '9px 10px', borderBottom: '1.5px solid var(--line)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {producers.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{p.full_name}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{p.phone || '—'}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>{p.location || '—'}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontSize: 11.5, color: 'var(--ink-soft)', maxWidth: 200 }}>{p.products_offered || '—'}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    <StatusPill status={p.is_active ? 'published' : 'draft'} />
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => startEdit(p)} style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 7, padding: '5px 9px', fontSize: 11, cursor: 'pointer' }}>Modifier</button>
                      <button disabled={busyId === p.id} onClick={() => handleDelete(p.id, p.full_name)} style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 7, padding: '5px 9px', fontSize: 11, cursor: 'pointer', color: 'var(--tomato)' }}>Supprimer</button>
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
