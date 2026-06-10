import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon" style={{ width: 42, height: 42, background: 'var(--brand)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎯</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>TalentOS</div>
            <div style={{ fontSize: 12, color: 'var(--gray500)' }}>Create your candidate account</div>
          </div>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Create Account</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Alex Johnson" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
            </div>
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray500)', marginTop: 16 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
