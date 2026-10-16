import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@eventhub.com');
  const [password, setPassword] = useState('Admin123!');
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
          || 'Sign in failed. Check that the API is running.'
      );
    } finally {
      setBusy(false);
    }
  }

  return <section className="login-layout">
    <div className="login-note"><p className="eyebrow">Organizer access</p><h1>Make room for good things.</h1><p>Sign in to see what is happening across your events.</p></div>
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Sign in</h2>
      <label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Continue'}</button>
    </form>
  </section>;
}
