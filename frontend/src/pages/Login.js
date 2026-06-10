import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'candidate' ? '/my-applications' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin:      { email: 'admin@talentos.com', password: 'Admin@123' },
      hr_manager: { email: 'hr@talentos.com',    password: 'Hr@12345'  },
      candidate:  { email: 'alex@gmail.com',     password: 'Test@123'  },
    };
    setForm(creds[role]);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon" style={{ width: 42, height: 42, background: 'var(--brand)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎯</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--gray900)' }}>TalentOS</div>
            <div style={{ fontSize: 12, color: 'var(--gray500)' }}>Smart Recruitment Platform</div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray900)', marginBottom: 4 }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: 'var(--gray500)' }}>Sign in to your account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray500)', marginTop: 16 }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 500 }}>Register</Link>
        </p>

        {/* Demo login shortcuts */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--gray200)' }}>
          <div style={{ fontSize: 11, color: 'var(--gray400)', textAlign: 'center', marginBottom: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Demo Accounts</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['admin', 'hr_manager', 'candidate'].map((role) => (
              <button key={role} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: 11 }} onClick={() => fillDemo(role)}>
                {role.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
