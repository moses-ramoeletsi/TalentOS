import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../services/api';
import { Spinner } from '../components/UI';

export default function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');
  const [cvFile, setCvFile]   = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    jobsAPI.getOne(id).then((r) => setJob(r.data.job)).finally(() => setLoading(false));
  }, [id]);

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) setCvFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cvFile) { setError('Please upload your CV.'); return; }
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      fd.append('jobId', id);
      fd.append('cv', cvFile);
      fd.append('coverLetter', coverLetter);
      await applicationsAPI.apply(fd);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed. Please try again.');
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:48 }}><Spinner size={32} /></div>;
  if (!job) return <div>Job not found.</div>;

  if (success) return (
    <div className="page-fade" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', paddingTop: 48 }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray900)', marginBottom: 8 }}>Application Submitted!</h2>
      <p style={{ fontSize: 14, color: 'var(--gray500)', lineHeight: 1.6, marginBottom: 24 }}>
        Your application for <strong>{job.title}</strong> has been received. We'll review your CV and get back to you soon.
      </p>
      <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
        <button className="btn btn-primary" onClick={() => navigate('/my-applications')}>View My Applications</button>
        <button className="btn btn-secondary" onClick={() => navigate('/jobs')}>Browse More Jobs</button>
      </div>
    </div>
  );

  return (
    <div className="page-fade" style={{ maxWidth: 640 }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/jobs')} style={{ marginBottom: 16 }}>← Back to Jobs</button>

      {/* Job Summary */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight:700, fontSize:17, marginBottom:4 }}>{job.title}</div>
        <div style={{ fontSize:12, color:'var(--gray500)', marginBottom:10 }}>{job.department} · {job.location} · {job.salary || 'Competitive'}</div>
        <p style={{ fontSize:13, color:'var(--gray600)', lineHeight:1.6, marginBottom:10 }}>{job.description}</p>
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:11, color:'var(--gray400)', fontWeight:600, marginBottom:4 }}>REQUIRED SKILLS</div>
          {job.skills?.map((s) => <span key={s} className="tag">{s}</span>)}
        </div>
        <div style={{ display:'flex', gap:16, fontSize:12, color:'var(--gray500)' }}>
          <span>⭐ {job.experience}+ years experience</span>
          <span>🎓 {job.qualification}</span>
          <span>📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Application Form */}
      <div className="card">
        <div style={{ fontWeight:600, fontSize:15, marginBottom:20 }}>Submit Your Application</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* CV Upload */}
          <div className="form-group">
            <label className="form-label">Upload CV / Resume * (PDF or DOCX, max 5MB)</label>
            <div
              className={`upload-area ${drag ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('cv-input').click()}
            >
              {cvFile ? (
                <div>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                  <div style={{ fontWeight:500, color:'var(--gray800)' }}>{cvFile.name}</div>
                  <div style={{ fontSize:12, color:'var(--gray400)', marginTop:4 }}>{(cvFile.size / 1024 / 1024).toFixed(2)} MB · Click to change</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>☁️</div>
                  <div style={{ fontWeight:500, color:'var(--gray700)', marginBottom:4 }}>Drag & drop your CV here</div>
                  <div style={{ fontSize:12, color:'var(--gray400)' }}>or click to browse · PDF, DOC, DOCX</div>
                </div>
              )}
            </div>
            <input id="cv-input" type="file" accept=".pdf,.doc,.docx" style={{ display:'none' }} onChange={(e) => setCvFile(e.target.files[0])} />
          </div>

          {/* Cover Letter */}
          <div className="form-group">
            <label className="form-label">Cover Letter (optional)</label>
            <textarea
              className="form-textarea"
              rows={5}
              placeholder="Tell us why you're a great fit for this role..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>

          <div className="ai-bubble" style={{ marginBottom:16 }}>
            <div className="ai-header"><div className="ai-dot">🤖</div><div className="ai-label">AI CV Parsing</div></div>
            <div style={{ fontSize:12, color:'var(--gray700)' }}>
              Your CV will be automatically parsed to extract your skills, experience, and qualifications. Our AI will then calculate your match score for this role.
            </div>
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={saving}>
            {saving ? 'Submitting Application...' : '🚀 Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
