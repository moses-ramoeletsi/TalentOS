import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../services/api';
import { ScoreBar, SkillTag, Avatar, Spinner, StatusBadge } from '../components/UI';

export default function AIRanking() {
  const navigate  = useNavigate();
  const [jobs, setJobs]         = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [ranked, setRanked]     = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading]   = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    jobsAPI.getAll().then((r) => {
      setJobs(r.data.jobs);
      if (r.data.jobs.length > 0) setSelectedJob(r.data.jobs[0]._id);
    }).finally(() => setJobsLoading(false));
  }, []);

  const runRanking = async () => {
    if (!selectedJob) return;
    setLoading(true);
    setAiSummary('');
    setRanked([]);
    try {
      const res = await applicationsAPI.getRanked(selectedJob);
      setRanked(res.data.applications);

      // Call Claude AI for summary
      const job = jobs.find((j) => j._id === selectedJob);
      const candidates = res.data.applications.slice(0, 5);
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [{
              role: 'user',
              content: `You are an expert HR assistant. Analyze these ranked candidates for the "${job?.title}" role requiring skills: ${job?.skills?.join(', ')}, ${job?.experience}+ years experience, qualification: ${job?.qualification}.

Top candidates:
${candidates.map((c, i) => `${i+1}. ${c.userId?.name} — Score: ${c.score}%, Matched: ${c.matchedSkills?.join(', ')}, Missing: ${c.missingSkills?.join(', ') || 'none'}`).join('\n')}

Provide a JSON response: {"summary": "2-3 sentence overall analysis of the candidate pool", "topPick": "name of best candidate and one-line reason", "warning": "any concern about the pool if applicable or empty string"}`
            }]
          })
        });
        const data = await response.json();
        const text = data.content?.map((b) => b.text || '').join('');
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
        setAiSummary(parsed);
      } catch (e) {
        setAiSummary({ summary: 'AI analysis unavailable. Rankings are based on skill matching, experience, and qualification scores.', topPick: ranked[0] ? `${ranked[0].userId?.name} has the highest match score.` : '', warning: '' });
      }
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const updateStatus = async (appId, status) => {
    await applicationsAPI.updateStatus(appId, { status });
    setRanked((prev) => prev.map((a) => a._id === appId ? { ...a, status } : a));
  };

  if (jobsLoading) return <div style={{ display:'flex', justifyContent:'center', padding:48 }}><Spinner size={32} /></div>;

  return (
    <div className="page-fade">
      <div className="ai-bubble" style={{ marginBottom: 20 }}>
        <div className="ai-header">
          <div className="ai-dot">🤖</div>
          <div className="ai-label">AI Candidate Ranking Engine</div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray700)' }}>
          Powered by Claude AI. Select a vacancy to automatically rank candidates by skill match, experience, and qualification. Get AI-generated insights and top pick recommendations.
        </div>
      </div>

      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:20, flexWrap:'wrap' }}>
        <select className="form-select" style={{ flex:1, maxWidth:360 }} value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
          {jobs.map((j) => <option key={j._id} value={j._id}>{j.title} ({j.department})</option>)}
        </select>
        <button className="btn btn-primary" onClick={runRanking} disabled={loading || !selectedJob}>
          {loading ? <><Spinner size={14} /> Analyzing...</> : '✨ Run AI Ranking'}
        </button>
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <div className="ai-bubble" style={{ marginBottom: 20 }}>
          <div className="ai-header"><div className="ai-dot">✨</div><div className="ai-label">AI Analysis Complete</div></div>
          <div style={{ fontSize: 13, color: 'var(--gray700)', lineHeight: 1.7, marginBottom: 8 }}>{aiSummary.summary}</div>
          {aiSummary.topPick && <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--success)' }}>⭐ Top Pick: {aiSummary.topPick}</div>}
          {aiSummary.warning && <div style={{ fontSize: 13, color: 'var(--warning)', marginTop: 6 }}>⚠️ {aiSummary.warning}</div>}
        </div>
      )}

      {/* Ranked List */}
      {loading && <div style={{ textAlign:'center', padding:48 }}><Spinner size={32} /><div style={{ fontSize:13, color:'var(--gray400)', marginTop:12 }}>Ranking candidates with AI...</div></div>}

      {!loading && ranked.length === 0 && selectedJob && (
        <div style={{ textAlign:'center', padding:48, color:'var(--gray400)', fontSize:13 }}>
          Click "Run AI Ranking" to analyse candidates for this vacancy.
        </div>
      )}

      {ranked.map((app, i) => {
        const job = jobs.find((j) => j._id === selectedJob);
        return (
          <div key={app._id} className="card" style={{ marginBottom: 12, border: i === 0 ? '2px solid var(--brand)' : '1px solid var(--gray200)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              {/* Rank badge */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: i === 0 ? 'var(--brand)' : i === 1 ? '#7C3AED' : i === 2 ? 'var(--success)' : 'var(--gray200)',
                color: i < 3 ? '#fff' : 'var(--gray600)',
                display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:15,
              }}>#{i+1}</div>

              <Avatar name={app.userId?.name} size={42} />

              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontWeight:600, fontSize:15 }}>{app.userId?.name}</span>
                  {i === 0 && <span className="badge badge-blue">⭐ Top Pick</span>}
                  <StatusBadge status={app.status} />
                </div>
                <div style={{ fontSize:12, color:'var(--gray500)', marginTop:2 }}>{app.userId?.email}</div>
              </div>

              <div style={{ textAlign:'center', flexShrink:0 }}>
                <div style={{ fontSize:26, fontWeight:700, color: app.score>=80?'var(--success)':app.score>=60?'var(--warning)':'var(--danger)' }}>{app.score}%</div>
                <div style={{ fontSize:10, color:'var(--gray400)' }}>match score</div>
              </div>
            </div>

            {/* Skill breakdown */}
            <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--gray100)' }}>
              <div style={{ display:'flex', gap:20, marginBottom:8, fontSize:11 }}>
                <span style={{ color:'var(--gray500)' }}>Skills: <strong style={{ color:'var(--gray800)' }}>{app.matchedSkills?.length}/{job?.skills?.length}</strong></span>
                <span style={{ color:'var(--gray500)' }}>Score breakdown: Skills {app.scoreBreakdown?.skillsScore}% · Exp {app.scoreBreakdown?.expScore}% · Qual {app.scoreBreakdown?.qualScore}%</span>
              </div>
              <div className="progress" style={{ height:8, marginBottom:8 }}>
                <div className={`progress-fill ${app.score>=80?'prog-green':app.score>=60?'prog-yellow':'prog-red'}`} style={{ width:`${app.score}%` }} />
              </div>
              <div>
                {job?.skills?.map((s) => (
                  <SkillTag key={s} skill={s} matched={app.matchedSkills?.includes(s)} missing={!app.matchedSkills?.includes(s)} />
                ))}
              </div>
            </div>

            <div style={{ marginTop:12, display:'flex', gap:8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/applicants/${app._id}`)}>View Profile</button>
              {['applied','under_review'].includes(app.status) && (
                <button className="btn btn-success btn-sm" onClick={() => updateStatus(app._id,'shortlisted')}>✓ Shortlist</button>
              )}
              {app.status === 'shortlisted' && (
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/interviews')}>📅 Schedule Interview</button>
              )}
              {!['rejected','selected'].includes(app.status) && (
                <button className="btn btn-danger btn-sm" onClick={() => updateStatus(app._id,'rejected')}>✗ Reject</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
