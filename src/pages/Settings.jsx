import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card, Button, Field, inputStyle } from '../components/UI';

function SettingsRow({ title, desc, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--line)', flexWrap: 'wrap', gap: 10 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2 }}>{desc}</div>
      </div>
      {action}
    </div>
  );
}

function Toggle({ on, onClick }) {
  return (
    <div onClick={onClick} style={{
      width: 38, height: 22, borderRadius: 20, background: on ? 'var(--success)' : 'var(--sand)',
      position: 'relative', cursor: 'pointer', flexShrink: 0
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute',
        top: 3, left: on ? 19 : 3, transition: '.15s'
      }} />
    </div>
  );
}

export default function Settings() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [logging, setLogging] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);

  const [deliveryFee, setDeliveryFee] = useState('');
  const [editingFee, setEditingFee] = useState(false);
  const [feeInput, setFeeInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const settings = await api.getSettings(token);
      setDeliveryFee(settings.delivery_fee || '1000');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, [token]);

  function startEditFee() {
    setFeeInput(deliveryFee);
    setEditingFee(true);
  }

  async function saveFee() {
    setSaving(true);
    setError('');
    try {
      await api.updateSetting(token, 'delivery_fee', feeInput);
      setDeliveryFee(feeInput);
      setEditingFee(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 20 }}>Paramètres</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>Configuration générale de la plateforme</p>
      </div>

      {error && <p style={{ color: 'var(--tomato)', fontSize: 12, marginBottom: 12 }}>{error}</p>}

      <Card>
        <h4 style={{ fontSize: 13.5, marginBottom: 6 }}>Plateforme</h4>
        <SettingsRow title="Nom & logo" desc="SAFi — sourcing & livraison"
          action={<button style={{ background: 'var(--sand)', border: 'none', borderRadius: 9, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Modifier</button>} />

        <SettingsRow
          title="Frais de livraison"
          desc={editingFee ? 'Appliqué à toutes les nouvelles commandes' : `Actuellement : ${Number(deliveryFee).toLocaleString()} FCFA par commande`}
          action={
            editingFee ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  style={{ ...inputStyle, width: 110, padding: '8px 10px' }}
                  type="number"
                  value={feeInput}
                  onChange={(e) => setFeeInput(e.target.value)}
                />
                <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>FCFA</span>
                <Button variant="leaf" onClick={saveFee} disabled={saving} style={{ padding: '8px 14px' }}>
                  {saving ? '…' : 'Valider'}
                </Button>
                <button onClick={() => setEditingFee(false)} style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', fontSize: 12, cursor: 'pointer' }}>Annuler</button>
              </div>
            ) : (
              <button onClick={startEditFee} style={{ background: 'var(--sand)', border: 'none', borderRadius: 9, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Modifier</button>
            )
          }
        />

        <SettingsRow title="Configuration paiement" desc="Clés API Orange Money / Moov Money (phase 2)"
          action={<button style={{ background: 'var(--sand)', border: 'none', borderRadius: 9, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Configurer</button>} />
        <SettingsRow title="Zones & tarifs de livraison" desc="Bamako et communes environnantes"
          action={<button style={{ background: 'var(--sand)', border: 'none', borderRadius: 9, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Configurer</button>} />
      </Card>

      <Card>
        <h4 style={{ fontSize: 13.5, marginBottom: 6 }}>Sécurité & journalisation</h4>
        <SettingsRow title="Notifications SMS/email" desc="Alerte commande, changement de statut"
          action={<Toggle on={notifications} onClick={() => setNotifications(!notifications)} />} />
        <SettingsRow title="Journal des actions" desc="Historique horodaté par utilisateur (déjà actif en base)"
          action={<Toggle on={logging} onClick={() => setLogging(!logging)} />} />
        <SettingsRow title="Sauvegarde automatique" desc="Fréquence : toutes les 24h"
          action={<Toggle on={autoBackup} onClick={() => setAutoBackup(!autoBackup)} />} />
      </Card>

      <p style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
        Note : les frais de livraison sont maintenant réellement sauvegardés en base et utilisés par l'app client. Les autres réglages (notifications, sauvegarde) restent des interrupteurs de démonstration pour l'instant.
      </p>
    </div>
  );
}
