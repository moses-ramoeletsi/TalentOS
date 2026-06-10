import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobsAPI } from '../services/api';

const DEPTS = ['Engineering','Product','Design','Analytics','Marketing','Sales','HR','Operations','Finance'];
const QUALS = ['Any','Bachelor','Master','PhD'];

export default function PostJob() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = Boolean(id);

  const [form, setForm] = useState({
    title:'', department:'Engineering', description:'', requirements:'',
    location:'Remote', salary:'', deadline:'', skills:'',
    experience:0, qualification:'Bachelor', status:'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEdit) {
      jobsAPI.getOne(id).then((r) => {
        const j = r.data.job;
        setForm({ ...j, skills: j.skills?.join(', ') || '', deadline: j.deadline?.slice(0,10) || '' });
      });
    }
  }, [id]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = { ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean), experience: Number(form.experience) };
      if (isEdit) await jobsAPI.update(id, payload);
      else        await jobsAPI.create(payload);
      setSuccess(isEdit ? 'Job updated!' : 'Job posted successfully!');
      setTimeout(() => navigate('/jobs'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-fade" style={{ maxWidth: 680 }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/jobs')} style={{ marginBottom: 16 }}>← Back</button>
      <div className="card">
        <div style={{ fontWeight:600, fontSize:16, marginBottom:20 }}>{isEdit ? 'Edit Job Vacancy' : 'Post New Job Vacancy'}</div>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input className="form-input" placeholder="e.g. Senior React Developer" value={form.title} onChange={(e) => set('title', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select className="form-select" value={form.department} onChange={(e) => set('department', e.target.value)}>
                {DEPTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" placeholder="Remote / New York" value={form.location} onChange={(e) => set('location', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Salary Range</label>
              <input className="form-input" placeholder="$80k - $100k" value={form.salary} onChange={(e) => set('salary', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Application Deadline *</label>
              <input className="form-input" type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Min Experience (years)</label>
              <input className="form-input" type="number" min="0" max="20" value={form.experience} onChange={(e) => set('experience', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Min Qualification</label>
              <select className="form-select" value={form.qualification} onChange={(e) => set('qualification', e.target.value)}>
                {QUALS.map((q) => <option key={q}>{q}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Required Skills (comma-separated) *</label>
            <input className="form-input" placeholder="React, Node.js, MongoDB, TypeScript" value={form.skills} onChange={(e) => set('skills', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Job Description *</label>
            <textarea className="form-textarea" rows={4} placeholder="Describe the role and responsibilities..." value={form.description} onChange={(e) => set('description', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Requirements</label>
            <textarea className="form-textarea" rows={3} placeholder="List specific requirements..." value={form.requirements} onChange={(e) => set('requirements', e.target.value)} />
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/jobs')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Update Job' : '✓ Post Vacancy'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
