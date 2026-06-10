import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationsAPI } from '../services/api';
import { StatusBadge, ScoreGauge, SkillTag, Avatar, Spinner, Alert } from '../components/UI';

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]       = useState('');

  useEffect(() => {
    applicationsAPI.getOne(id).then((r) => setApp(r.data.application)).finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status) => {
    await applicationsAPI.updateStatus(id, { status });
    setApp((a) => ({ ...a, status }));
    setMsg(`Status updated to "${status.replace(/_/g,' ')}"`);
    setTimeout(() => setMsg(''), 3000);
  };

  const downloadCV = async () => {
    const res = await applicationsAPI.downloadCV(id);
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url; a.download = app.cvOriginalName || 'cv.pdf'; a.click();
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:48 }}><Spinner size={32} /></div>;
  if (!app)    return <div>Application not found.</div>;

  const job = app.jobId || {};
  const user = app.userId || {};

  return (
    <div className="page-fade">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/applicants')} style={{ marginBottom:16 }}>← Back to Applicants</button>

      {msg && <Alert type="success">{msg}</Alert>}

      <div className="grid-2" style={{ marginBottom:16 }}>
        {/* Profile Card */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
            <Avatar name={user.name} size={56} />
            <div>
              <div style={{ fontWeight:700, fontSize:17 }}>{user.name}</div>
              <div style={{ fontSize:12, color:'var(--gray500)', marginTop:2 }}>{user.email} · {user.phone || 'N/A'}</div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, fontSize:12, marginBottom:14 }}>
            <div><span style={{ color:'var(--gray400)' }}>Status: </span><StatusBadge status={app.status} /></div>
            <div><span style={{ color:'var(--gray400)' }}>Applied: </span><strong>{new Date(app.createdAt).toLocaleDateString()}</strong></div>
          </div>
          {/* Parsed Skills */}
          {app.parsedData?.skills?.length > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:'var(--gray500)', marginBottom:6, fontWeight:600 }}>EXTRACTED SKILLS</div>
              {app.parsedData.skills.map((s) => <span key={s} className="tag">{s}</span>)}
            </div>
          )}
          {/* Cover Letter */}
          {app.coverLetter && (
            <div style={{ background:'var(--gray50)', borderRadius:8, padding:12, fontSize:13, color:'var(--gray600)', lineHeight:1.6 }}>
              <div style={{ fontSize:11, color:'var(--gray400)', marginBottom:4, fontWeight:600 }}>COVER LETTER</div>
              {app.coverLetter}
            </div>
          )}
          {/* CV download */}
          {app.cvFile && (
            <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--gray100)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, background:'var(--gray50)', padding:10, borderRadius:8 }}>
                <span style={{ fontSize:22 }}>📄</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500 }}>{app.cvOriginalName || app.cvFile}</div>
                  <div style={{ fontSize:11, color:'var(--gray400)' }}>CV Document</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={downloadCV}>Download</button>
              </div>
            </div>
          )}
        </div>

        {/* AI Score Card */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <div className="ai-dot">🤖</div>
            <div style={{ fontWeight:600 }}>AI Match Analysis</div>
            <span className="badge badge-blue" style={{ marginLeft:'auto' }}>{job.title}</span>
          </div>

          <div style={{ textAlign:'center', marginBottom:20 }}>
            <ScoreGauge score={app.score} />
          </div>

          {/* Matched skills */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:'var(--gray500)', marginBottom:6, fontWeight:600 }}>✅ MATCHED SKILLS ({app.matchedSkills?.length}/{job.skills?.length})</div>
            {app.matchedSkills?.map((s) => <SkillTag key={s} skill={s} matched />)}
          </div>
          {app.missingSkills?.length > 0 && (
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:'var(--gray500)', marginBottom:6, fontWeight:600 }}>❌ MISSING SKILLS</div>
              {app.missingSkills.map((s) => <SkillTag key={s} skill={s} missing />)}
            </div>
          )}

          {/* Score breakdown */}
          <div style={{ background:'var(--gray50)', borderRadius:8, padding:12 }}>
            <div style={{ fontSize:11, color:'var(--gray500)', marginBottom:8, fontWeight:600 }}>SCORING BREAKDOWN</div>
            {[
              { label:'Skills Match',  val: app.scoreBreakdown?.skillsScore ?? 0 },
              { label:'Experience',    val: app.scoreBreakdown?.expScore    ?? 0 },
              { label:'Qualification', val: app.scoreBreakdown?.qualScore   ?? 0 },
            ].map((row) => (
              <div key={row.label} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                  <span style={{ color:'var(--gray600)' }}>{row.label}</span>
                  <span style={{ fontWeight:500 }}>{row.val}%</span>
                </div>
                <div className="progress">
                  <div className={`progress-fill ${row.val>=80?'prog-green':row.val>=60?'prog-yellow':'prog-red'}`} style={{ width:`${row.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <div style={{ fontWeight:600, marginBottom:14 }}>Actions</div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {app.status === 'applied'       && <button className="btn btn-secondary" onClick={() => updateStatus('under_review')}>Mark Under Review</button>}
          {['applied','under_review'].includes(app.status) && <button className="btn btn-success" onClick={() => updateStatus('shortlisted')}>✓ Shortlist</button>}
          {app.status === 'shortlisted'   && <button className="btn btn-primary" onClick={() => navigate('/interviews')}>📅 Schedule Interview</button>}
          {!['selected','rejected'].includes(app.status) && <button className="btn btn-success" onClick={() => updateStatus('selected')}>🎉 Mark Selected</button>}
          {app.status !== 'rejected'      && <button className="btn btn-danger" onClick={() => updateStatus('rejected')}>✗ Reject</button>}
        </div>

        {/* AI insight */}
        <div className="ai-bubble" style={{ marginTop:16 }}>
          <div className="ai-header"><div className="ai-dot">✨</div><div className="ai-label">AI Recommendation</div></div>
          <div style={{ fontSize:13, color:'var(--gray700)', lineHeight:1.6 }}>
            {app.score >= 90
              ? `${user.name} is an exceptional candidate with all required skills. Highly recommend fast-tracking to final interview.`
              : app.score >= 80
              ? `${user.name} is a strong match. Their experience compensates for any minor skill gaps. Consider shortlisting.`
              : app.score >= 65
              ? `${user.name} shows potential but is missing: ${app.missingSkills?.join(', ')}. Consider for a junior-variant role.`
              : `${user.name} doesn't meet core requirements. Missing critical skills: ${app.missingSkills?.join(', ')}.`
            }
          </div>
        </div>
      </div>
    </div>
  );
}
