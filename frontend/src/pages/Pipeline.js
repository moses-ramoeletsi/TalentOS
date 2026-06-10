import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsAPI } from '../services/api';
import { StatusBadge, ScoreBar, Avatar, Spinner } from '../components/UI';

const STAGES = [
  { key: 'applied',             label: 'Applied',             color: '#6B7280' },
  { key: 'under_review',        label: 'Under Review',        color: '#D97706' },
  { key: 'shortlisted',         label: 'Shortlisted',         color: '#1B4FD8' },
  { key: 'interview_scheduled', label: 'Interview Scheduled', color: '#7C3AED' },
  { key: 'selected',            label: 'Selected',            color: '#059669' },
  { key: 'rejected',            label: 'Rejected',            color: '#DC2626' },
];

export default function Pipeline() {
  const navigate = useNavigate();
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsAPI.getAll()
      .then((r) => setApps(r.data.applications))
      .finally(() => setLoading(false));
  }, []);

  const byStage = (key) => apps.filter((a) => a.status === key);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:48 }}><Spinner size={32} /></div>;

  return (
    <div className="page-fade">
      {/* Summary bar */}
      <div className="card" style={{ marginBottom: 20, padding: 0 }}>
        <div style={{ display:'flex' }}>
          {STAGES.map((s, i) => {
            const count = byStage(s.key).length;
            return (
              <div
                key={s.key}
                onClick={() => navigate(`/applicants?status=${s.key}`)}
                style={{
                  flex: 1, padding: '14px 10px', cursor: 'pointer',
                  borderRight: i < STAGES.length - 1 ? '1px solid var(--gray200)' : 'none',
                  background: '#fff',
                  borderRadius: i === 0 ? 'var(--radius-lg) 0 0 var(--radius-lg)' : i === STAGES.length-1 ? '0 var(--radius-lg) var(--radius-lg) 0' : 0,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray50)'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                <div style={{ fontSize: 10, color: 'var(--gray500)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray900)' }}>{count}</div>
                <div style={{ height: 3, background: s.color, borderRadius: 2, marginTop: 8 }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Kanban board — 3 columns × 2 rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {STAGES.map((s) => {
          const cards = byStage(s.key);
          return (
            <div key={s.key}>
              <div className="kanban-header" style={{ marginBottom: 10 }}>
                <div className="kanban-dot" style={{ background: s.color }} />
                <span className="kanban-title">{s.label}</span>
                <span className="kanban-count">{cards.length}</span>
              </div>
              <div style={{ minHeight: 80 }}>
                {cards.length === 0 && (
                  <div style={{ border: '2px dashed var(--gray200)', borderRadius: 8, padding: '20px', textAlign: 'center', fontSize: 12, color: 'var(--gray300)' }}>
                    No candidates
                  </div>
                )}
                {cards.map((app) => (
                  <div
                    key={app._id}
                    className="kanban-card"
                    onClick={() => navigate(`/applicants/${app._id}`)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Avatar name={app.userId?.name} size={28} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{app.userId?.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--gray400)' }}>{app.jobId?.title}</div>
                      </div>
                    </div>
                    <ScoreBar score={app.score} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
