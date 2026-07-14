import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card, Button, Field, inputStyle, StatusPill } from '../components/UI';

const emptyForm = { full_name: '', phone: '', market_zone: '', notes: '' };

export default function Vendors() {
  const { token } = useAuth();
  const [vendors, setVendors] = useState([]);
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
      const data = await api.getVendors(token);
      setVendors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  function startEdit(vendor) {
    setEditingId(vendor.id);
    setForm({
      full_name: vendor.full_name || '',
      phone: vendor.phone || '',
      market_zone: vendor.market_zone || '',
      notes: vendor.notes || '',
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
        await api.updateVendor(token, editingId, form);
      } else {
        await api.createVendor(token, form);
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
    if (!window.confirm(`Supprimer le vendeur "${name}" ? Ses produits resteront mais ne seront plus liés à un vendeur.`)) return;
    setBusyId(id);
    try {
      await api.deleteVendor(token, id);
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
          <h2 style={{ fontSize: 20 }}>Vendeurs</h2>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>Vendeurs informels référencés — sans compte, saisis par l'équipe</p>
        </div>
        <Button onClick={showForm ? cancelForm : startAdd}>{showForm ? 'Annuler' : '+ Ajouter un vendeur'}</Button>
      </div>

      {showForm && (
        <Card>
          <h4 style={{ fontSize: 13.5, marginBottom: 12 }}>{editingId ? 'Modifier le vendeur' : 'Nouveau vendeur'}</h4>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="form-grid-responsive">
              <Field label="Nom complet">
                <input style={inputStyle} required value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Ex : Mariam Coulibaly" />
              </Field>
              <Field label="Téléphone">
                <input style={inputStyle} value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+223 76 00 00 00" />
              </Field>
              <Field label="Marché / zone">
                <input style={inputStyle} value={form.market_zone}
                  onChange={(e) => setForm({ ...form, market_zone: e.target.value })} placeholder="Ex : Marché de Médine" />
              </Field>
              <Field label="Notes">
                <input style={inputStyle} value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Ex : Vend tomates et poivrons" />
              </Field>
            </div>
            {error && <p style={{ color: 'var(--tomato)', fontSize: 12, marginBottom: 10 }}>{error}</p>}
            <Button type="submit" variant="leaf" disabled={saving}>
              {saving ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : 'Enregistrer le vendeur'}
            </Button>
          </form>
        </Card>
      )}

      <Card style={{ padding: 0 }}>
        {loading ? (
          <p style={{ padding: 18, fontSize: 12.5, color: 'var(--ink-soft)' }}>Chargement…</p>
        ) : vendors.length === 0 ? (
          <p style={{ padding: 18, fontSize: 12.5, color: 'var(--ink-soft)' }}>Aucun vendeur pour l'instant.</p>
        ) : (
          <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                {['Nom', 'Téléphone', 'Zone', 'Statut', 'Actions'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-soft)', padding: '9px 10px', borderBottom: '1.5px solid var(--line)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id}>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{v.full_name}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{v.phone || '—'}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>{v.market_zone || '—'}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    <StatusPill status={v.is_active ? 'published' : 'draft'} />
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => startEdit(v)} style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 7, padding: '5px 9px', fontSize: 11, cursor: 'pointer' }}>Modifier</button>
                      <button disabled={busyId === v.id} onClick={() => handleDelete(v.id, v.full_name)} style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 7, padding: '5px 9px', fontSize: 11, cursor: 'pointer', color: 'var(--tomato)' }}>Supprimer</button>
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
