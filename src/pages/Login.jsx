import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Field, inputStyle } from '../components/UI';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--indigo-deep)'
    }}>
      <form onSubmit={handleSubmit} style={{
        width: 360, background: 'var(--card)', borderRadius: 18, padding: 32,
        boxShadow: '0 30px 60px -20px rgba(16,22,42,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12, margin: '0 auto 12px',
            background: 'linear-gradient(135deg, var(--leaf), var(--tomato))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--indigo-deep)', fontSize: 20
          }}>S</div>
          <h2 style={{ fontSize: 19 }}>SAFi Admin</h2>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>Connexion à l'équipe</p>
        </div>

        <Field label="Téléphone">
          <input
            style={inputStyle}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+223 70 00 00 00"
            required
          />
        </Field>
        <Field label="Mot de passe">
          <input
            style={inputStyle}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </Field>

        {error && (
          <div style={{ background: '#FBEFE0', color: '#8A6116', fontSize: 12, padding: '9px 12px', borderRadius: 8, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <Button type="submit" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </div>
  );
}
