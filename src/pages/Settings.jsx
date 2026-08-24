import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card, Button, inputStyle } from '../components/UI';

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

// Champ réglage éditable générique, branché sur platform_settings
function EditableSetting({ label, settingKey, value, onSaved, suffix, placeholder, type = 'number', displayFormat }) {
  const { token } = useAuth();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function start() {
    setInput(value);
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      await api.updateSetting(token, settingKey, input);
      onSaved(input);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const shownValue = displayFormat ? displayFormat(value) : value;

  return (
    <SettingsRow
      title={label}
      desc={editing ? 'Sauvegarde immédiate' : (value ? `Actuellement : ${shownValue}${suffix ? ' ' + suffix : ''}` : 'Non configuré')}
      action={
        editing ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              style={{ ...inputStyle, width: 140, padding: '8px 10px' }}
              type={type}
              value={input}
              placeholder={placeholder}
              onChange={(e) => setInput(e.target.value)}
            />
            {suffix && <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{suffix}</span>}
            <Button variant="leaf" onClick={save} disabled={saving} style={{ padding: '8px 14px' }}>
              {saving ? '…' : 'Valider'}
            </Button>
            <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', fontSize: 12, cursor: 'pointer' }}>Annuler</button>
            {error && <span style={{ fontSize: 11, color: 'var(--tomato)' }}>{error}</span>}
          </div>
        ) : (
          <button onClick={start} style={{ background: 'var(--sand)', border: 'none', borderRadius: 9, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Modifier</button>
        )
      }
    />
  );
}

export default function Settings() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [logging, setLogging] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);

  const [settings, setSettings] = useState({});
  const [error, setError] = useState('');

  async function load() {
    try {
      const data = await api.getSettings(token);
      setSettings(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, [token]);

  function updateLocal(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
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

        <EditableSetting
          label="Frais de livraison (par défaut)"
          settingKey="delivery_fee"
          value={settings.delivery_fee || '1000'}
          onSaved={(v) => updateLocal('delivery_fee', v)}
          suffix="FCFA"
          displayFormat={(v) => Number(v).toLocaleString()}
        />

        <EditableSetting
          label="Taux de TVA"
          settingKey="tva_rate"
          value={settings.tva_rate || '18'}
          onSaved={(v) => updateLocal('tva_rate', v)}
          suffix="%"
        />

        <SettingsRow title="Zones & tarifs de livraison" desc="Le prix exact par commande se règle directement dans Commandes (varie selon la distance)"
          action={null} />
      </Card>

      <Card>
        <h4 style={{ fontSize: 13.5, marginBottom: 6 }}>Paiement (dépôt manuel)</h4>
        <p style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginBottom: 4 }}>
          Pas d'API de paiement pour l'instant — le client envoie l'argent directement à ces numéros, puis confirme sa commande.
        </p>

        <EditableSetting
          label="Numéro Max it (Orange Money)"
          settingKey="orange_money_number"
          value={settings.orange_money_number || ''}
          onSaved={(v) => updateLocal('orange_money_number', v)}
          type="text"
          placeholder="+223 70 00 00 00"
        />
        <EditableSetting
          label="Numéro Wave"
          settingKey="wave_number"
          value={settings.wave_number || ''}
          onSaved={(v) => updateLocal('wave_number', v)}
          type="text"
          placeholder="+223 70 00 00 00"
        />
        <EditableSetting
          label="Numéro Moov Money"
          settingKey="moov_money_number"
          value={settings.moov_money_number || ''}
          onSaved={(v) => updateLocal('moov_money_number', v)}
          type="text"
          placeholder="+223 70 00 00 00"
        />
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
        Note : frais de livraison, TVA et numéros de paiement sont réellement sauvegardés en base. Notifications/sauvegarde restent des interrupteurs de démonstration pour l'instant.
      </p>
    </div>
  );
}
