import { useState } from 'react';
import { Card } from '../components/UI';

function SettingsRow({ title, desc, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
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
  const [notifications, setNotifications] = useState(true);
  const [logging, setLogging] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 20 }}>Paramètres</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>Configuration générale de la plateforme</p>
      </div>

      <Card>
        <h4 style={{ fontSize: 13.5, marginBottom: 6 }}>Plateforme</h4>
        <SettingsRow title="Nom & logo" desc="SAFi — sourcing & livraison"
          action={<button style={{ background: 'var(--sand)', border: 'none', borderRadius: 9, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Modifier</button>} />
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
        Note MVP : cette page est pour l'instant une interface de démonstration — les réglages ne sont pas encore sauvegardés en base. On branchera ça sur une vraie table `settings` en phase 2, une fois les priorités confirmées avec le client.
      </p>
    </div>
  );
}
