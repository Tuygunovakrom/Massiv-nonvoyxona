import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import useAuth from '../hooks/useAuth';
import { homeFor } from '../components/ProtectedRoute';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { token, user } = await authApi.login({ username, password });
      login(token, user);
      navigate(homeFor(user.role), { replace: true });
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="card login-card" onSubmit={submit}>
        <h1>Nonyovxona boshqaruvi</h1>
        <p className="muted">Tizimga kirish</p>
        <label className="label">Login</label>
        <input
          className="input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <label className="label">Parol</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {err && <p className="form-error">{err}</p>}
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Kirilyapti...' : 'Kirish'}
        </button>
      </form>
    </div>
  );
}
