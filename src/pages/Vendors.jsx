import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card, Button, Field, inputStyle, StatusPill } from '../components/UI';

export default function Vendors() {
  const { token } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', market_zone: '', notes: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.createVendor(token, form);
      setForm({ full_name: '', phone: '', market_zone: '', notes: '' });
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
          <h2 style={{ fontSize: 20 }}>Vendeurs</h2>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>Vendeurs informels référencés — sans compte, saisis par l'équipe</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Annuler' : '+ Ajouter un vendeur'}</Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
            <Button type="submit" variant="leaf" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer le vendeur'}</Button>
          </form>
        </Card>
      )}

      <Card style={{ padding: 0 }}>
        {loading ? (
          <p style={{ padding: 18, fontSize: 12.5, color: 'var(--ink-soft)' }}>Chargement…</p>
        ) : vendors.length === 0 ? (
          <p style={{ padding: 18, fontSize: 12.5, color: 'var(--ink-soft)' }}>Aucun vendeur pour l'instant.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                {['Nom', 'Téléphone', 'Zone', 'Statut'].map((h) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
