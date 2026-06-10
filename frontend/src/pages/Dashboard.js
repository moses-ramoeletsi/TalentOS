import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI, applicationsAPI, interviewsAPI } from '../services/api';
import { StatusBadge, ScoreBar, Avatar, Spinner } from '../components/UI';

export default function Dashboard() {
  const navigate = useNavigate();
  const [overview, setOverview]     = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getOverview(),
      applicationsAPI.getAll({ limit: 5 }),
      interviewsAPI.getAll(),
    ]).then(([ov, apps, ints]) => {
      setOverview(ov.data.data);
      setRecentApps(apps.data.applications.slice(0, 5));
      setInterviews(ints.data.interviews.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding: 48 }}><Spinner size={32} /></div>;

  const stats = [
    { icon: '👥', label: 'Total Applicants',    value: overview?.totalApplicants   ?? 0, bg: '#EEF2FF', change: '↑ 18% this month', up: true },
    { icon: '✅', label: 'Shortlisted',          value: overview?.shortlisted        ?? 0, bg: '#ECFDF5', change: '↑ 8% this month',  up: true },
    { icon: '📅', label: 'Interviews Scheduled', value: overview?.scheduledInterviews?? 0, bg: '#FFFBEB', change: '↑ 3 this week',    up: true },
    { icon: '💼', label: 'Active Vacancies',     value: overview?.activeJobs         ?? 0, bg: '#F0FDF4', change: `Avg score: ${overview?.avgScore ?? 0}%`, up: false },
  ];

  return (
    <div className="page-fade">
      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-change ${s.up ? 'stat-up' : ''}`}>{s.change}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Recent Applications */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Recent Applications</div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/applicants')}>View All</button>
          </div>
          {recentApps.length === 0 && <div style={{ color:'var(--gray400)', fontSize:13, textAlign:'center', padding:24 }}>No applications yet.</div>}
          {recentApps.map((app) => (
            <div
              key={app._id}
              onClick={() => navigate(`/applicants/${app._id}`)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--gray100)', cursor:'pointer' }}
            >
              <Avatar name={app.userId?.name} size={36} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:500, fontSize:13 }}>{app.userId?.name}</div>
                <div style={{ fontSize:11, color:'var(--gray500)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{app.jobId?.title}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <StatusBadge status={app.status} />
                <div style={{ fontSize:11, color:'var(--gray400)', marginTop:2 }}>{new Date(app.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Interviews */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Upcoming Interviews</div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/interviews')}>View All</button>
          </div>
          {interviews.length === 0 && <div style={{ color:'var(--gray400)', fontSize:13, textAlign:'center', padding:24 }}>No interviews scheduled.</div>}
          {interviews.map((iv) => {
            const d = new Date(iv.date);
            return (
              <div key={iv._id} className="interview-card">
                <div className="date-box">
                  <div className="date-day">{d.getDate()}</div>
                  <div className="date-mon">{d.toLocaleString('en', { month:'short' })}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:500, fontSize:13 }}>{iv.candidateId?.name}</div>
                  <div style={{ fontSize:11, color:'var(--gray500)' }}>{iv.jobId?.title}</div>
                  <div style={{ display:'flex', gap:8, marginTop:6, alignItems:'center' }}>
                    <span className={`badge ${iv.type==='online'?'badge-blue':'badge-purple'}`}>{iv.type}</span>
                    <span style={{ fontSize:11, color:'var(--gray400)' }}>⏰ {iv.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ textAlign:'center', paddingTop:8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/interviews')}>+ Schedule Interview</button>
          </div>
        </div>
      </div>
    </div>
  );
}
