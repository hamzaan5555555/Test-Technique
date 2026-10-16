import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (requestError) {
      setError(
        requestError.response?.data?.error?.message
          || requestError.response?.data?.error
          || 'Connexion impossible. Vérifiez vos identifiants et réessayez.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="login-layout">
      <div className="login-note">
        <p className="eyebrow">ESPACE ORGANISATION</p>
        <h1>Vos événements, bien coordonnés.</h1>
        <p>Connectez-vous pour retrouver votre programmation et suivre les inscriptions.</p>
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
        <div>
          <p className="form-kicker">EVENTHUB</p>
          <h2>Connexion</h2>
          <p className="form-intro">Accédez à votre espace de gestion.</p>
        </div>
        <label>Adresse e-mail<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Mot de passe<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error && <p role="alert" className="form-error">{error}</p>}
        <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
      </form>
    </section>
  );
}
