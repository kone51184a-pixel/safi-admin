import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card, Button, Field, inputStyle, StatusPill } from '../components/UI';

const emptyForm = { full_name: '', phone: '' };

export default function Deliverers() {
  const { token } = useAuth();
  const [deliverers, setDeliverers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getDeliverers(token);
      setDeliverers(data);
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
      await api.createDeliverer(token, form);
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id, status) {
    setBusyId(id);
    try {
      await api.updateDeliverer(token, id, { status });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Supprimer le livreur "${name}" ?`)) return;
    setBusyId(id);
    try {
      await api.deleteDeliverer(token, id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const statusLabel = { available: 'Disponible', on_delivery: 'En course', offline: 'Hors ligne' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20 }}>Livreurs</h2>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>Équipe de livraison, assignable aux commandes</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Annuler' : '+ Ajouter un livreur'}</Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Nom complet">
                <input style={inputStyle} required value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Ex : Ibrahim Koné" />
              </Field>
              <Field label="Téléphone">
                <input style={inputStyle} required value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+223 76 00 00 00" />
              </Field>
            </div>
            {error && <p style={{ color: 'var(--tomato)', fontSize: 12, marginBottom: 10 }}>{error}</p>}
            <Button type="submit" variant="leaf" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer le livreur'}</Button>
          </form>
        </Card>
      )}

      <Card style={{ padding: 0 }}>
        {loading ? (
          <p style={{ padding: 18, fontSize: 12.5, color: 'var(--ink-soft)' }}>Chargement…</p>
        ) : deliverers.length === 0 ? (
          <p style={{ padding: 18, fontSize: 12.5, color: 'var(--ink-soft)' }}>Aucun livreur pour l'instant.</p>
        ) : (
          <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                {['Nom', 'Téléphone', 'Statut', 'Livraisons en cours', 'Actions'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-soft)', padding: '9px 10px', borderBottom: '1.5px solid var(--line)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deliverers.map((d) => (
                <tr key={d.id}>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{d.full_name}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{d.phone}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    <select
                      value={d.status}
                      disabled={busyId === d.id}
                      onChange={(e) => handleStatusChange(d.id, e.target.value)}
                      style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid var(--line)', fontSize: 11.5 }}
                    >
                      <option value="available">Disponible</option>
                      <option value="on_delivery">En course</option>
                      <option value="offline">Hors ligne</option>
                    </select>
                  </td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{d.active_deliveries}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)' }}>
                    <button disabled={busyId === d.id} onClick={() => handleDelete(d.id, d.full_name)} style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 7, padding: '5px 9px', fontSize: 11, cursor: 'pointer', color: 'var(--tomato)' }}>Supprimer</button>
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
