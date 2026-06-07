import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/authState';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const data: any = res.data;
      const token = data?.token ?? data?.accessToken;
      if (!token) throw new Error('Missing token in response');
      loginWithToken(token);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Login failed');
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ marginTop: 0 }}>Login</h1>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit">Sign in</button>
        {error && <div style={{ color: 'salmon' }}>{error}</div>}
      </form>
    </div>
  );
}

