import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../services/api';
import { StatusBadge, ScoreBar, Avatar, Spinner } from '../components/UI';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob]   = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      jobsAPI.getOne(id),
      applicationsAPI.getAll({ jobId: id }),
    ]).then(([jRes, aRes]) => {
      setJob(jRes.data.job);
      setApps(aRes.data.applications);
    }).finally(() => setLoading(false));
  }, [id]);

  const deleteJob = async () => {
    if (!window.confirm('Delete this job? This cannot be undone.')) return;
    await jobsAPI.delete(id);
    navigate('/jobs');
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:48 }}><Spinner size={32} /></div>;
  if (!job)    return <div>Job not found.</div>;

  return (
    <div className="page-fade">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/jobs')} style={{ marginBottom:16 }}>← Back</button>

      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:20 }}>{job.title}</div>
            <div style={{ color:'var(--gray500)', fontSize:13, marginTop:4 }}>{job.department} · {job.location} · {job.salary || 'Undisclosed'}</div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <StatusBadge status={job.status} />
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/edit-job/${id}`)}>✏️ Edit</button>
            <button className="btn btn-danger btn-sm" onClick={deleteJob}>Delete</button>
          </div>
        </div>
        <p style={{ color:'var(--gray600)', fontSize:13, lineHeight:1.7, marginBottom:12 }}>{job.description}</p>
        {job.requirements && <p style={{ color:'var(--gray600)', fontSize:13, lineHeight:1.7, marginBottom:12 }}><strong>Requirements:</strong> {job.requirements}</p>}
        <div style={{ marginBottom:10 }}>
          <div style={{ fontSize:11, color:'var(--gray400)', fontWeight:600, marginBottom:6 }}>REQUIRED SKILLS</div>
          {job.skills?.map((s) => <span key={s} className="tag">{s}</span>)}
        </div>
        <div style={{ display:'flex', gap:20, paddingTop:12, borderTop:'1px solid var(--gray100)', fontSize:12, color:'var(--gray500)' }}>
          <span>👥 {job.applicantCount || apps.length} applicants</span>
          <span>⭐ Min {job.experience}y exp</span>
          <span>🎓 {job.qualification}</span>
          <span>📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
        </div>
      </div>

      <div style={{ fontWeight:600, marginBottom:12 }}>Candidates ({apps.length})</div>
      {apps.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px', color:'var(--gray400)', fontSize:13 }}>No applications yet for this job.</div>
      ) : (
        <div className="card" style={{ padding:0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Candidate</th><th>AI Score</th><th>Skills Match</th><th>Status</th><th>Applied</th><th>Action</th></tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <Avatar name={app.userId?.name} size={32} />
                        <div>
                          <div style={{ fontWeight:500 }}>{app.userId?.name}</div>
                          <div style={{ fontSize:11, color:'var(--gray400)' }}>{app.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><ScoreBar score={app.score} /></td>
                    <td>
                      {app.matchedSkills?.slice(0,3).map((s) => <span key={s} className="tag tag-match">{s}</span>)}
                      {app.missingSkills?.length > 0 && <span className="tag tag-miss">-{app.missingSkills.length}</span>}
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                    <td style={{ fontSize:12, color:'var(--gray500)' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-secondary btn-sm" onClick={() => navigate(`/applicants/${app._id}`)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
