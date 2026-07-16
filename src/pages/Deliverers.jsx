import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card, Button, Field, inputStyle } from '../components/UI';

const emptyForm = { full_name: '', phone: '', address: '', date_of_birth: '', matricule: '', nina: '' };

export default function Deliverers() {
  const { token } = useAuth();
  const [deliverers, setDeliverers] = useState([]);
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
      const data = await api.getDeliverers(token);
      setDeliverers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  function startEdit(d) {
    setEditingId(d.id);
    setForm({
      full_name: d.full_name || '',
      phone: d.phone || '',
      address: d.address || '',
      date_of_birth: d.date_of_birth ? d.date_of_birth.slice(0, 10) : '',
      matricule: d.matricule || '',
      nina: d.nina || '',
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
        await api.updateDeliverer(token, editingId, form);
      } else {
        await api.createDeliverer(token, form);
      }
      cancelForm();
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20 }}>Livreurs</h2>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>Équipe de livraison, assignable aux commandes</p>
        </div>
        <Button onClick={showForm ? cancelForm : startAdd}>{showForm ? 'Annuler' : '+ Ajouter un livreur'}</Button>
      </div>

      {showForm && (
        <Card>
          <h4 style={{ fontSize: 13.5, marginBottom: 12 }}>{editingId ? 'Modifier le livreur' : 'Nouveau livreur'}</h4>
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
              <Field label="Adresse">
                <input style={inputStyle} value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Ex : Hamdallaye ACI, Bamako" />
              </Field>
              <Field label="Date de naissance">
                <input style={inputStyle} type="date" value={form.date_of_birth}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
              </Field>
              <Field label="Matricule">
                <input style={inputStyle} value={form.matricule}
                  onChange={(e) => setForm({ ...form, matricule: e.target.value })} placeholder="Ex : SAFI-LIV-001" />
              </Field>
              <Field label="NINA">
                <input style={inputStyle} value={form.nina}
                  onChange={(e) => setForm({ ...form, nina: e.target.value })} placeholder="Numéro d'Identification Nationale" />
              </Field>
            </div>
            {error && <p style={{ color: 'var(--tomato)', fontSize: 12, marginBottom: 10 }}>{error}</p>}
            <Button type="submit" variant="leaf" disabled={saving}>
              {saving ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : 'Enregistrer le livreur'}
            </Button>
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
                {['Nom', 'Matricule', 'NINA', 'Téléphone', 'Statut', 'En course', 'Actions'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontFamily: 'JetBrains Mono', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-soft)', padding: '9px 10px', borderBottom: '1.5px solid var(--line)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deliverers.map((d) => (
                <tr key={d.id}>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{d.full_name}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{d.matricule || '—'}</td>
                  <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono' }}>{d.nina || '—'}</td>
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
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => startEdit(d)} style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 7, padding: '5px 9px', fontSize: 11, cursor: 'pointer' }}>Modifier</button>
                      <button disabled={busyId === d.id} onClick={() => handleDelete(d.id, d.full_name)} style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 7, padding: '5px 9px', fontSize: 11, cursor: 'pointer', color: 'var(--tomato)' }}>Supprimer</button>
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
