import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsAPI } from '../services/api';
import { StatusBadge, ScoreBar, Spinner, EmptyState } from '../components/UI';

const PIPELINE_STEPS = ['applied','under_review','shortlisted','interview_scheduled','selected'];

export default function MyApplications() {
  const navigate  = useNavigate();
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsAPI.getAll().then((r) => setApps(r.data.applications)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:48 }}><Spinner size={32} /></div>;

  return (
    <div className="page-fade">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div style={{ fontWeight:600, fontSize:15 }}>My Applications</div>
          <div style={{ fontSize:12, color:'var(--gray400)' }}>{apps.length} application{apps.length !== 1 ? 's' : ''} submitted</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/jobs')}>Browse Jobs</button>
      </div>

      {apps.length === 0 && (
        <EmptyState
          icon="📋"
          title="No applications yet"
          subtitle="Find a role that matches your skills and apply today."
          action={<button className="btn btn-primary" onClick={() => navigate('/jobs')}>Browse Open Positions</button>}
        />
      )}

      {apps.map((app) => {
        const job = app.jobId || {};
        const stepIndex = PIPELINE_STEPS.indexOf(app.status);
        const isRejected = app.status === 'rejected';
        const isSelected = app.status === 'selected';

        return (
          <div key={app._id} className="card" style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div>
                <div style={{ fontWeight:600, fontSize:16 }}>{job.title}</div>
                <div style={{ fontSize:12, color:'var(--gray500)', marginTop:2 }}>{job.department} · {job.location}</div>
                <div style={{ fontSize:11, color:'var(--gray400)', marginTop:2 }}>Applied {new Date(app.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <StatusBadge status={app.status} />
                <div style={{ marginTop:6 }}><ScoreBar score={app.score} /></div>
              </div>
            </div>

            {/* Pipeline progress */}
            {!isRejected && (
              <div style={{ marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:0 }}>
                  {PIPELINE_STEPS.map((step, i) => {
                    const done    = isSelected ? true : i <= stepIndex;
                    const current = i === stepIndex && !isSelected;
                    return (
                      <React.Fragment key={step}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
                          <div style={{
                            width:20, height:20, borderRadius:'50%', marginBottom:4,
                            background: done ? 'var(--success)' : current ? 'var(--brand)' : 'var(--gray200)',
                            border: current ? '3px solid var(--brand-light)' : 'none',
                            display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff', fontWeight:700,
                          }}>
                            {done && !current ? '✓' : i+1}
                          </div>
                          <div style={{ fontSize:9, color: done?'var(--success)':current?'var(--brand)':'var(--gray400)', textAlign:'center', fontWeight: current?600:400, textTransform:'uppercase', letterSpacing:'0.03em' }}>
                            {step.replace(/_/g,' ')}
                          </div>
                        </div>
                        {i < PIPELINE_STEPS.length-1 && (
                          <div style={{ height:2, flex:1, background: i < stepIndex ? 'var(--success)' : 'var(--gray200)', marginBottom:20, position:'relative', top:-2 }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {isRejected && (
              <div className="alert alert-error" style={{ marginBottom:12 }}>
                ✗ Your application was not successful this time. Keep applying — the right role is out there!
              </div>
            )}
            {isSelected && (
              <div className="alert alert-success" style={{ marginBottom:12 }}>
                🎉 Congratulations! You have been selected for this position. HR will be in touch soon.
              </div>
            )}

            {/* Matched Skills */}
            {app.matchedSkills?.length > 0 && (
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:11, color:'var(--gray400)', marginBottom:4, fontWeight:600 }}>YOUR MATCHED SKILLS</div>
                {app.matchedSkills.map((s) => <span key={s} className="tag tag-match">{s}</span>)}
                {app.missingSkills?.length > 0 && app.missingSkills.map((s) => <span key={s} className="tag tag-miss">{s}</span>)}
              </div>
            )}

            <div style={{ display:'flex', gap:8, paddingTop:10, borderTop:'1px solid var(--gray100)' }}>
              <span style={{ fontSize:12, color:'var(--gray400)' }}>CV: {app.cvOriginalName || app.cvFile || 'Not uploaded'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
