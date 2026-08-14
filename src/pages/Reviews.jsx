import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card } from '../components/UI';

function Stars({ rating }) {
  return (
    <span style={{ color: 'var(--ochre)', fontSize: 13 }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function Reviews() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReviews(token).then(setReviews).finally(() => setLoading(false));
  }, [token]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 20 }}>Avis clients</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
          {avgRating ? `Note moyenne : ${avgRating}/5 sur ${reviews.length} avis` : 'Retours des clients sur leurs commandes'}
        </p>
      </div>

      {loading ? (
        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>Chargement…</p>
      ) : reviews.length === 0 ? (
        <Card><p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>Aucun avis pour l'instant.</p></Card>
      ) : (
        reviews.map((r) => (
          <Card key={r.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{r.client_name}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-soft)', marginLeft: 8, fontFamily: 'JetBrains Mono' }}>{r.order_number}</span>
              </div>
              <Stars rating={r.rating} />
            </div>
            {r.comment && <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{r.comment}</p>}
            <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 8 }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</div>
          </Card>
        ))
      )}
    </div>
  );
}
