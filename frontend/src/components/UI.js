import React from 'react';

// ── Status Badge ─────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    applied:              'badge-gray',
    under_review:         'badge-yellow',
    shortlisted:          'badge-blue',
    interview_scheduled:  'badge-purple',
    selected:             'badge-green',
    rejected:             'badge-red',
    active:               'badge-green',
    closed:               'badge-gray',
    draft:                'badge-yellow',
    confirmed:            'badge-green',
    pending:              'badge-yellow',
    cancelled:            'badge-red',
    completed:            'badge-blue',
  };
  const label = status?.replace(/_/g, ' ') || '';
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{label}</span>;
}

// ── Score Bar ────────────────────────────────
export function ScoreBar({ score }) {
  const colorClass = score >= 80 ? 'prog-green' : score >= 60 ? 'prog-yellow' : 'prog-red';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="progress" style={{ width: 80 }}>
        <div className={`progress-fill ${colorClass}`} style={{ width: `${score}%` }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray700)' }}>{score}%</span>
    </div>
  );
}

// ── Avatar ───────────────────────────────────
export function Avatar({ name = '', size = 36 }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

// ── Spinner ──────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <div
      style={{
        width: size, height: size,
        border: '2px solid var(--gray200)',
        borderTopColor: 'var(--brand)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        display: 'inline-block',
      }}
    />
  );
}

// ── Alert ────────────────────────────────────
export function Alert({ type = 'info', children }) {
  return <div className={`alert alert-${type}`}>{children}</div>;
}

// ── Skill Tag ────────────────────────────────
export function SkillTag({ skill, matched, missing }) {
  const cls = matched ? 'tag-match' : missing ? 'tag-miss' : '';
  return <span className={`tag ${cls}`}>{matched ? '✓ ' : missing ? '✗ ' : ''}{skill}</span>;
}

// ── Empty State ──────────────────────────────
export function EmptyState({ icon = '📭', title, subtitle, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 600, color: 'var(--gray800)', marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: 'var(--gray500)', marginBottom: 16 }}>{subtitle}</div>}
      {action}
    </div>
  );
}

// ── Score Gauge (SVG circle) ─────────────────
export function ScoreGauge({ score }) {
  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';
  const dash = (score / 100) * 283;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="45" fill="none" stroke="var(--gray200)" strokeWidth="8" />
        <circle
          cx="55" cy="55" r="45" fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} 283`}
          strokeDashoffset="70"
          strokeLinecap="round"
        />
        <text x="55" y="50" textAnchor="middle" fontSize="20" fontWeight="700" fill={color}>{score}%</text>
        <text x="55" y="66" textAnchor="middle" fontSize="10" fill="var(--gray400)">match</text>
      </svg>
      <div style={{ fontSize: 12, fontWeight: 500, color }}>
        {score >= 80 ? 'Strong Match' : score >= 60 ? 'Partial Match' : 'Weak Match'}
      </div>
    </div>
  );
}
